import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Scan, CheckCircle } from 'lucide-react';
import { useEmisionStore } from '@/stores/useEmisionStore';
import { mockAdvanceEmissionStep } from '@/mocks/emisionBackendMock';
import { toast } from 'sonner';

type Phase = 'permission' | 'idle' | 'scanning' | 'done';

export default function Step7Biometric() {
  const { setStepFromBackend, setBiometricVerified, activeEmissionUuid, startEmission } = useEmisionStore();
  const [phase, setPhase] = useState<Phase>('permission');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setPhase('idle');
    } catch {
      toast.error('No se pudo acceder a la cámara. Verifica los permisos de tu navegador e intenta nuevamente');
    }
  };

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const startScan = () => {
    setPhase('scanning');
    const start = Date.now();
    const texts = [
      { at: 0, text: 'Analizando rasgos biométricos...' },
      { at: 1500, text: 'Comparando con datos del Registro Civil...' },
      { at: 2500, text: 'Verificando identidad...' },
      { at: 3500, text: '¡Identidad verificada!' },
    ];
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      setScanProgress(Math.min(elapsed / 4000 * 100, 100));
      const current = texts.filter(t => elapsed >= t.at).pop();
      if (current) setScanText(current.text);
      if (elapsed >= 4000) {
        clearInterval(iv);
        setPhase('done');
        streamRef.current?.getTracks().forEach(t => t.stop());
        toast.success('Identidad verificada correctamente');
        setTimeout(async () => {
          setBiometricVerified(true);
          const emissionUuid = activeEmissionUuid ?? startEmission();
          const response = await mockAdvanceEmissionStep({ emisionUuid: emissionUuid, nextStep: 8 });
          setStepFromBackend(response, 8, emissionUuid);
        }, 1000);
      }
    }, 50);
  };

  return (
    <div className="flex justify-center">
      <div className="glass-card-elevated w-full max-w-[520px] p-10 text-center">
        <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--color-white-primary)' }}>Verificación biométrica</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-white-secondary)' }}>Necesitamos verificar tu identidad mediante reconocimiento facial</p>
        <p className="text-sm mb-8" style={{ color: 'var(--color-white-secondary)' }}>Asegúrate de estar en un lugar bien iluminado y mira directamente a la cámara</p>

        {phase === 'permission' && (
          <div className="glass-card p-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,201,177,0.12)' }}>
              <Camera size={32} style={{ color: 'var(--color-teal)' }} />
            </div>
            <p className="text-sm" style={{ color: 'var(--color-white-secondary)' }}>PrimeCORE necesita acceder a tu cámara para verificar tu identidad</p>
            <button onClick={startCamera} className="btn-primary px-8 h-[48px]">Permitir acceso a la cámara</button>
          </div>
        )}

        {(phase === 'idle' || phase === 'scanning' || phase === 'done') && (
          <div className="flex flex-col items-center">
            <div className="relative w-[300px] h-[300px] mb-6">
              {/* Rotating ring */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                <circle
                  cx="150" cy="150" r="145"
                  fill="none"
                  stroke={phase === 'done' ? 'var(--color-success)' : 'var(--color-teal)'}
                  strokeWidth="3"
                  strokeDasharray="80 40"
                  opacity={0.5}
                  style={{ animation: `rotateRing ${phase === 'scanning' ? '0.8s' : '3s'} linear infinite` }}
                />
                {phase === 'scanning' && (
                  <circle cx="150" cy="150" r="140" fill="none" stroke="var(--color-teal)" strokeWidth="4"
                    strokeDasharray={`${scanProgress / 100 * 880} ${880 - scanProgress / 100 * 880}`}
                    strokeDashoffset="220" strokeLinecap="round" />
                )}
              </svg>

              {/* Video circle */}
              <div className="absolute inset-[15px] rounded-full overflow-hidden" style={{ border: '3px solid rgba(255,255,255,0.2)' }}>
                <video ref={videoRef} className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} muted playsInline />
                {/* Scan line */}
                {phase === 'scanning' && (
                  <div className="absolute left-0 right-0 h-1 rounded-full" style={{
                    background: 'linear-gradient(90deg, transparent, var(--color-teal), transparent)',
                    animation: 'scanLine 1.5s linear infinite',
                    top: '0%',
                  }} />
                )}
              </div>

              {/* Done overlay */}
              <AnimatePresence>
                {phase === 'done' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="absolute inset-0 flex items-center justify-center rounded-full"
                    style={{ background: 'rgba(10,14,26,0.7)' }}
                  >
                    <CheckCircle size={64} style={{ color: 'var(--color-success)' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-sm mb-6" style={{ color: phase === 'done' ? 'var(--color-success)' : 'var(--color-white-secondary)' }}>
              {phase === 'idle' ? 'Posiciona tu rostro dentro del círculo' : scanText}
            </p>

            {phase === 'idle' && (
              <button onClick={startScan} className="btn-primary w-full h-[56px] flex items-center justify-center gap-2">
                <Scan size={20} /> Validar biometría
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
