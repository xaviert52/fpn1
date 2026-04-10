import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recovery from "./pages/Recovery";
import Dashboard from "./pages/Dashboard";
import Emision from "./pages/Emision";
import MisFirmas from "./pages/MisFirmas";
import Renovacion from "./pages/Renovacion";
import Revocacion from "./pages/Revocacion";
import FirmarDocumentos from "./pages/FirmarDocumentos";
import VerificarDocumentos from "./pages/VerificarDocumentos";
import Reconciliacion from "./pages/Reconciliacion";
import Perfil from "./pages/Perfil";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" toastOptions={{ style: { background: 'rgba(15,22,40,0.9)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' } }} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/recuperar" element={<Recovery />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/emision" element={<Emision />} />
            <Route path="/renovacion" element={<Renovacion />} />
            <Route path="/revocacion" element={<Revocacion />} />
            <Route path="/mis-firmas" element={<MisFirmas />} />
            <Route path="/firmar" element={<FirmarDocumentos />} />
            <Route path="/verificar" element={<VerificarDocumentos />} />
            <Route path="/reconciliacion" element={<Reconciliacion />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
