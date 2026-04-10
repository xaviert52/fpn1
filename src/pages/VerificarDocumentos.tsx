import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Upload, File, Shield, AlertTriangle, User, Calendar, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

interface VerificationResult {
  valid: boolean;
  signer: string;
  serial: string;
  issuer: string;
  signDate: string;
  integrity: boolean;
  notExpired: boolean;
  notRevoked: boolean;
}

export default function VerificarDocumentos() {
  const [fileName, setFileName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResult(null);
    }
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setResult({
        valid: true,
        signer: 'Gerald Moreno',
        serial: 'EC-FE-2025-001847',
        issuer: 'PrimeCORE LAT - Entidad de Certificación',
        signDate: '2025-04-01T14:32:00',
        integrity: true,
        notExpired: true,
        notRevoked: true,
      });
      toast.success('Documento verificado exitosamente');
    }, 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>Verificar Documentos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-white-secondary)' }}>Comprueba la autenticidad y validez de un documento firmado electrónicamente</p>
      </motion.div>

      <motion.div variants={item} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,201,177,0.12)' }}>
            <Shield size={20} style={{ color: 'var(--color-teal)' }} />
          </div>
          <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--color-white-primary)' }}>Subir documento para verificar</h2>
        </div>

        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-8 rounded-xl flex flex-col items-center gap-3 transition-all hover:scale-[1.01]"
          style={{ border: '2px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}
        >
          <Upload size={32} style={{ color: 'var(--color-teal)' }} />
          <span className="text-sm" style={{ color: 'var(--color-white-secondary)' }}>Selecciona o arrastra un documento PDF firmado</span>
          <span className="text-xs" style={{ color: 'var(--color-white-muted)' }}>PDF · Máximo 10MB</span>
        </button>

        {fileName && (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,201,177,0.06)', border: '1px solid rgba(0,201,177,0.15)' }}>
            <File size={18} style={{ color: 'var(--color-teal)' }} />
            <span className="text-sm flex-1 truncate" style={{ color: 'var(--color-white-primary)' }}>{fileName}</span>
            {result?.valid && <CheckCircle size={16} style={{ color: '#22C55E' }} />}
          </div>
        )}

        <button
          disabled={!fileName || verifying}
          onClick={handleVerify}
          className="btn-primary w-full h-[52px] flex items-center justify-center gap-2"
        >
          {verifying ? <><Loader2 size={18} className="animate-spin" /> Verificando...</> : <><CheckCircle size={18} /> Verificar documento</>}
        </button>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card-elevated p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: result.valid ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', border: `2px solid ${result.valid ? '#22C55E' : '#EF4444'}` }}>
                {result.valid ? <CheckCircle size={24} style={{ color: '#22C55E' }} /> : <AlertTriangle size={24} style={{ color: '#EF4444' }} />}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg" style={{ color: result.valid ? '#22C55E' : '#EF4444' }}>
                  {result.valid ? 'Documento válido' : 'Documento inválido'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-white-secondary)' }}>
                  {result.valid ? 'La firma electrónica es auténtica y el documento no ha sido modificado' : 'No se pudo verificar la autenticidad del documento'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-display font-semibold text-sm" style={{ color: 'var(--color-white-primary)' }}>Información del firmante</h4>
              {[
                { icon: User, label: 'Firmante', value: result.signer },
                { icon: Award, label: 'Serial del certificado', value: result.serial },
                { icon: Shield, label: 'Entidad emisora', value: result.issuer },
                { icon: Calendar, label: 'Fecha de firma', value: new Date(result.signDate).toLocaleString('es-EC') },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <r.icon size={16} style={{ color: 'var(--color-white-muted)' }} />
                  <span className="text-xs flex-1" style={{ color: 'var(--color-white-muted)' }}>{r.label}</span>
                  <span className="text-sm" style={{ color: 'var(--color-white-primary)' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-display font-semibold text-sm" style={{ color: 'var(--color-white-primary)' }}>Verificaciones</h4>
              {[
                { label: 'Integridad del documento', ok: result.integrity },
                { label: 'Certificado no expirado', ok: result.notExpired },
                { label: 'Certificado no revocado', ok: result.notRevoked },
              ].map(v => (
                <div key={v.label} className="flex items-center gap-3 py-1.5">
                  <CheckCircle size={16} style={{ color: v.ok ? '#22C55E' : '#EF4444' }} />
                  <span className="text-sm" style={{ color: 'var(--color-white-primary)' }}>{v.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
