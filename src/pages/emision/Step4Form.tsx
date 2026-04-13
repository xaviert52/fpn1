import { useState } from 'react';
import { CreditCard as CreditCardIcon, Fingerprint, User, Mail, Phone, MapPin, Home } from 'lucide-react';
import { useEmisionStore } from '@/stores/useEmisionStore';
import { provincias, ciudadesPorProvincia, demoUser } from '@/data/mockData';
import GlassSelect from '@/components/GlassSelect';

export default function Step4Form() {
  const { setStep, personType } = useEmisionStore();
  const [form, setForm] = useState({
    cedula: '', dactilar: '', firstName: '', secondName: '', firstLastName: '', secondLastName: '',
    email: demoUser.email, phone: demoUser.phone, provincia: '', ciudad: '', direccion: '',
    ruc: '', razonSocial: '', cargo: 'Gerente General',
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const cities = ciudadesPorProvincia[form.provincia] || [];

  const basicValid = form.cedula.length === 10 && form.dactilar.length >= 1 && form.firstName && form.firstLastName && form.email && form.phone && form.provincia && form.ciudad && form.direccion;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--color-white-primary)' }}>
          {personType === 'juridica' ? 'Datos de la empresa y representante legal' : 'Completa tus datos personales'}
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-white-secondary)' }}>Esta información será validada con el Registro Civil del Ecuador</p>
      </div>

      {/* Section A - Identity */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4" style={{ background: 'rgba(0,201,177,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <CreditCardIcon size={18} style={{ color: 'var(--color-teal)' }} />
          <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-white-primary)' }}>Datos del documento de identidad</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Número de cédula de identidad</label>
              <div className="relative">
                <CreditCardIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input value={form.cedula} onChange={e => set('cedula', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="0000000000" className="glass-input w-full pl-11 pr-4 py-3 text-sm" maxLength={10} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Código dactilar</label>
              <div className="relative">
                <Fingerprint size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input value={form.dactilar} onChange={e => set('dactilar', e.target.value.slice(0, 4))} placeholder="Ej. 1234" className="glass-input w-full pl-11 pr-4 py-3 text-sm" maxLength={4} />
              </div>
            </div>
          </div>
          <div className="glass-card p-4 flex items-start gap-3" style={{ background: 'rgba(245,166,35,0.06)', borderColor: 'rgba(245,166,35,0.15)' }}>
            <span className="px-2 py-0.5 rounded text-[11px] font-display font-semibold" style={{ background: 'var(--color-gold)', color: '#0A0E1A' }}>¿Dónde está?</span>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-white-secondary)' }}>
              El código dactilar se encuentra en el reverso de tu cédula, en la esquina inferior izquierda, debajo de tus huellas digitales
            </p>
          </div>
        </div>
      </div>

      {/* Section B - Personal */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4" style={{ background: 'rgba(0,201,177,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <User size={18} style={{ color: 'var(--color-teal)' }} />
          <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-white-primary)' }}>Información personal</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Primer nombre</label><input value={form.firstName} onChange={e => set('firstName', e.target.value)} className="glass-input w-full px-4 py-3 text-sm" /></div>
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Segundo nombre (opcional)</label><input value={form.secondName} onChange={e => set('secondName', e.target.value)} className="glass-input w-full px-4 py-3 text-sm" /></div>
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Primer apellido</label><input value={form.firstLastName} onChange={e => set('firstLastName', e.target.value)} className="glass-input w-full px-4 py-3 text-sm" /></div>
            <div><label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Segundo apellido</label><input value={form.secondLastName} onChange={e => set('secondLastName', e.target.value)} className="glass-input w-full px-4 py-3 text-sm" /></div>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Correo electrónico</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input value={form.email} onChange={e => set('email', e.target.value)} className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Teléfono celular</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Provincia</label>
              <GlassSelect
                value={form.provincia}
                onChange={v => { set('provincia', v); set('ciudad', ''); }}
                options={provincias.map(p => ({ value: p, label: p }))}
                placeholder="Selecciona provincia..."
                icon={<MapPin size={16} style={{ color: 'var(--color-white-muted)' }} />}
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
                icon={<MapPin size={16} style={{ color: 'var(--color-white-muted)' }} />}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Dirección completa</label>
            <div className="relative">
              <Home size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Calle, número, referencia" className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button onClick={() => setStep(3)} className="btn-ghost px-8 h-[48px]">← Anterior</button>
        <button onClick={() => basicValid && setStep(5)} disabled={!basicValid} className="btn-primary px-10 h-[52px]">Continuar →</button>
      </div>
    </div>
  );
}
