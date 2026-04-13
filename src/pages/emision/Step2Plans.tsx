import { motion } from 'framer-motion';
import { Clock, Check, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmisionStore } from '@/stores/useEmisionStore';
import { plans, IVA_RATE } from '@/data/mockData';
import { mockAdvanceEmissionStep } from '@/mocks/emisionBackendMock';

const badgeColors: Record<string, string> = {
  'Más popular': 'var(--color-teal)',
  'Mejor valor': 'var(--color-gold)',
  'Máxima vigencia': 'var(--color-gold)',
};

export default function Step2Plans() {
  const navigate = useNavigate();
  const { selectedPlan, setSelectedPlan, setStep, setStepFromBackend, activeEmissionUuid, startEmission } = useEmisionStore();

  const handleContinue = async () => {
    if (!selectedPlan) return;
    const emissionUuid = activeEmissionUuid ?? startEmission();
    const response = await mockAdvanceEmissionStep({ emisionUuid: emissionUuid, nextStep: 3 });
    setStepFromBackend(response, 3, emissionUuid);
    const resolvedUuid = response.result.process_uuid ?? emissionUuid;
    navigate(`/emision/${resolvedUuid}`, { replace: true });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--color-white-primary)' }}>Elige la vigencia de tu firma</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-white-secondary)' }}>Selecciona el plan que mejor se adapte a tus necesidades</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {plans.map(p => {
          const selected = selectedPlan === p.id;
          return (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan(p.id)}
              className={`text-left p-6 relative ${selected ? 'glass-card-elevated' : 'glass-card'}`}
              style={selected ? { borderColor: 'var(--color-teal)', borderWidth: 2 } : {}}
            >
              {selected && <Check size={20} className="absolute top-4 right-4" style={{ color: 'var(--color-teal)' }} />}
              {p.badge && (
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-display font-semibold mb-3" style={{ background: badgeColors[p.badge] || 'var(--color-teal)', color: 'white' }}>
                  {p.badge}
                </span>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} style={{ color: 'var(--color-teal)' }} />
                <span className="font-display font-semibold" style={{ color: 'var(--color-teal)', fontSize: 'var(--text-base)' }}>{p.duration}</span>
              </div>
              <p className="font-display font-black text-4xl mb-1" style={{ color: 'var(--color-white-primary)' }}>${p.price.toFixed(2)}</p>
              <p className="text-xs mb-4" style={{ color: 'var(--color-white-muted)' }}>por certificado</p>
              <div className="space-y-2">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-white-secondary)' }}>
                    <Check size={14} style={{ color: 'var(--color-teal)' }} /> {f}
                  </div>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="glass-card p-4 mt-6 flex items-center gap-3">
        <ShieldCheck size={20} style={{ color: 'var(--color-teal)' }} />
        <p className="text-xs" style={{ color: 'var(--color-white-secondary)' }}>
          Todos los planes incluyen certificado digital emitido bajo la Ley de Comercio Electrónico del Ecuador (Ley No. 67) con plena validez legal.
        </p>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button onClick={() => setStep(1)} className="btn-ghost px-8 h-[48px]">← Anterior</button>
        <button onClick={handleContinue} disabled={!selectedPlan} className="btn-primary px-10 h-[52px]">Continuar →</button>
      </div>
    </div>
  );
}
