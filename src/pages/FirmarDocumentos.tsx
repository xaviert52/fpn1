import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileSignature, Upload, File, X, CheckCircle, Eye, Download, Loader2 } from 'lucide-react';
import { useFirmasStore } from '@/stores/useFirmasStore';
import { toast } from 'sonner';
import GlassSelect from '@/components/GlassSelect';

interface DocFile { name: string; size: string; status: 'ready' | 'signing' | 'signed' }

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

export default function FirmarDocumentos() {
  const { firmas } = useFirmasStore();
  const activas = firmas.filter(f => f.estado === 'activa');
  const [selectedFirma, setSelectedFirma] = useState('');
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [password, setPassword] = useState('');
  const [signing, setSigning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, status: 'ready' as const }));
    setDocs(prev => [...prev, ...newDocs]);
  };

  const removeDoc = (i: number) => setDocs(prev => prev.filter((_, idx) => idx !== i));

  const handleSign = () => {
    if (!selectedFirma || docs.length === 0 || !password) return;
    setSigning(true);
    setDocs(prev => prev.map(d => ({ ...d, status: 'signing' })));
    setTimeout(() => {
      setDocs(prev => prev.map(d => ({ ...d, status: 'signed' })));
      setSigning(false);
      toast.success(`${docs.length} documento(s) firmado(s) correctamente`);
    }, 2500);
  };

  const allSigned = docs.length > 0 && docs.every(d => d.status === 'signed');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>Firmar Documentos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-white-secondary)' }}>Firma electrónicamente tus documentos PDF con validez legal</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload & Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload */}
          <motion.div variants={item} className="glass-card p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--color-white-primary)' }}>Documentos a firmar</h2>
            <input ref={fileRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleFiles} />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-8 rounded-xl flex flex-col items-center gap-3 transition-all hover:scale-[1.01]"
              style={{ border: '2px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}
            >
              <Upload size={32} style={{ color: 'var(--color-teal)' }} />
              <span className="text-sm" style={{ color: 'var(--color-white-secondary)' }}>Arrastra tus archivos PDF aquí o haz clic para seleccionar</span>
              <span className="text-xs" style={{ color: 'var(--color-white-muted)' }}>PDF · Máximo 10MB por archivo</span>
            </button>

            {docs.length > 0 && (
              <div className="space-y-2">
                {docs.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <File size={18} style={{ color: d.status === 'signed' ? '#22C55E' : 'var(--color-teal)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: 'var(--color-white-primary)' }}>{d.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-white-muted)' }}>{d.size}</p>
                    </div>
                    {d.status === 'signing' && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-teal)' }} />}
                    {d.status === 'signed' && <CheckCircle size={16} style={{ color: '#22C55E' }} />}
                    {d.status === 'ready' && <button onClick={() => removeDoc(i)} className="p-1 rounded-lg hover:bg-white/[0.06]"><X size={14} style={{ color: 'var(--color-white-muted)' }} /></button>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Firma selection */}
          <motion.div variants={item} className="glass-card p-6 space-y-4">
            <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--color-white-primary)' }}>Certificado de firma</h2>
            <GlassSelect
              value={selectedFirma}
              onChange={setSelectedFirma}
              placeholder="Selecciona tu firma electrónica..."
              options={activas.map(f => ({ value: f.id, label: `${f.serial} — ${f.titular}` }))}
            />
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-white-secondary)' }}>Clave del certificado (.p12)</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ingresa la clave de tu firma" className="glass-input w-full px-4 py-3 text-sm" />
            </div>
          </motion.div>
        </div>

        {/* Right: Summary */}
        <motion.div variants={item} className="space-y-4">
          <div className="glass-card p-6 space-y-4 sticky top-[88px]">
            <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--color-white-primary)' }}>Resumen</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-white-muted)' }}>Documentos</span>
                <span style={{ color: 'var(--color-white-primary)' }}>{docs.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-white-muted)' }}>Firma</span>
                <span className="truncate max-w-[140px]" style={{ color: 'var(--color-white-primary)' }}>{activas.find(f => f.id === selectedFirma)?.serial || '—'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--color-white-muted)' }}>Estado</span>
                <span style={{ color: allSigned ? '#22C55E' : 'var(--color-white-secondary)' }}>{allSigned ? 'Firmados ✓' : 'Pendiente'}</span>
              </div>
            </div>

            <button
              disabled={!selectedFirma || docs.length === 0 || !password || signing || allSigned}
              onClick={handleSign}
              className="btn-primary w-full h-[52px] flex items-center justify-center gap-2"
            >
              {signing ? <><Loader2 size={18} className="animate-spin" /> Firmando...</> : <><FileSignature size={18} /> Firmar documentos</>}
            </button>

            {allSigned && (
              <button className="btn-outline-teal w-full h-[44px] flex items-center justify-center gap-2 text-sm" onClick={() => toast.success('Documentos descargados')}>
                <Download size={16} /> Descargar firmados
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
