import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Recovery() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success('¡Listo! Revisa tu bandeja de entrada');
      setCountdown(60);
      const iv = setInterval(() => {
        setCountdown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; });
      }, 1000);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-decorative" style={{ background: 'var(--color-bg-dark)' }}>
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div key="step1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="glass-card-elevated w-full max-w-[440px] p-12">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-glow-pulse" style={{ background: 'rgba(0,201,177,0.12)' }}>
                <Unlock size={32} style={{ color: 'var(--color-teal)' }} />
              </div>
              <h1 className="font-display font-bold text-[26px]" style={{ color: 'var(--color-white-primary)' }}>Recupera tu contraseña</h1>
              <p className="text-sm mt-2 text-center" style={{ color: 'var(--color-white-secondary)' }}>
                Ingresa tu correo y te enviaremos las instrucciones para restablecer tu contraseña
              </p>
            </div>
            <form onSubmit={handleSend} className="space-y-5">
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" className="glass-input w-full pl-11 pr-4 py-3.5 text-sm" aria-label="Correo electrónico" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full h-[52px] flex items-center justify-center gap-2">
                {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</> : 'Enviar instrucciones'}
              </button>
            </form>
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 mx-auto mt-6 text-sm hover:underline" style={{ color: 'var(--color-teal)' }}>
              <ArrowLeft size={16} /> Volver al inicio de sesión
            </button>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="glass-card-elevated w-full max-w-[440px] p-12">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,201,177,0.12)' }}>
                <Mail size={32} style={{ color: 'var(--color-teal)' }} />
              </div>
              <h2 className="font-display font-bold text-[26px]" style={{ color: 'var(--color-white-primary)' }}>Revisa tu correo</h2>
              <p className="text-sm mt-3 text-center leading-relaxed" style={{ color: 'var(--color-white-secondary)' }}>
                Hemos enviado las instrucciones de recuperación a <strong style={{ color: 'var(--color-white-primary)' }}>{email}</strong>.
                Revisa también tu carpeta de spam si no lo encuentras.
              </p>
            </div>
            <button
              onClick={() => { if (countdown <= 0) { toast.success('Correo reenviado'); setCountdown(60); const iv = setInterval(() => { setCountdown(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }); }, 1000); } }}
              disabled={countdown > 0}
              className="btn-outline-teal w-full h-[48px] flex items-center justify-center"
            >
              {countdown > 0 ? `Reenviar correo (${countdown}s)` : 'Reenviar correo'}
            </button>
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 mx-auto mt-6 text-sm hover:underline" style={{ color: 'var(--color-teal)' }}>
              <ArrowLeft size={16} /> Volver al inicio de sesión
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
