import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Check, X, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { invitationApi } from '@/lib/invitation-api';

const strengthLevels = [
  { label: 'Debil', color: '#EF4444', width: '25%' },
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
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pw)) s++;
  return Math.min(s - 1, 3);
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  password: string;
  confirm: string;
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get('uuid') || '';
  const inviteMode = Boolean(uuid);

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    password: '',
    confirm: '',
  });

  const [showPw, setShowPw] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [inviteStatus, setInviteStatus] = useState('');
  const [inviteLegend, setInviteLegend] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const loadInvite = async () => {
      if (!inviteMode) return;
      setLoadingInvite(true);

      const result = await invitationApi.validateUuid(uuid);
      if (!mounted) return;

      if (!result.success) {
        setInviteStatus(result.invitation?.status || 'FAILED');
        setInviteLegend(result.invitation?.status_legend_es || result.error || 'Invitacion no valida');
      } else {
        setInviteStatus(result.invitation?.status || 'VALIDATED');
        setInviteLegend(result.invitation?.status_legend_es || 'Invitacion validada');
        setForm((prev) => ({ ...prev, email: result.invitation?.email || prev.email }));
      }

      setLoadingInvite(false);
    };

    loadInvite();

    return () => {
      mounted = false;
    };
  }, [inviteMode, uuid]);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const pwMatch = form.confirm.length > 0 && form.password === form.confirm;
  const pwMismatch = form.confirm.length > 0 && form.password !== form.confirm;

  const inviteBlocked = inviteMode && (inviteStatus === 'FAILED' || inviteStatus === 'ENROLLED');

  const validInviteForm =
    form.firstName.trim().length >= 2 &&
    form.lastName.trim().length >= 2 &&
    form.phone.trim().length >= 8 &&
    form.dni.trim().length >= 8 &&
    strength >= 2 &&
    pwMatch &&
    !inviteBlocked;

  const validNormalForm =
    /\S+@\S+\.\S+/.test(form.email) &&
    accepted;

  const valid = inviteMode ? validInviteForm : validNormalForm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!valid) return;

    if (inviteMode) {
      setLoading(true);
      const payload = {
        uuid,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        telefono: form.phone.trim(),
        dni: form.dni.trim(),
        password: form.password,
      };

      try {
        const pre = await invitationApi.prevalidateEnrollment(payload);
        if (!pre.success) {
          const nextErrors: Record<string, string> = {};
          for (const item of pre.validation_errors || []) {
            if (item.field === 'first_name') nextErrors.firstName = item.message;
            else if (item.field === 'last_name') nextErrors.lastName = item.message;
            else if (item.field === 'telefono') nextErrors.phone = item.message;
            else if (item.field === 'dni') nextErrors.dni = item.message;
            else if (item.field === 'password') nextErrors.password = item.message;
          }
          setErrors((prev) => ({ ...prev, ...nextErrors }));
          toast.error('Revisa los datos del formulario');
          return;
        }

        const result = await invitationApi.enroll(payload);
        if (!result.success) {
          const nextErrors: Record<string, string> = {};
          for (const item of result.validation_errors || []) {
            if (item.field === 'first_name') nextErrors.firstName = item.message;
            else if (item.field === 'last_name') nextErrors.lastName = item.message;
            else if (item.field === 'telefono') nextErrors.phone = item.message;
            else if (item.field === 'dni') nextErrors.dni = item.message;
            else if (item.field === 'password') nextErrors.password = item.message;
          }
          setErrors((prev) => ({ ...prev, ...nextErrors }));
          setInviteLegend(result.status_legend_es || result.error || 'No se pudo completar el enrolamiento');
          toast.error(result.status_legend_es || result.error || 'No se pudo completar el enrolamiento');
          return;
        }

        toast.success(result.message || 'Cuenta activada correctamente');
        navigate('/login');
      } finally {
        setLoading(false);
      }

      return;
    }

    setLoading(true);
    try {
      const response = await invitationApi.requestRegistration(form.email.trim().toLowerCase());
      if (!response.success) {
        toast.error(response.error || 'No se pudo solicitar el registro');
        return;
      }

      toast.success('Solicitud enviada. Revisa tu correo para continuar con el enlace de registro.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-decorative" style={{ background: 'var(--color-bg-dark)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-elevated w-full max-w-[460px] p-10"
      >
        <div className="flex flex-col items-center mb-6">
          <img src="https://primecore.lat/image/marko-logo-dark.png" alt="PrimeCORE" className="h-9 mb-5" />
          <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>
            {inviteMode ? 'Completa tu registro' : 'Crea tu cuenta'}
          </h1>
          <p className="text-sm mt-2 text-center" style={{ color: 'var(--color-white-secondary)' }}>
            {inviteMode
              ? 'Usa el enlace de invitacion para enrolarte con tus datos personales.'
              : 'Ingresa tu correo y datos para iniciar el proceso de registro.'}
          </p>
        </div>

        {inviteMode && (loadingInvite ? (
          <div className="flex justify-center py-4">
            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : inviteLegend ? (
          <div
            className="mb-4 rounded-lg px-3 py-2 text-sm"
            style={{
              background: inviteBlocked ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.14)',
              color: inviteBlocked ? '#fecaca' : '#bbf7d0',
            }}
          >
            {inviteLegend}
          </div>
        ) : null)}

        <form onSubmit={handleSubmit} className="space-y-4">
          {inviteMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  placeholder="Nombre"
                  className="glass-input w-full pl-11 pr-4 py-3 text-sm"
                  aria-label="Nombre"
                  disabled={inviteBlocked}
                />
                {errors.firstName && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.firstName}</p>}
              </div>

              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input
                  value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  placeholder="Apellido"
                  className="glass-input w-full pl-11 pr-4 py-3 text-sm"
                  aria-label="Apellido"
                  disabled={inviteBlocked}
                />
                {errors.lastName && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.lastName}</p>}
              </div>
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="tu@correo.com"
              className="glass-input w-full pl-11 pr-4 py-3 text-sm"
              aria-label="Correo electronico"
              disabled={inviteMode || inviteBlocked}
            />
          </div>

          {inviteMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="Telefono"
                  className="glass-input w-full pl-11 pr-4 py-3 text-sm"
                  aria-label="Telefono"
                  disabled={inviteBlocked}
                />
                {errors.phone && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.phone}</p>}
              </div>

              <div className="relative">
                <CreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input
                  value={form.dni}
                  onChange={(e) => setField('dni', e.target.value)}
                  placeholder="Cedula"
                  className="glass-input w-full pl-11 pr-4 py-3 text-sm"
                  aria-label="Cedula"
                  disabled={inviteBlocked}
                />
                {errors.dni && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.dni}</p>}
              </div>
            </div>
          )}

          {inviteMode && (
            <>
              <div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    placeholder="Minimo 8 caracteres"
                    className="glass-input w-full pl-11 pr-11 py-3 text-sm"
                    aria-label="Contrasena"
                    disabled={inviteBlocked}
                  />
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
                {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.password}</p>}
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setField('confirm', e.target.value)}
                  placeholder="Repite tu contrasena"
                  className="glass-input w-full pl-11 pr-11 py-3 text-sm"
                  aria-label="Confirmar contrasena"
                  disabled={inviteBlocked}
                />
                {pwMatch && <Check size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-success)' }} />}
                {pwMismatch && <X size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-error)' }} />}
              </div>
              {pwMismatch && <p className="text-xs" style={{ color: 'var(--color-error)' }}>Las contrasenas no coinciden</p>}
            </>
          )}

          {!inviteMode && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 w-4 h-4 accent-teal rounded" />
              <span className="text-xs leading-relaxed" style={{ color: 'var(--color-white-secondary)' }}>
                He leido y acepto los terminos de servicio y la politica de privacidad de PrimeCORE.
              </span>
            </label>
          )}

          <button type="submit" disabled={!valid || loading || loadingInvite || inviteBlocked} className="btn-primary w-full h-[52px] flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
            ) : inviteMode ? 'Completar enrolamiento' : 'Solicitar registro'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-white-secondary)' }}>
          Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')} className="font-medium hover:underline" style={{ color: 'var(--color-teal)' }}>Inicia sesion</button>
        </p>
      </motion.div>
    </div>
  );
}
