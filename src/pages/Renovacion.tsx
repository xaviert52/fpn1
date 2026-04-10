import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Clock, CheckCircle, AlertTriangle, CreditCard, Shield } from 'lucide-react';
import { useFirmasStore } from '@/stores/useFirmasStore';
import { plans, IVA_RATE } from '@/data/mockData';
import { toast } from 'sonner';
import GlassSelect from '@/components/GlassSelect';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

export default function Renovacion() {
  const { firmas } = useFirmasStore();
  const renovables = firmas.filter(f => f.estado === 'activa' || f.estado === 'por_vencer');
  const [selectedFirma, setSelectedFirma] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [processing, setProcessing] = useState(false);

  const firma = renovables.find(f => f.id === selectedFirma);
  const plan = plans.find(p => p.id === selectedPlan);

  const handleRenovar = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep('success');
      toast.success('Firma renovada exitosamente');
    }, 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>Renovar Firma Electrónica</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-white-secondary)' }}>Extiende la vigencia de tu certificado digital antes de que expire</p>
      </motion.div>

      {step === 'select' && (
        <>
          <motion.div variants={item} className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,201,177,0.12)' }}>
                <RefreshCw size={20} style={{ color: 'var(--color-teal)' }} />
              </div>
              <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--color-white-primary)' }}>Selecciona la firma a renovar</h2>
            </div>

            <GlassSelect
              value={selectedFirma}
              onChange={setSelectedFirma}
              placeholder="Selecciona una firma..."
              options={renovables.map(f => ({ value: f.id, label: `${f.serial} — ${f.estado === 'por_vencer' ? '⚠ Por vencer' : 'Activa'} — Exp: ${new Date(f.fechaExpiracion).toLocaleDateString('es-EC')}` }))}
            />

            {firma && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 space-y-2" style={{ background: firma.estado === 'por_vencer' ? 'rgba(245,166,35,0.06)' : 'rgba(0,201,177,0.06)', borderColor: firma.estado === 'por_vencer' ? 'rgba(245,166,35,0.15)' : 'rgba(0,201,177,0.15)' }}>
                <div className="flex items-center gap-2">
                  {firma.estado === 'por_vencer' ? <AlertTriangle size={16} style={{ color: '#F5A623' }} /> : <CheckCircle size={16} style={{ color: '#22C55E' }} />}
                  <span className="text-sm font-display font-medium" style={{ color: 'var(--color-white-primary)' }}>
                    {firma.estado === 'por_vencer' ? 'Esta firma está próxima a vencer' : 'Firma activa'}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-white-secondary)' }}>Titular: {firma.titular} · Cédula: {firma.cedula}</p>
                <p className="text-xs" style={{ color: 'var(--color-white-secondary)' }}>Vence: {new Date(firma.fechaExpiracion).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={item} className="glass-card p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--color-white-primary)' }}>Nuevo periodo de vigencia</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {plans.map(p => {
                const isSelected = selectedPlan === p.id;
                return (
                  <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                    className={`glass-card p-4 text-left transition-all ${isSelected ? 'glass-card-elevated' : ''}`}
                    style={{ borderColor: isSelected ? 'var(--color-teal)' : undefined, borderWidth: isSelected ? 2 : undefined }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-semibold text-sm" style={{ color: 'var(--color-teal)' }}>{p.duration}</span>
                      {p.badge && <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-semibold" style={{ background: p.badge === 'Más popular' ? 'var(--color-teal)' : 'var(--color-gold)', color: '#0A0E1A' }}>{p.badge}</span>}
                    </div>
                    <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-white-primary)' }}>${p.price.toFixed(2)}</p>
                    <p className="text-xs" style={{ color: 'var(--color-white-muted)' }}>+ IVA</p>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={item} className="flex justify-center">
            <button disabled={!selectedFirma || !selectedPlan} onClick={() => setStep('confirm')} className="btn-primary px-10 h-[52px]">Continuar con la renovación →</button>
          </motion.div>
        </>
      )}

      {step === 'confirm' && plan && firma && (
        <motion.div variants={item} className="glass-card-elevated p-8 space-y-6">
          <h2 className="font-display font-bold text-xl text-center" style={{ color: 'var(--color-white-primary)' }}>Confirmar renovación</h2>
          <div className="space-y-3">
            {[
              ['Firma', firma.serial],
              ['Titular', firma.titular],
              ['Nueva vigencia', plan.duration],
              ['Subtotal', `$${plan.price.toFixed(2)}`],
              ['IVA (15%)', `$${(plan.price * IVA_RATE).toFixed(2)}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm" style={{ color: 'var(--color-white-secondary)' }}>{l}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-white-primary)' }}>{v}</span>
              </div>
            ))}
            <div className="flex justify-between py-2">
              <span className="text-sm font-display font-bold" style={{ color: 'var(--color-teal)' }}>Total</span>
              <span className="text-lg font-display font-bold" style={{ color: 'var(--color-teal)' }}>${(plan.price * (1 + IVA_RATE)).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setStep('select')} className="btn-ghost px-8 h-[48px]">← Volver</button>
            <button onClick={handleRenovar} disabled={processing} className="btn-primary px-10 h-[52px]">
              {processing ? 'Procesando...' : 'Confirmar y pagar'}
            </button>
          </div>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card-elevated p-12 text-center space-y-4">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(0,201,177,0.12)', border: '2px solid var(--color-teal)' }}>
            <CheckCircle size={40} style={{ color: 'var(--color-teal)' }} />
          </div>
          <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--color-white-primary)' }}>¡Firma renovada exitosamente!</h2>
          <p className="text-sm" style={{ color: 'var(--color-white-secondary)' }}>Tu certificado ha sido extendido con la nueva vigencia seleccionada.</p>
          <button onClick={() => { setStep('select'); setSelectedFirma(''); setSelectedPlan(''); }} className="btn-outline-teal px-8 h-[48px] mx-auto">Volver a mis firmas</button>
        </motion.div>
      )}
    </motion.div>
  );
}
