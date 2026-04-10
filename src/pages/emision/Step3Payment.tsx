import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, User, Calendar, Lock, ShieldCheck, Award } from 'lucide-react';
import { useEmisionStore } from '@/stores/useEmisionStore';
import { plans, IVA_RATE } from '@/data/mockData';
import { toast } from 'sonner';

export default function Step3Payment() {
  const { selectedPlan, setStep, setPaymentCompleted } = useEmisionStore();
  const plan = plans.find(p => p.id === selectedPlan);
  const price = plan?.price || 12;
  const iva = price * IVA_RATE;
  const total = price + iva;

  const [form, setForm] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const cardBrand = form.number.startsWith('4') ? 'Visa' : form.number.startsWith('5') ? 'Mastercard' : form.number.startsWith('3') ? 'Amex' : null;

  const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

  const valid = form.name.length > 2 && form.number.replace(/\s/g, '').length >= 15 && form.expiry.length >= 4 && form.cvv.length >= 3;

  const handlePay = () => {
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      setPaymentCompleted(true);
      toast.success('✓ Pago procesado correctamente');
      setStep(4);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--color-white-primary)' }}>Completa tu pago</h2>
        <p className="text-sm mt-2" style={{ color: 'var(--color-white-secondary)' }}>Ingresa los datos de tu tarjeta para procesar el pago de forma segura</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form - 3 cols */}
        <div className="lg:col-span-3 space-y-5">
          {/* Plan summary */}
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,201,177,0.1)' }}>
              <Award size={22} style={{ color: 'var(--color-teal)' }} />
            </div>
            <div>
              <p className="font-display font-semibold text-sm" style={{ color: 'var(--color-white-primary)' }}>Firma Electrónica · {plan?.duration}</p>
              <p className="text-xs" style={{ color: 'var(--color-white-muted)' }}>Pago único · Sin renovación automática</p>
            </div>
            <span className="ml-auto font-display font-bold text-xl" style={{ color: 'var(--color-teal)' }}>${price.toFixed(2)}</span>
          </div>

          {/* Card fields */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Nombre del titular</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nombre del titular" className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Número de tarjeta</label>
            <div className="relative">
              <CreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
              <input value={formatCard(form.number)} onChange={e => set('number', e.target.value.replace(/\D/g, ''))} placeholder="0000 0000 0000 0000" className="glass-input w-full pl-11 pr-20 py-3 text-sm" maxLength={19} />
              {cardBrand && <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-display font-bold" style={{ color: 'var(--color-teal)' }}>{cardBrand}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Fecha de vencimiento</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input value={form.expiry} onChange={e => set('expiry', e.target.value)} placeholder="MM/AA" className="glass-input w-full pl-11 pr-4 py-3 text-sm" maxLength={5} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>CVV</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
                <input type="password" value={form.cvv} onChange={e => set('cvv', e.target.value)} placeholder="•••" className="glass-input w-full pl-11 pr-4 py-3 text-sm" maxLength={4} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-white-muted)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--color-teal)' }} />
            Pago 100% seguro · Datos encriptados con SSL
          </div>

          <button onClick={handlePay} disabled={!valid || loading} className="btn-primary w-full h-[52px] flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando pago...</> : `Pagar $${total.toFixed(2)}`}
          </button>
        </div>

        {/* Summary - 2 cols */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-display font-semibold" style={{ color: 'var(--color-white-primary)' }}>Resumen de tu orden</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span style={{ color: 'var(--color-white-secondary)' }}>Tipo</span><span style={{ color: 'var(--color-white-primary)' }}>Persona Natural</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--color-white-secondary)' }}>Plan</span><span style={{ color: 'var(--color-white-primary)' }}>Firma · {plan?.duration}</span></div>
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="flex justify-between"><span style={{ color: 'var(--color-white-secondary)' }}>Subtotal</span><span style={{ color: 'var(--color-white-primary)' }}>${price.toFixed(2)}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--color-white-secondary)' }}>IVA (15%)</span><span style={{ color: 'var(--color-white-primary)' }}>${iva.toFixed(2)}</span></div>
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="flex justify-between font-display font-bold text-lg"><span style={{ color: 'var(--color-white-primary)' }}>Total</span><span style={{ color: 'var(--color-teal)' }}>${total.toFixed(2)}</span></div>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--color-white-muted)' }}>* Precio final incluye IVA</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button onClick={() => setStep(2)} className="btn-ghost px-8 h-[48px]">← Anterior</button>
      </div>
    </div>
  );
}
