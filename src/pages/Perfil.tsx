import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Camera, Shield, Bell, Eye, EyeOff, CheckCircle, Save } from 'lucide-react';
import { demoUser, provincias, ciudadesPorProvincia } from '@/data/mockData';
import { toast } from 'sonner';
import GlassSelect from '@/components/GlassSelect';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

export default function Perfil() {
  const [tab, setTab] = useState<'personal' | 'seguridad' | 'notificaciones'>('personal');
  const [form, setForm] = useState({
    name: demoUser.name, email: demoUser.email, phone: demoUser.phone,
    cedula: demoUser.cedula, provincia: 'Pichincha', ciudad: 'Quito',
    direccion: 'Av. República E7-123 y Almagro',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new_: '', confirm: '' });
  const [notifs, setNotifs] = useState({ email: true, sms: false, expiracion: true, firma: true });

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });
  const cities = ciudadesPorProvincia[form.provincia] || [];

  const tabs = [
    { id: 'personal' as const, label: 'Datos personales', icon: User },
    { id: 'seguridad' as const, label: 'Seguridad', icon: Lock },
    { id: 'notificaciones' as const, label: 'Notificaciones', icon: Bell },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item} className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center font-display font-bold text-2xl" style={{ background: 'linear-gradient(135deg, var(--color-teal), var(--color-teal-deep))', color: 'white' }}>
            {demoUser.initials}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(15,22,40,0.9)', border: '2px solid var(--color-teal)' }}>
            <Camera size={14} style={{ color: 'var(--color-teal)' }} />
          </button>
        </div>
        <div>
          <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>{demoUser.name}</h1>
          <p className="text-sm" style={{ color: 'var(--color-white-secondary)' }}>{demoUser.email}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display font-medium transition-all flex-1 justify-center"
            style={{
              background: tab === t.id ? 'rgba(0,201,177,0.12)' : 'transparent',
              color: tab === t.id ? 'var(--color-teal)' : 'var(--color-white-secondary)',
            }}
          >
            <t.icon size={16} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Personal */}
      {tab === 'personal' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Nombre completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input value={form.name} onChange={e => set('name', e.target.value)} className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Cédula de identidad</label>
              <input value={form.cedula} disabled className="glass-input w-full px-4 py-3 text-sm opacity-60" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Correo electrónico</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input value={form.email} onChange={e => set('email', e.target.value)} className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Teléfono</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input value={form.phone} onChange={e => set('phone', e.target.value)} className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Provincia</label>
              <GlassSelect
                value={form.provincia}
                onChange={v => { set('provincia', v); set('ciudad', ''); }}
                options={provincias.map(p => ({ value: p, label: p }))}
                placeholder="Selecciona provincia..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Ciudad</label>
              <GlassSelect
                value={form.ciudad}
                onChange={v => set('ciudad', v)}
                options={cities.map(c => ({ value: c, label: c }))}
                placeholder="Selecciona ciudad..."
                disabled={!form.provincia}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Dirección</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input value={form.direccion} onChange={e => set('direccion', e.target.value)} className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
            </div>
          </div>
          <button onClick={() => toast.success('Datos actualizados correctamente')} className="btn-primary h-[48px] px-8 flex items-center gap-2">
            <Save size={18} /> Guardar cambios
          </button>
        </motion.div>
      )}

      {/* Security */}
      {tab === 'seguridad' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-5">
          <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--color-white-primary)' }}>Cambiar contraseña</h3>
          {[
            { label: 'Contraseña actual', key: 'current', placeholder: 'Ingresa tu contraseña actual' },
            { label: 'Nueva contraseña', key: 'new_', placeholder: 'Mínimo 8 caracteres' },
            { label: 'Confirmar nueva contraseña', key: 'confirm', placeholder: 'Repite la nueva contraseña' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>{f.label}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={passwords[f.key as keyof typeof passwords]}
                  onChange={e => setPasswords({ ...passwords, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="glass-input w-full pl-11 pr-11 py-3 text-sm"
                />
                <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {showPwd ? <EyeOff size={16} style={{ color: 'var(--color-white-muted)' }} /> : <Eye size={16} style={{ color: 'var(--color-white-muted)' }} />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => toast.success('Contraseña actualizada correctamente')} className="btn-primary h-[48px] px-8 flex items-center gap-2">
            <Shield size={18} /> Actualizar contraseña
          </button>

          <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="font-display font-semibold text-lg mb-3" style={{ color: 'var(--color-white-primary)' }}>Sesiones activas</h3>
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,201,177,0.12)' }}>
                  <Shield size={16} style={{ color: 'var(--color-teal)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-white-primary)' }}>Este dispositivo</p>
                  <p className="text-xs" style={{ color: 'var(--color-white-muted)' }}>Chrome · Quito, Ecuador · Ahora</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>Activa</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications */}
      {tab === 'notificaciones' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--color-white-primary)' }}>Preferencias de notificación</h3>
          {[
            { key: 'email', label: 'Notificaciones por correo', desc: 'Recibe alertas y confirmaciones en tu email' },
            { key: 'sms', label: 'Notificaciones por SMS', desc: 'Recibe alertas por mensaje de texto' },
            { key: 'expiracion', label: 'Alertas de expiración', desc: 'Te avisaremos cuando tus firmas estén por vencer' },
            { key: 'firma', label: 'Confirmación de firma', desc: 'Recibe confirmación cada vez que firmes un documento' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-white-primary)' }}>{n.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-white-muted)' }}>{n.desc}</p>
              </div>
              <button
                onClick={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key as keyof typeof notifs] })}
                className="w-12 h-7 rounded-full relative transition-all"
                style={{
                  background: notifs[n.key as keyof typeof notifs] ? 'var(--color-teal)' : 'rgba(255,255,255,0.12)',
                }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full absolute top-1"
                  style={{ background: 'white' }}
                  animate={{ left: notifs[n.key as keyof typeof notifs] ? 26 : 4 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </div>
          ))}
          <button onClick={() => toast.success('Preferencias guardadas')} className="btn-primary h-[48px] px-8 flex items-center gap-2">
            <Save size={18} /> Guardar preferencias
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
