import { motion } from 'framer-motion';
import { Award, Clock, FileCheck, ShieldOff, Zap, FileSignature, Eye, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirmasStore } from '@/stores/useFirmasStore';
import { actividadReciente, demoUser } from '@/data/mockData';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

const iconMap: Record<string, React.ElementType> = { Award, FileSignature, CheckCircle };

const quickActions = [
  { label: 'Obtener nueva firma', icon: Zap, path: '/emision', color: '#FF4C2B' },
  { label: 'Firmar un documento', icon: FileSignature, path: '/firmar', color: '#00C9B1' },
  { label: 'Ver mis firmas', icon: Eye, path: '/mis-firmas', color: '#00C9B1' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { firmas, documentosFirmados, firmasRevocadas } = useFirmasStore();
  const activas = firmas.filter(f => f.estado === 'activa').length;
  const porVencer = firmas.filter(f => f.estado === 'por_vencer').length;

  const kpis = [
    { label: 'Firmas activas', value: activas, icon: Award, color: '#00C9B1' },
    { label: 'Por vencer (30d)', value: porVencer, icon: Clock, color: '#F5A623' },
    { label: 'Docs firmados', value: documentosFirmados, icon: FileCheck, color: 'rgba(255,255,255,0.95)' },
    { label: 'Firmas revocadas', value: firmasRevocadas, icon: ShieldOff, color: '#FF4C2B' },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="font-display font-bold text-[32px]" style={{ color: 'var(--color-white-primary)' }}>
          {getGreeting()}, {demoUser.firstName} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-white-secondary)' }}>
          Aquí tienes un resumen de tus firmas y actividad reciente
        </p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${k.color}1A` }}>
              <k.icon size={22} style={{ color: k.color }} />
            </div>
            <div>
              <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-white-primary)' }}>{k.value}</p>
              <p className="text-xs" style={{ color: 'var(--color-white-muted)' }}>{k.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-lg mb-4" style={{ color: 'var(--color-white-primary)' }}>¿Qué deseas hacer hoy?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map(a => (
            <button
              key={a.path}
              onClick={() => navigate(a.path)}
              className="glass-card p-5 flex items-center gap-4 text-left transition-all duration-300 hover:scale-[1.02] hover:border-opacity-30"
              style={{ borderColor: a.color }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${a.color}1A` }}>
                <a.icon size={20} style={{ color: a.color }} />
              </div>
              <span className="font-display font-medium text-sm" style={{ color: 'var(--color-white-primary)' }}>{a.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item}>
        <h2 className="font-display font-semibold text-lg mb-4" style={{ color: 'var(--color-white-primary)' }}>Actividad reciente</h2>
        <div className="glass-card divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {actividadReciente.map((a, i) => {
            const Icon = iconMap[a.icon] || CheckCircle;
            return (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,201,177,0.1)' }}>
                  <Icon size={18} style={{ color: 'var(--color-teal)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: 'var(--color-white-primary)' }}>{a.text}</p>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-white-muted)' }}>{a.time}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
