import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,201,177,0.12)' }}>
        <Construction size={32} style={{ color: 'var(--color-teal)' }} />
      </div>
      <h1 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--color-white-primary)' }}>{title}</h1>
      <p className="text-sm" style={{ color: 'var(--color-white-secondary)' }}>Este módulo estará disponible próximamente</p>
    </motion.div>
  );
}
