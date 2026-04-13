import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!email) errs.email = 'Este campo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Ingresa un correo electronico valido';
    if (!password) errs.password = 'Este campo es obligatorio';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Sesion iniciada correctamente');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-decorative" style={{ background: 'var(--color-bg-dark)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-elevated w-full max-w-[440px] p-12"
      >
        <div className="flex flex-col items-center mb-8">
          <img src="https://primecore.lat/image/marko-logo-dark.png" alt="PrimeCORE" className="h-10 mb-6" />
          <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>
            Bienvenido de vuelta
          </h1>
          <p className="text-sm mt-2 text-center" style={{ color: 'var(--color-white-secondary)' }}>
            Ingresa a tu cuenta para gestionar tus firmas electronicas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Correo electronico</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                }}
                placeholder="tu@correo.com"
                className="glass-input w-full pl-11 pr-4 py-3.5 text-sm"
                aria-label="Correo electronico"
              />
            </div>
            {errors.email && <p className="text-xs mt-1.5" style={{ color: 'var(--color-error)' }}>{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Contrasena</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({});
                }}
                placeholder="********"
                className="glass-input w-full pl-11 pr-11 py-3.5 text-sm"
                aria-label="Contrasena"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2" aria-label="Mostrar contrasena">
                {showPw ? <EyeOff size={18} style={{ color: 'var(--color-white-muted)' }} /> : <Eye size={18} style={{ color: 'var(--color-white-muted)' }} />}
              </button>
            </div>
            {errors.password && <p className="text-xs mt-1.5" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--color-white-secondary)' }}>
              <input type="checkbox" className="w-4 h-4 rounded accent-teal" /> Recordarme
            </label>
            <button type="button" onClick={() => navigate('/recuperar')} className="text-xs font-medium hover:underline" style={{ color: 'var(--color-teal)' }}>
              Olvidaste tu contrasena?
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full h-[52px] flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verificando...</>
            ) : 'Ingresar'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className="text-xs" style={{ color: 'var(--color-white-muted)' }}>o continua con</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <p className="text-center text-sm" style={{ color: 'var(--color-white-secondary)' }}>
          No tienes cuenta?{' '}
          <button onClick={() => navigate('/registro')} className="font-medium hover:underline" style={{ color: 'var(--color-teal)' }}>
            Crear cuenta
          </button>
        </p>
      </motion.div>
    </div>
  );
}
