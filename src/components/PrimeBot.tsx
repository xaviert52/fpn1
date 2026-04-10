import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

const welcomeMsg = `¡Hola! Soy PrimeBoT, tu asistente virtual de PrimeCORE.\n\nPuedo ayudarte con información sobre firmas electrónicas, requisitos legales y el uso de esta plataforma.\n\n¿En qué puedo ayudarte hoy?`;

export default function PrimeBot() {
  const { primebotOpen, togglePrimebot } = useUIStore();
  const [input, setInput] = useState('');

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={togglePrimebot}
        className="fixed bottom-6 right-6 z-[9999] w-[60px] h-[60px] rounded-full flex items-center justify-center animate-glow-pulse"
        style={{ background: 'linear-gradient(135deg, #00C9B1 0%, #0A4FD4 100%)', boxShadow: '0 8px 32px rgba(0, 201, 177, 0.45)' }}
        aria-label="Abrir PrimeBoT"
      >
        <MessageCircle size={26} color="white" />
        {/* Ripple ring */}
        <span className="absolute inset-0 rounded-full border-2 border-teal opacity-30" style={{ animation: 'ripple 2s ease-out infinite' }} />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {primebotOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass-modal fixed right-0 top-0 z-[9998] h-full flex flex-col"
            style={{ width: 380 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <img src="https://primecore.lat/image/marko-logo-dark.png" alt="" className="h-6" />
              <div className="flex-1">
                <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--color-white-primary)' }}>PrimeBoT</h3>
                <p className="text-[11px]" style={{ color: 'var(--color-white-muted)' }}>Asistente virtual · Ley de Comercio Electrónico Ecuador</p>
              </div>
              <button onClick={togglePrimebot} className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="Cerrar PrimeBoT">
                <X size={18} style={{ color: 'var(--color-white-secondary)' }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="glass-card p-4 text-sm whitespace-pre-line" style={{ color: 'var(--color-white-secondary)', fontSize: 'var(--text-sm)' }}>
                {welcomeMsg}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escríbeme tu consulta..."
                  className="glass-input flex-1 px-4 py-3 text-sm"
                />
                <button
                  className="btn-primary p-3 rounded-xl"
                  aria-label="Enviar"
                  onClick={() => setInput('')}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
