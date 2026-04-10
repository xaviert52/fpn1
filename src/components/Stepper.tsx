import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEmisionStore } from '@/stores/useEmisionStore';

const steps = [
  'Tipo de persona', 'Duración y precio', 'Pago', 'Datos personales',
  'Registro Civil', 'Verificación OTP', 'Biometría', 'Clave certificado', 'Confirmación'
];

export default function Stepper() {
  const { currentStep } = useEmisionStore();

  return (
    <div className="w-full mb-8" role="navigation" aria-label="Progreso del proceso">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const done = currentStep > stepNum;
          const active = currentStep === stepNum;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-display font-bold relative"
                  style={{
                    background: done ? 'var(--color-teal)' : active ? 'rgba(0,201,177,0.2)' : 'rgba(255,255,255,0.06)',
                    color: done ? 'white' : active ? 'var(--color-teal)' : 'var(--color-white-muted)',
                    border: active ? '2px solid var(--color-teal)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: active ? '0 0 16px var(--color-teal-glow)' : 'none',
                  }}
                  animate={active ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {done ? <Check size={16} /> : stepNum}
                </motion.div>
                <span className="text-[10px] mt-1.5 text-center max-w-[80px] leading-tight" style={{ color: active ? 'var(--color-teal)' : 'var(--color-white-muted)' }}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-2" style={{ background: done ? 'var(--color-teal)' : 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
          );
        })}
      </div>
      {/* Mobile */}
      <div className="md:hidden flex items-center justify-center gap-3">
        <span className="font-display font-bold text-lg" style={{ color: 'var(--color-teal)' }}>Paso {currentStep}</span>
        <span className="text-sm" style={{ color: 'var(--color-white-muted)' }}>de {steps.length}</span>
      </div>
    </div>
  );
}
