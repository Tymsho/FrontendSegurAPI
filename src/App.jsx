import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Páginas de Autenticación
import Login from './pages/Login';
// Registro público y verificación temporalmente redirigidos para validación cerrada
// import Registro from './pages/Registro';
// import Verificar from './pages/Verificar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Polizas from './pages/Polizas';
import Reportes from './pages/Reportes';
import UsuariosAdmin from './pages/UsuariosAdmin';
import Perfil from './pages/Perfil';

import { Toaster } from './components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            <Toaster richColors position="top-right" />
            <BrowserRouter>
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Navigate to="/login" replace />} />
              <Route path="/verificar" element={<Navigate to="/login" replace />} />
              
              {/* Rutas Protegidas bajo ProtectedRoute */}
              <Route element={<ProtectedRoute />}>
                {/* El MainLayout envuelve las rutas que comparten la estructura visual */}
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/polizas" element={<Polizas />} />
                  <Route path="/reportes" element={<Reportes />} />
                  <Route path="/usuarios" element={<UsuariosAdmin />} />
                  <Route path="/perfil" element={<Perfil />} />
                </Route>
              </Route>
              
              {/* Redirección por defecto */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
