import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useEmisionStore } from '@/stores/useEmisionStore';
import { demoUser } from '@/data/mockData';

export default function Step9Confirmation() {
  const navigate = useNavigate();
  const { reset } = useEmisionStore();

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#00C9B1', '#F5A623', '#FFFFFF', 'rgba(255,255,255,0.6)'],
    });
  }, []);

  return (
    <div className="flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="glass-card-elevated w-full max-w-[560px] p-12 text-center"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(0,201,177,0.12)', border: '2px solid var(--color-teal)' }}
        >
          <CheckCircle2 size={48} style={{ color: 'var(--color-teal)' }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="font-display font-bold text-[28px] mb-3"
          style={{ color: 'var(--color-white-primary)' }}
        >
          ¡Proceso completado exitosamente!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm mb-8 leading-relaxed"
          style={{ color: 'var(--color-white-secondary)' }}
        >
          Muchas gracias, {demoUser.firstName}. Has completado el proceso de emisión de tu firma electrónica correctamente.
        </motion.p>

        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 text-left mb-8 space-y-3"
        >
          <h3 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--color-white-primary)' }}>Resumen de tu firma</h3>
          {[
            ['Titular', demoUser.name],
            ['Cédula', demoUser.cedula],
            ['Serial', 'EC-FE-2025-001847'],
            ['Vigencia', '1 año'],
            ['Estado', 'Activa'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-white-muted)' }}>{k}</span>
              <span className="font-medium" style={{ color: k === 'Estado' ? 'var(--color-teal)' : 'var(--color-white-primary)' }}>{v}</span>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="btn-primary w-full h-[52px] flex items-center justify-center gap-2">
            <Download size={18} /> Descargar certificado (.p12)
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { reset(); navigate('/mis-firmas'); }} className="btn-ghost h-[48px] flex items-center justify-center gap-2">
              <Eye size={16} /> Ver mis firmas
            </button>
            <button onClick={() => { reset(); navigate('/dashboard'); }} className="btn-ghost h-[48px] flex items-center justify-center gap-2">
              <ArrowRight size={16} /> Ir al inicio
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
