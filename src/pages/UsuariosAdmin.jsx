import { useState, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import {
  getUsuarios,
  crearProductorAdmin,
  cambiarEstadoUsuario,
  resetearPasswordUsuario
} from '../services/usuarioService';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  UserPlus,
  KeyRound,
  UserCheck,
  UserX,
  Search,
  ShieldCheck,
  Briefcase,
  Users,
  ShieldAlert
} from 'lucide-react';

const UsuariosAdmin = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ nombre: '', email: '', password: '' });
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // 1. Fetching de usuarios
  const { data: usuarios = [], isLoading, isError } = useQuery({
    queryKey: ['usuarios-admin'],
    queryFn: getUsuarios,
  });

  // 2. Mutación: Crear Productor
  const createMutation = useMutation({
    mutationFn: (data) => crearProductorAdmin(data),
    onSuccess: (data) => {
      toast.success(`Productor "${data.nombre}" creado y activado exitosamente`);
      setIsCreateOpen(false);
      setCreateForm({ nombre: '', email: '', password: '' });
      queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al crear el productor.';
      toast.error(msg);
    }
  });

  // 3. Mutación: Cambiar Estado
  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, activo }) => cambiarEstadoUsuario(id, activo),
    onSuccess: (updatedUser) => {
      const estadoStr = updatedUser.activo ? 'activada' : 'desactivada';
      toast.success(`Cuenta de "${updatedUser.nombre}" ${estadoStr} correctamente`);
      queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al modificar el estado de la cuenta.';
      toast.error(msg);
    }
  });

  // 4. Mutación: Resetear Password
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }) => resetearPasswordUsuario(id, password),
    onSuccess: () => {
      toast.success(`Contraseña de "${selectedUserForPassword?.nombre}" actualizada exitosamente`);
      setIsPasswordModalOpen(false);
      setSelectedUserForPassword(null);
      setNewPassword('');
      queryClient.invalidateQueries({ queryKey: ['usuarios-admin'] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Error al resetear la contraseña.';
      toast.error(msg);
    }
  });

  // Handlers
  const handleOpenCreate = () => {
    setCreateForm({ nombre: '', email: '', password: '' });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!createForm.nombre.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }
    if (createForm.password.trim().length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    createMutation.mutate(createForm);
  };

  const handleOpenPasswordModal = (usuario) => {
    setSelectedUserForPassword(usuario);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    resetPasswordMutation.mutate({
      id: selectedUserForPassword.id,
      password: newPassword.trim()
    });
  };

  const handleToggleEstado = (usuario) => {
    const isSelf = currentUser && (
      (currentUser.id && currentUser.id === usuario.id) ||
      (currentUser.email && currentUser.email.toLowerCase() === usuario.email.toLowerCase())
    );

    if (isSelf) {
      toast.error('No puedes desactivar tu propia cuenta de administrador.');
      return;
    }

    toggleEstadoMutation.mutate({
      id: usuario.id,
      activo: !usuario.activo
    });
  };

  // Filtrado de usuarios
  const filteredUsuarios = useMemo(() => {
    if (!searchTerm.trim()) return usuarios;
    const term = searchTerm.toLowerCase();
    return usuarios.filter((u) =>
      u.nombre?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.rol?.toLowerCase().includes(term) ||
      u.plan?.toLowerCase().includes(term)
    );
  }, [usuarios, searchTerm]);

  // Resumen de usuarios
  const stats = useMemo(() => {
    const total = usuarios.length;
    const activos = usuarios.filter((u) => u.activo).length;
    const productores = usuarios.filter((u) => u.rol === 'PRODUCTOR').length;
    const admins = usuarios.filter((u) => u.rol === 'ADMIN').length;
    return { total, activos, productores, admins };
  }, [usuarios]);

  return (
    <div className="space-y-6">
      {/* Encabezado y Acción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestión de Usuarios
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Alta directa de productores, control de accesos y blanqueo de credenciales
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 shadow-xs cursor-pointer transition-all duration-150 active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nuevo Productor</span>
        </Button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-card border-border p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Usuarios</p>
          <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">{stats.total}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-xs font-medium text-muted-foreground">Cuentas Activas</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{stats.activos}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-xs font-medium text-muted-foreground">Productores</p>
          <p className="text-2xl font-bold text-sky-400 mt-1 tabular-nums">{stats.productores}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-xs font-medium text-muted-foreground">Administradores</p>
          <p className="text-2xl font-bold text-purple-400 mt-1 tabular-nums">{stats.admins}</p>
        </Card>
      </div>

      {/* Tabla Principal */}
      <Card className="bg-card border-border rounded-xl shadow-xs">
        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Lista de Usuarios Registrados</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {filteredUsuarios.length} de {usuarios.length} cuentas registradas
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs bg-background/80"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/80">
                  <TableHead className="w-[300px]">Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center text-muted-foreground text-sm">
                      <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                        <ShieldAlert className="h-6 w-6" />
                        <span>Error al cargar la lista de usuarios. Verifica permisos de administrador.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-36 text-center text-muted-foreground text-sm">
                      {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda.' : 'No hay usuarios registrados.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((u) => {
                    const isSelf = currentUser && (
                      (currentUser.id && currentUser.id === u.id) ||
                      (currentUser.email && currentUser.email.toLowerCase() === u.email?.toLowerCase())
                    );
                    const initial = u.nombre ? u.nombre.charAt(0).toUpperCase() : (u.email ? u.email.charAt(0).toUpperCase() : 'U');

                    return (
                      <TableRow key={u.id} className="border-border/60 hover:bg-muted/40 transition-colors">
                        {/* Usuario */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs bg-primary/10 text-primary border border-primary/20 shrink-0">
                              {initial}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-foreground text-sm truncate flex items-center gap-1.5">
                                {u.nombre || 'Sin nombre'}
                                {isSelf && (
                                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                                    Tú
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Rol */}
                        <TableCell>
                          {u.rol === 'ADMIN' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <ShieldCheck className="w-3 h-3" /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              <Briefcase className="w-3 h-3" /> Productor
                            </span>
                          )}
                        </TableCell>

                        {/* Plan */}
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase bg-muted text-foreground border border-border">
                            {u.plan || 'BASICO'}
                          </span>
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          {u.activo ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                              Inactivo
                            </span>
                          )}
                        </TableCell>

                        {/* Acciones */}
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Cambiar Clave */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPasswordModal(u)}
                              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border-border hover:bg-card cursor-pointer"
                              title="Blanquear contraseña"
                            >
                              <KeyRound className="h-3.5 w-3.5 mr-1 text-amber-400" />
                              <span>Clave</span>
                            </Button>

                            {/* Activar / Desactivar */}
                            <Button
                              variant={u.activo ? "ghost" : "outline"}
                              size="sm"
                              disabled={isSelf || toggleEstadoMutation.isPending}
                              onClick={() => handleToggleEstado(u)}
                              className={`h-8 px-2.5 text-xs cursor-pointer transition-all ${
                                isSelf
                                  ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                                  : u.activo
                                    ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                                    : 'text-emerald-400 hover:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10'
                              }`}
                              title={
                                isSelf
                                  ? 'No puedes desactivar tu propia cuenta'
                                  : u.activo
                                    ? 'Desactivar acceso a este usuario'
                                    : 'Activar acceso a este usuario'
                              }
                            >
                              {u.activo ? (
                                <>
                                  <UserX className="h-3.5 w-3.5 mr-1" />
                                  <span>Desactivar</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                                  <span>Activar</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal 1: Alta Directa de Productor */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5 text-primary" />
              Nuevo Productor
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              La cuenta se creará activada de inmediato con rol Productor y plan Básico.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-nombre" className="text-xs">Nombre completo</Label>
              <Input
                id="create-nombre"
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={createForm.nombre}
                onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                className="bg-background text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-email" className="text-xs">Correo Electrónico</Label>
              <Input
                id="create-email"
                type="email"
                required
                placeholder="juan.perez@seguros.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="bg-background text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-password" className="text-xs">Contraseña inicial</Label>
              <Input
                id="create-password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="bg-background text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                El productor podrá ingresar de inmediato con esta contraseña.
              </p>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-border"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="cursor-pointer"
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Productor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Cambiar Contraseña */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-amber-400" />
              Cambiar Contraseña
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Establecer una nueva contraseña de acceso para {selectedUserForPassword?.nombre} ({selectedUserForPassword?.email}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="reset-password" className="text-xs">Nueva Contraseña</Label>
              <Input
                id="reset-password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background text-sm"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                La contraseña anterior será reemplazada inmediatamente.
              </p>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                className="border-border"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="cursor-pointer"
              >
                {resetPasswordMutation.isPending ? 'Actualizando...' : 'Guardar Contraseña'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsuariosAdmin;
