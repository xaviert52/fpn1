import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, RefreshCw, ShieldOff, Award, FileSignature,
  CheckCircle, GitMerge, User, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

const navGroups = [
  {
    label: 'Gestión de firma',
    items: [
      { icon: Zap, label: 'Nueva Firma', path: '/emision', activeColor: '#FF4C2B' },
      { icon: RefreshCw, label: 'Renovar Firma', path: '/renovacion', activeColor: '#FF4C2B' },
      { icon: ShieldOff, label: 'Revocar Firma', path: '/revocacion', activeColor: '#FF4C2B' },
    ],
  },
  {
    label: 'Documentos',
    items: [
      { icon: Award, label: 'Mis Firmas', path: '/mis-firmas', activeColor: '#00C9B1' },
      { icon: FileSignature, label: 'Firmar Documentos', path: '/firmar', activeColor: '#00C9B1' },
      { icon: CheckCircle, label: 'Verificar Documentos', path: '/verificar', activeColor: '#00C9B1' },
      { icon: GitMerge, label: 'Reconciliación', path: '/reconciliacion', activeColor: '#00C9B1' },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { icon: User, label: 'Mi Perfil', path: '/perfil', activeColor: 'rgba(255,255,255,0.95)' },
    ],
  },
];

export default function Sidebar() {
  const { sidebarExpanded, toggleSidebar } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.aside
      className="glass-sidebar fixed left-0 top-[64px] z-40 flex flex-col"
      style={{ height: 'calc(100vh - 64px)' }}
      animate={{ width: sidebarExpanded ? 240 : 72 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Menú principal">
        {navGroups.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <div className="my-3 mx-2 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />}
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="block px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-white-muted)' }}
                >
                  {group.label}
                </motion.span>
              )}
            </AnimatePresence>
            {group.items.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`sidebar-item w-full ${isActive ? 'active' : ''}`}
                  style={isActive ? { color: item.activeColor, borderLeftColor: item.activeColor, background: `${item.activeColor}1F` } : {}}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                >
                  <item.icon size={20} />
                  <AnimatePresence>
                    {sidebarExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <button
        onClick={toggleSidebar}
        className="p-3 mx-3 mb-4 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
        style={{ color: 'var(--color-white-muted)' }}
        aria-label={sidebarExpanded ? 'Colapsar menú' : 'Expandir menú'}
      >
        {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </motion.aside>
  );
}
