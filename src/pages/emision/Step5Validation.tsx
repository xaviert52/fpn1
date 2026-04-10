import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import { useEmisionStore } from '@/stores/useEmisionStore';

const checks = [
  { text: 'Conectando con el Registro Civil...', delay: 0 },
  { text: 'Cédula verificada correctamente', delay: 1000 },
  { text: 'Datos personales confirmados', delay: 2000 },
];

export default function Step5Validation() {
  const { setStep } = useEmisionStore();
  const [progress, setProgress] = useState(0);
  const [visibleChecks, setVisibleChecks] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / 3000 * 100, 100));
      if (elapsed >= 3000) { clearInterval(iv); setTimeout(() => setStep(6), 400); }
    }, 50);
    checks.forEach((_, i) => setTimeout(() => setVisibleChecks(i + 1), checks[i].delay));
    return () => clearInterval(iv);
  }, [setStep]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-30 flex items-center justify-center"
      style={{ background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(40px)' }}
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        <motion.div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 animate-glow-pulse"
          style={{ background: 'rgba(0,201,177,0.12)' }}
        >
          <Shield size={40} style={{ color: 'var(--color-teal)' }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-bold text-2xl mb-2"
          style={{ color: 'var(--color-white-primary)' }}
        >
          Validando datos
        </motion.h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-white-secondary)' }}>
          Verificando información con el Registro Civil del Ecuador...
        </p>

        {/* Progress bar */}
        <div className="w-[280px] h-1 rounded-full overflow-hidden mb-8" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00C9B1, #0A4FD4)', width: `${progress}%` }}
          />
        </div>

        {/* Status items */}
        <div className="space-y-3 w-full">
          <AnimatePresence>
            {checks.slice(0, visibleChecks).map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                {i === 0 && visibleChecks === 1 ? (
                  <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-teal)' }} />
                ) : (
                  <CheckCircle size={18} style={{ color: 'var(--color-teal)' }} />
                )}
                <span className="text-sm" style={{ color: 'var(--color-white-secondary)' }}>{c.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
