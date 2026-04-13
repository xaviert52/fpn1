import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, AlertTriangle, Info, Eye, EyeOff, Check, X } from 'lucide-react';
import { useEmisionStore } from '@/stores/useEmisionStore';
import { mockAdvanceEmissionStep } from '@/mocks/emisionBackendMock';
import { toast } from 'sonner';

const reqs = [
  { label: 'Mínimo 8 caracteres', test: (pw: string) => pw.length >= 8 },
  { label: 'Al menos una mayúscula', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Al menos un número', test: (pw: string) => /\d/.test(pw) },
  { label: 'Al menos un carácter especial (!@#$%)', test: (pw: string) => /[!@#$%^&*]/.test(pw) },
];

function getStrength(pw: string) {
  if (!pw) return -1;
  const passed = reqs.filter(r => r.test(pw)).length;
  return Math.max(passed - 1, 0);
}

const levels = [
  { label: 'Muy débil', color: '#EF4444' },
  { label: 'Débil', color: '#F5A623' },
  { label: 'Regular', color: '#F5A623' },
  { label: 'Fuerte', color: '#00C9B1' },
];

export default function Step8Key() {
  const { setStepFromBackend, setCertificateKeySet, activeEmissionUuid, startEmission } = useEmisionStore();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(pw);
  const match = confirm.length > 0 && pw === confirm;
  const mismatch = confirm.length > 0 && pw !== confirm;
  const allPassed = reqs.every(r => r.test(pw));
  const valid = allPassed && match;

  const handleFinish = () => {
    if (!valid) return;
    setLoading(true);
    setTimeout(async () => {
      setCertificateKeySet(true);
      toast.success('Certificado generado correctamente');
      const emissionUuid = activeEmissionUuid ?? startEmission();
      const response = await mockAdvanceEmissionStep({ emisionUuid: emissionUuid, nextStep: 9 });
      setStepFromBackend(response, 9, emissionUuid);
    }, 2500);
  };

  return (
    <div className="flex justify-center">
      <div className="glass-card-elevated w-full max-w-[480px] p-10">
        <h2 className="font-display font-bold text-xl mb-6 text-center" style={{ color: 'var(--color-white-primary)' }}>
          Crea la clave de tu firma electrónica
        </h2>

        {/* Security warning */}
        <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ background: 'rgba(255,76,43,0.08)', border: '1px solid rgba(255,76,43,0.25)' }}>
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" style={{ color: '#FF4C2B' }} />
          <div>
            <p className="font-display font-semibold text-sm mb-1" style={{ color: 'var(--color-white-primary)' }}>Información importante</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-white-secondary)' }}>
              Recuerda que la clave es de uso exclusivo y personal. No entregues tu firma electrónica ni su clave a otras personas. PrimeCORE nunca te solicitará tu clave.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Clave del certificado (.p12)</label>
            <div className="relative">
              <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="glass-input w-full pl-11 pr-11 py-3 text-sm"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {showPw ? <EyeOff size={18} style={{ color: 'var(--color-white-muted)' }} /> : <Eye size={18} style={{ color: 'var(--color-white-muted)' }} />}
              </button>
            </div>
            {pw && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i <= strength ? levels[strength]?.color : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <p className="text-[11px] mt-1" style={{ color: levels[strength]?.color }}>{levels[strength]?.label}</p>
              </div>
            )}
          </div>

          {/* Requirements checklist */}
          <div className="space-y-1.5">
            {reqs.map(r => (
              <div key={r.label} className="flex items-center gap-2 text-xs" style={{ color: r.test(pw) ? 'var(--color-success)' : 'var(--color-white-muted)' }}>
                {r.test(pw) ? <Check size={14} /> : <X size={14} />} {r.label}
              </div>
            ))}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Confirma tu clave</label>
            <div className="relative">
              <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite la clave del certificado"
                className="glass-input w-full pl-11 pr-11 py-3 text-sm"
                style={match ? { borderColor: 'var(--color-success)' } : mismatch ? { borderColor: 'var(--color-error)' } : {}}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {showConfirm ? <EyeOff size={18} style={{ color: 'var(--color-white-muted)' }} /> : <Eye size={18} style={{ color: 'var(--color-white-muted)' }} />}
              </button>
            </div>
            {mismatch && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>Las claves no coinciden</p>}
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--color-white-muted)' }}>
            <Info size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-teal)' }} />
            Esta clave protege tu certificado digital (.p12) y es diferente a tu contraseña de acceso a PrimeCORE. Guárdala en un lugar seguro, no podrás recuperarla si la olvidas.
          </div>

          <button onClick={handleFinish} disabled={!valid || loading} className="btn-primary w-full h-[56px] flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generando tu certificado...</> : 'Finalizar proceso'}
          </button>
        </div>
      </div>
    </div>
  );
}
