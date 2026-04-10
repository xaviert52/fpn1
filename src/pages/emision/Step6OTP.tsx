import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useEmisionStore } from '@/stores/useEmisionStore';
import { demoUser } from '@/data/mockData';
import { toast } from 'sonner';

export default function Step6OTP() {
  const { setStep, setOtpVerified } = useEmisionStore();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(299);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const iv = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(iv);
  }, []);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const newCode = [...code];
    newCode[i] = v.slice(-1);
    setCode(newCode);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (data.length === 6) {
      setCode(data.split(''));
      refs.current[5]?.focus();
    }
  };

  const filled = code.every(c => c.length === 1);
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  const handleVerify = () => {
    if (!filled) return;
    setLoading(true);
    setTimeout(() => {
      setOtpVerified(true);
      toast.success('Código verificado correctamente');
      setStep(7);
    }, 1500);
  };

  return (
    <div className="flex justify-center">
      <div className="glass-card-elevated w-full max-w-[480px] p-10 text-center">
        <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(0,201,177,0.12)' }}>
          <Mail size={36} style={{ color: 'var(--color-teal)' }} />
        </div>

        <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--color-white-primary)' }}>Hemos enviado un código a tu correo</h2>
        <p className="text-sm mb-2" style={{ color: 'var(--color-white-secondary)' }}>Ingresa el código de 6 dígitos que enviamos a:</p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Lock size={14} style={{ color: 'var(--color-white-muted)' }} />
          <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-teal)' }}>{demoUser.email}</span>
        </div>

        {/* OTP inputs */}
        <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="glass-input w-14 h-16 text-center font-display font-bold text-2xl"
              style={digit ? { background: 'rgba(0,201,177,0.10)', borderColor: 'var(--color-teal)' } : {}}
              aria-label={`Dígito ${i + 1}`}
            />
          ))}
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--color-white-muted)' }}>
          El código expira en {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>

        <p className="text-xs mb-6" style={{ color: 'var(--color-white-secondary)' }}>
          ¿No recibiste el código?{' '}
          <button
            disabled={countdown > 0}
            onClick={() => { toast.success('Código reenviado a tu correo'); setCountdown(300); }}
            className="font-medium"
            style={{ color: countdown > 0 ? 'var(--color-white-muted)' : 'var(--color-teal)', cursor: countdown > 0 ? 'default' : 'pointer' }}
          >
            Reenviar
          </button>
        </p>

        <button onClick={handleVerify} disabled={!filled || loading} className="btn-primary w-full h-[52px] flex items-center justify-center gap-2">
          {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verificando...</> : 'Verificar código'}
        </button>
      </div>
    </div>
  );
}
