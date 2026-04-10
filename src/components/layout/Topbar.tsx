import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { AnimatePresence, motion } from 'framer-motion';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/emision': 'Nueva Firma',
  '/renovacion': 'Renovar Firma',
  '/revocacion': 'Revocar Firma',
  '/mis-firmas': 'Mis Firmas',
  '/firmar': 'Firmar Documentos',
  '/verificar': 'Verificar Documentos',
  '/reconciliacion': 'Reconciliación',
  '/perfil': 'Mi Perfil',
};

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLabel = breadcrumbMap[location.pathname] || 'PrimeCORE';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="glass-topbar sticky top-0 z-50 h-16 flex items-center px-6 gap-4" role="banner">
      {/* Logo */}
      <img
        src="https://primecore.lat/image/marko-logo-dark.png"
        alt="PrimeCORE"
        className="h-8 w-auto cursor-pointer"
        onClick={() => navigate('/dashboard')}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 ml-4">
        <span style={{ color: 'var(--color-white-muted)', fontSize: 'var(--text-sm)' }}>/</span>
        <span className="font-display font-semibold" style={{ color: 'var(--color-white-primary)', fontSize: 'var(--text-sm)' }}>
          {currentLabel}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifications */}
      <button
        className="relative p-2 rounded-xl transition-colors hover:bg-white/5"
        aria-label="Notificaciones"
      >
        <Bell size={20} style={{ color: 'var(--color-white-secondary)' }} />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal" />
      </button>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl transition-colors hover:bg-white/5"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #00C9B1, #0A4FD4)', color: 'white' }}
          >
            {user?.initials || 'GM'}
          </div>
          <span className="hidden md:block text-sm" style={{ color: 'var(--color-white-secondary)' }}>
            {user?.name || 'Gerald Moreno'}
          </span>
          <ChevronDown size={16} style={{ color: 'var(--color-white-muted)' }} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card absolute right-0 top-14 w-52 py-2"
            >
              <button
                onClick={() => { setMenuOpen(false); navigate('/perfil'); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors hover:bg-white/5"
                style={{ color: 'var(--color-white-secondary)' }}
              >
                <User size={16} /> Mi Perfil
              </button>
              <button
                onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors hover:bg-white/5"
                style={{ color: '#FF4C2B' }}
              >
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
