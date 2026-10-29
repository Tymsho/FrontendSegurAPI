import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../context/AuthContext';
import UsuariosAdmin from './UsuariosAdmin';
import * as usuarioService from '../services/usuarioService';

vi.mock('../services/usuarioService', () => ({
  getUsuarios: vi.fn(),
  crearProductorAdmin: vi.fn(),
  cambiarEstadoUsuario: vi.fn(),
  resetearPasswordUsuario: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUsuarios = [
  {
    id: 1,
    nombre: 'Admin Master',
    email: 'admin@mail.com',
    rol: 'ADMIN',
    activo: true,
    plan: 'PREMIUM'
  },
  {
    id: 2,
    nombre: 'Carlos Productor',
    email: 'carlos@mail.com',
    rol: 'PRODUCTOR',
    activo: true,
    plan: 'BASICO'
  },
  {
    id: 3,
    nombre: 'Inactivo User',
    email: 'inactivo@mail.com',
    rol: 'PRODUCTOR',
    activo: false,
    plan: 'BASICO'
  }
];

const renderWithContext = (ui, currentUser = { id: 1, email: 'admin@mail.com', rol: 'ADMIN', nombre: 'Admin Master' }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user: currentUser }}>
        {ui}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('UsuariosAdmin Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usuarioService.getUsuarios.mockResolvedValue(mockUsuarios);
  });

  it('renders users list, role badges, plans, and metrics', async () => {
    renderWithContext(<UsuariosAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Admin Master')).toBeInTheDocument();
      expect(screen.getByText('Carlos Productor')).toBeInTheDocument();
      expect(screen.getByText('Inactivo User')).toBeInTheDocument();
    });

    // Check roles
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Productor').length).toBeGreaterThanOrEqual(1);

    // Check status badges
    expect(screen.getAllByText('Activo').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();

    // Check current user row indicator
    expect(screen.getByText('Tú')).toBeInTheDocument();
  });

  it('filters users by search term', async () => {
    renderWithContext(<UsuariosAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Productor')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
    fireEvent.change(searchInput, { target: { value: 'carlos' } });

    expect(screen.getByText('Carlos Productor')).toBeInTheDocument();
    expect(screen.queryByText('Inactivo User')).not.toBeInTheDocument();
  });

  it('disables self-deactivation button on current user row', async () => {
    renderWithContext(<UsuariosAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Admin Master')).toBeInTheDocument();
    });

    const desactivarButtons = screen.getAllByRole('button', { name: /Desactivar/i });
    // First button belongs to Admin Master (current user) and should be disabled
    expect(desactivarButtons[0]).toBeDisabled();
    // Second button belongs to Carlos Productor and should not be disabled
    expect(desactivarButtons[1]).not.toBeDisabled();
  });

  it('toggles user status when button clicked', async () => {
    usuarioService.cambiarEstadoUsuario.mockResolvedValue({
      id: 2,
      nombre: 'Carlos Productor',
      email: 'carlos@mail.com',
      rol: 'PRODUCTOR',
      activo: false,
      plan: 'BASICO'
    });

    renderWithContext(<UsuariosAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Productor')).toBeInTheDocument();
    });

    const desactivarButtons = screen.getAllByRole('button', { name: /Desactivar/i });
    fireEvent.click(desactivarButtons[1]);

    await waitFor(() => {
      expect(usuarioService.cambiarEstadoUsuario).toHaveBeenCalledWith(2, false);
    });
  });

  it('opens and submits modal to create new producer', async () => {
    usuarioService.crearProductorAdmin.mockResolvedValue({
      id: 4,
      nombre: 'Nuevo Productor',
      email: 'nuevo@mail.com',
      rol: 'PRODUCTOR',
      activo: true,
      plan: 'BASICO'
    });

    renderWithContext(<UsuariosAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Nuevo Productor')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Nuevo Productor/i }));

    expect(screen.getByText('La cuenta se creará activada de inmediato con rol Productor y plan Básico.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nombre completo/i), { target: { value: 'Nuevo Productor' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'nuevo@mail.com' } });
    fireEvent.change(screen.getByLabelText(/Contraseña inicial/i), { target: { value: 'clave123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Crear Productor' }));

    await waitFor(() => {
      expect(usuarioService.crearProductorAdmin).toHaveBeenCalledWith({
        nombre: 'Nuevo Productor',
        email: 'nuevo@mail.com',
        password: 'clave123'
      });
    });
  });

  it('opens and submits modal to change password', async () => {
    usuarioService.resetearPasswordUsuario.mockResolvedValue({ message: 'Contraseña actualizada' });

    renderWithContext(<UsuariosAdmin />);

    await waitFor(() => {
      expect(screen.getByText('Carlos Productor')).toBeInTheDocument();
    });

    const claveButtons = screen.getAllByRole('button', { name: /Clave/i });
    fireEvent.click(claveButtons[1]);

    expect(screen.getByText(/Establecer una nueva contraseña de acceso para Carlos Productor/i)).toBeInTheDocument();

    const newPasswordInput = screen.getByLabelText(/Nueva Contraseña/i);
    fireEvent.change(newPasswordInput, { target: { value: 'nuevaClave123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Guardar Contraseña' }));

    await waitFor(() => {
      expect(usuarioService.resetearPasswordUsuario).toHaveBeenCalledWith(2, 'nuevaClave123');
    });
  });
});
