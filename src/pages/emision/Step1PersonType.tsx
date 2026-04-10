import { motion } from 'framer-motion';
import { User, Building2 } from 'lucide-react';
import { useEmisionStore } from '@/stores/useEmisionStore';
import type { PersonType } from '@/stores/useEmisionStore';

const options: { type: PersonType; icon: React.ElementType; title: string; desc: string }[] = [
  { type: 'natural', icon: User, title: 'Persona Natural', desc: 'Para personas físicas que requieren firma electrónica a título personal' },
  { type: 'juridica', icon: Building2, title: 'Persona Jurídica', desc: 'Para empresas, sociedades y organizaciones que requieren firma electrónica corporativa' },
];

export default function Step1PersonType() {
  const { personType, setPersonType, setStep } = useEmisionStore();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--color-white-primary)' }}>¿Para quién es la firma?</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-white-secondary)' }}>Selecciona el tipo de persona para comenzar el proceso de emisión</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map(o => (
          <motion.button
            key={o.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPersonType(o.type)}
            className={`text-left p-8 transition-all ${personType === o.type ? 'glass-card-elevated' : 'glass-card'}`}
            style={personType === o.type ? { borderColor: 'var(--color-teal)', borderWidth: 2 } : {}}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: personType === o.type ? 'rgba(0,201,177,0.15)' : 'rgba(255,255,255,0.06)' }}>
              <o.icon size={28} style={{ color: personType === o.type ? 'var(--color-teal)' : 'var(--color-white-secondary)' }} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--color-white-primary)' }}>{o.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-white-secondary)' }}>{o.desc}</p>
          </motion.button>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <button onClick={() => personType && setStep(2)} disabled={!personType} className="btn-primary px-10 h-[52px]">
          Continuar →
        </button>
      </div>
    </div>
  );
}
