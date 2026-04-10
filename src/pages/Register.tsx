import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore';

const strengthLevels = [
  { label: 'Débil', color: '#EF4444', width: '25%' },
  { label: 'Regular', color: '#F5A623', width: '50%' },
  { label: 'Fuerte', color: '#22C55E', width: '75%' },
  { label: 'Muy fuerte', color: '#00C9B1', width: '100%' },
];

function getStrength(pw: string): number {
  if (!pw) return -1;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[!@#$%^&*]/.test(pw)) s++;
  return Math.min(s - 1, 3);
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const set = (k: string, v: string) => { setForm({ ...form, [k]: v }); setErrors({}); };
  const strength = getStrength(form.password);
  const pwMatch = form.confirm.length > 0 && form.password === form.confirm;
  const pwMismatch = form.confirm.length > 0 && form.password !== form.confirm;

  const valid = form.name.length >= 3 && /\S+@\S+\.\S+/.test(form.email) && form.phone.length >= 10
    && strength >= 2 && pwMatch && accepted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      login();
      toast.success('Cuenta creada exitosamente');
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-decorative" style={{ background: 'var(--color-bg-dark)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-elevated w-full max-w-[440px] p-10"
      >
        <div className="flex flex-col items-center mb-6">
          <img src="https://primecore.lat/image/marko-logo-dark.png" alt="PrimeCORE" className="h-9 mb-5" />
          <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>Crea tu cuenta</h1>
          <p className="text-sm mt-2 text-center" style={{ color: 'var(--color-white-secondary)' }}>
            Completa los datos para comenzar a gestionar tus firmas electrónicas en PrimeCORE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej. Gerald Moreno" className="glass-input w-full pl-11 pr-4 py-3 text-sm" aria-label="Nombre completo" />
          </div>
          {/* Email */}
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@correo.com" className="glass-input w-full pl-11 pr-4 py-3 text-sm" aria-label="Correo electrónico" />
          </div>
          {/* Phone */}
          <div className="relative">
            <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+593 99 999 9999" className="glass-input w-full pl-11 pr-4 py-3 text-sm" aria-label="Teléfono celular" />
          </div>
          {/* Password */}
          <div>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 8 caracteres" className="glass-input w-full pl-11 pr-11 py-3 text-sm" aria-label="Contraseña" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {showPw ? <EyeOff size={18} style={{ color: 'var(--color-white-muted)' }} /> : <Eye size={18} style={{ color: 'var(--color-white-muted)' }} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: strength >= 0 ? strengthLevels[strength].width : '0%' }}
                    style={{ background: strength >= 0 ? strengthLevels[strength].color : 'transparent' }}
                  />
                </div>
                {strength >= 0 && <p className="text-[11px] mt-1" style={{ color: strengthLevels[strength].color }}>{strengthLevels[strength].label}</p>}
              </div>
            )}
          </div>
          {/* Confirm */}
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
            <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repite tu contraseña" className="glass-input w-full pl-11 pr-11 py-3 text-sm" aria-label="Confirmar contraseña" />
            {pwMatch && <Check size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-success)' }} />}
            {pwMismatch && <X size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-error)' }} />}
          </div>
          {pwMismatch && <p className="text-xs" style={{ color: 'var(--color-error)' }}>Las contraseñas no coinciden</p>}

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1 w-4 h-4 accent-teal rounded" />
            <span className="text-xs leading-relaxed" style={{ color: 'var(--color-white-secondary)' }}>
              He leído y acepto los{' '}
              <span className="underline" style={{ color: 'var(--color-teal)' }}>Términos de Servicio</span> y la{' '}
              <span className="underline" style={{ color: 'var(--color-teal)' }}>Política de Privacidad</span> de PrimeCORE
            </span>
          </label>

          <button type="submit" disabled={!valid || loading} className="btn-primary w-full h-[52px] flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando cuenta...</> : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-white-secondary)' }}>
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')} className="font-medium hover:underline" style={{ color: 'var(--color-teal)' }}>Inicia sesión</button>
        </p>
      </motion.div>
    </div>
  );
}
