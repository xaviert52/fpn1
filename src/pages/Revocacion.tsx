import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useFirmasStore } from '@/stores/useFirmasStore';
import { toast } from 'sonner';
import GlassSelect from '@/components/GlassSelect';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

const motivos = [
  { value: 'compromiso', label: 'Compromiso de clave privada' },
  { value: 'perdida', label: 'Pérdida del dispositivo' },
  { value: 'robo', label: 'Robo de identidad' },
  { value: 'cambio_datos', label: 'Cambio de datos personales' },
  { value: 'otro', label: 'Otro motivo' },
];

export default function Revocacion() {
  const { firmas } = useFirmasStore();
  const revocables = firmas.filter(f => f.estado === 'activa' || f.estado === 'por_vencer');
  const [selectedFirma, setSelectedFirma] = useState('');
  const [motivo, setMotivo] = useState('');
  const [detalles, setDetalles] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [processing, setProcessing] = useState(false);

  const firma = revocables.find(f => f.id === selectedFirma);

  const handleRevocar = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep('success');
      toast.success('Firma revocada correctamente');
    }, 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>Revocar Firma Electrónica</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-white-secondary)' }}>La revocación es permanente e irreversible. Tu certificado dejará de ser válido inmediatamente.</p>
      </motion.div>

      {/* Warning banner */}
      <motion.div variants={item} className="glass-card p-4 flex items-start gap-3" style={{ background: 'rgba(255,76,43,0.06)', borderColor: 'rgba(255,76,43,0.2)' }}>
        <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: '#FF4C2B' }} />
        <div>
          <p className="font-display font-semibold text-sm" style={{ color: '#FF4C2B' }}>Acción irreversible</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-white-secondary)' }}>Una vez revocada, la firma no podrá ser reactivada. Deberás emitir un nuevo certificado si necesitas una firma electrónica.</p>
        </div>
      </motion.div>

      {step === 'form' && (
        <motion.div variants={item} className="glass-card p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Firma a revocar</label>
            <GlassSelect
              value={selectedFirma}
              onChange={setSelectedFirma}
              placeholder="Selecciona la firma..."
              options={revocables.map(f => ({ value: f.id, label: `${f.serial} — ${f.titular}` }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Motivo de revocación</label>
            <GlassSelect
              value={motivo}
              onChange={setMotivo}
              placeholder="Selecciona el motivo..."
              options={motivos}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Detalles adicionales (opcional)</label>
            <textarea
              value={detalles}
              onChange={e => setDetalles(e.target.value)}
              placeholder="Describe brevemente el motivo..."
              className="glass-input w-full px-4 py-3 text-sm resize-none"
              rows={3}
            />
          </div>

          <button
            disabled={!selectedFirma || !motivo}
            onClick={() => setStep('confirm')}
            className="w-full h-[52px] rounded-xl font-display font-semibold text-sm transition-all"
            style={{
              background: selectedFirma && motivo ? 'linear-gradient(135deg, #FF4C2B 0%, #CC3D22 100%)' : 'rgba(255,255,255,0.06)',
              color: selectedFirma && motivo ? 'white' : 'var(--color-white-muted)',
              cursor: selectedFirma && motivo ? 'pointer' : 'not-allowed',
              opacity: selectedFirma && motivo ? 1 : 0.5,
            }}
          >
            Solicitar revocación
          </button>
        </motion.div>
      )}

      {step === 'confirm' && firma && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-elevated p-8 space-y-5">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(255,76,43,0.12)' }}>
              <ShieldOff size={32} style={{ color: '#FF4C2B' }} />
            </div>
            <h2 className="font-display font-bold text-xl" style={{ color: 'var(--color-white-primary)' }}>¿Estás seguro?</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--color-white-secondary)' }}>Estás a punto de revocar permanentemente la firma <strong style={{ color: 'var(--color-white-primary)' }}>{firma.serial}</strong></p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Escribe <strong style={{ color: '#FF4C2B' }}>REVOCAR</strong> para confirmar</label>
            <input value={confirmText} onChange={e => setConfirmText(e.target.value)} className="glass-input w-full px-4 py-3 text-sm text-center font-mono" placeholder="REVOCAR" />
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => { setStep('form'); setConfirmText(''); }} className="btn-ghost px-8 h-[48px]">Cancelar</button>
            <button
              disabled={confirmText !== 'REVOCAR' || processing}
              onClick={handleRevocar}
              className="px-10 h-[52px] rounded-xl font-display font-semibold text-sm"
              style={{
                background: confirmText === 'REVOCAR' ? 'linear-gradient(135deg, #FF4C2B 0%, #CC3D22 100%)' : 'rgba(255,255,255,0.06)',
                color: confirmText === 'REVOCAR' ? 'white' : 'var(--color-white-muted)',
                opacity: confirmText === 'REVOCAR' ? 1 : 0.4,
                cursor: confirmText === 'REVOCAR' ? 'pointer' : 'not-allowed',
              }}
            >
              {processing ? 'Revocando...' : 'Revocar firma'}
            </button>
          </div>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card-elevated p-12 text-center space-y-4">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(255,76,43,0.12)', border: '2px solid #FF4C2B' }}>
            <XCircle size={40} style={{ color: '#FF4C2B' }} />
          </div>
          <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--color-white-primary)' }}>Firma revocada</h2>
          <p className="text-sm" style={{ color: 'var(--color-white-secondary)' }}>El certificado ha sido revocado permanentemente y ya no es válido para firmar documentos.</p>
          <button onClick={() => { setStep('form'); setSelectedFirma(''); setMotivo(''); setDetalles(''); setConfirmText(''); }} className="btn-outline-teal px-8 h-[48px] mx-auto">Volver al inicio</button>
        </motion.div>
      )}
    </motion.div>
  );
}
