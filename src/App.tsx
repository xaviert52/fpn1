import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Recovery from './pages/Recovery';
import Dashboard from './pages/Dashboard';
import Emision from './pages/Emision';
import MisFirmas from './pages/MisFirmas';
import Renovacion from './pages/Renovacion';
import Revocacion from './pages/Revocacion';
import FirmarDocumentos from './pages/FirmarDocumentos';
import VerificarDocumentos from './pages/VerificarDocumentos';
import Reconciliacion from './pages/Reconciliacion';
import Perfil from './pages/Perfil';
import DashboardLayout from './components/layout/DashboardLayout';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, isBootstrapping, bootstrap } = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-dark)' }}>
        <span className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/invitacion" element={<Navigate to="/registro" replace />} />
      <Route path="/recuperar" element={<Recovery />} />

      <Route
        element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/emision" element={<Emision />} />
        <Route path="/emision/:emisionUuid" element={<Emision />} />
        <Route path="/renovacion" element={<Renovacion />} />
        <Route path="/revocacion" element={<Revocacion />} />
        <Route path="/mis-firmas" element={<MisFirmas />} />
        <Route path="/firmar" element={<FirmarDocumentos />} />
        <Route path="/verificar" element={<VerificarDocumentos />} />
        <Route path="/reconciliacion" element={<Reconciliacion />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,22,40,0.9)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
