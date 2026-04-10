import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Clock, ShieldOff, Eye, Download, RefreshCw, ShieldAlert, Search, Filter, Copy, CheckCircle } from 'lucide-react';
import { useFirmasStore, Firma } from '@/stores/useFirmasStore';
import { toast } from 'sonner';

const estadoConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  activa: { label: 'Activa', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle },
  por_vencer: { label: 'Por vencer', color: '#F5A623', bg: 'rgba(245,166,35,0.1)', icon: Clock },
  vencida: { label: 'Vencida', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: ShieldOff },
  revocada: { label: 'Revocada', color: '#FF4C2B', bg: 'rgba(255,76,43,0.1)', icon: ShieldAlert },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

export default function MisFirmas() {
  const { firmas } = useFirmasStore();
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [selectedFirma, setSelectedFirma] = useState<Firma | null>(null);

  const filtered = firmas.filter(f => {
    const matchSearch = f.serial.toLowerCase().includes(search.toLowerCase()) || f.titular.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || f.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const copySerial = (serial: string) => {
    navigator.clipboard.writeText(serial);
    toast.success('Número de serie copiado al portapapeles');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>Mis Firmas Electrónicas</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-white-secondary)' }}>Gestiona y consulta el estado de tus certificados digitales</p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: firmas.length, icon: Award, color: '#00C9B1' },
          { label: 'Activas', value: firmas.filter(f => f.estado === 'activa').length, icon: CheckCircle, color: '#22C55E' },
          { label: 'Por vencer', value: firmas.filter(f => f.estado === 'por_vencer').length, icon: Clock, color: '#F5A623' },
          { label: 'Revocadas', value: firmas.filter(f => f.estado === 'revocada').length, icon: ShieldOff, color: '#FF4C2B' },
        ].map(k => (
          <div key={k.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${k.color}1A` }}>
              <k.icon size={20} style={{ color: k.color }} />
            </div>
            <div>
              <p className="font-display font-bold text-xl" style={{ color: 'var(--color-white-primary)' }}>{k.value}</p>
              <p className="text-xs" style={{ color: 'var(--color-white-muted)' }}>{k.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por serial o titular..." className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
        </div>
        <div className="flex gap-2">
          {['todos', 'activa', 'por_vencer', 'vencida', 'revocada'].map(f => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className="px-3 py-2 rounded-xl text-xs font-display font-medium transition-all"
              style={{
                background: filtroEstado === f ? 'rgba(0,201,177,0.15)' : 'rgba(255,255,255,0.06)',
                color: filtroEstado === f ? 'var(--color-teal)' : 'var(--color-white-secondary)',
                border: `1px solid ${filtroEstado === f ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {f === 'todos' ? 'Todos' : estadoConfig[f]?.label || f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Serial', 'Tipo', 'Estado', 'Emisión', 'Expiración', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-display font-semibold uppercase tracking-wider" style={{ color: 'var(--color-white-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--color-white-muted)' }}>No se encontraron firmas con los filtros aplicados</td></tr>
              ) : filtered.map(f => {
                const cfg = estadoConfig[f.estado];
                return (
                  <tr key={f.id} className="transition-colors hover:bg-white/[0.03]" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-5 py-4">
                      <button onClick={() => copySerial(f.serial)} className="flex items-center gap-2 font-mono text-xs group" style={{ color: 'var(--color-teal)' }}>
                        {f.serial}
                        <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="px-5 py-4 capitalize" style={{ color: 'var(--color-white-secondary)' }}>{f.tipo === 'natural' ? 'Natural' : 'Jurídica'}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                        <cfg.icon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-white-secondary)' }}>{new Date(f.fechaEmision).toLocaleDateString('es-EC')}</td>
                    <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-white-secondary)' }}>{new Date(f.fechaExpiracion).toLocaleDateString('es-EC')}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedFirma(f)} className="p-2 rounded-lg transition-colors hover:bg-white/[0.06]" title="Ver detalles"><Eye size={16} style={{ color: 'var(--color-white-secondary)' }} /></button>
                        <button className="p-2 rounded-lg transition-colors hover:bg-white/[0.06]" title="Descargar"><Download size={16} style={{ color: 'var(--color-white-secondary)' }} /></button>
                        {f.estado === 'por_vencer' && <button className="p-2 rounded-lg transition-colors hover:bg-white/[0.06]" title="Renovar"><RefreshCw size={16} style={{ color: '#F5A623' }} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      {selectedFirma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(10,14,26,0.85)' }} onClick={() => setSelectedFirma(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-elevated p-8 max-w-md w-full mx-4 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--color-white-primary)' }}>Detalle de Firma</h3>
              <button onClick={() => setSelectedFirma(null)} className="text-sm" style={{ color: 'var(--color-white-muted)' }}>✕</button>
            </div>
            {[
              ['Serial', selectedFirma.serial],
              ['Titular', selectedFirma.titular],
              ['Cédula', selectedFirma.cedula],
              ['Tipo', selectedFirma.tipo === 'natural' ? 'Persona Natural' : 'Persona Jurídica'],
              ['Estado', estadoConfig[selectedFirma.estado].label],
              ['Emisión', new Date(selectedFirma.fechaEmision).toLocaleDateString('es-EC')],
              ['Expiración', new Date(selectedFirma.fechaExpiracion).toLocaleDateString('es-EC')],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs" style={{ color: 'var(--color-white-muted)' }}>{label}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--color-white-primary)' }}>{val}</span>
              </div>
            ))}
            <button onClick={() => { toast.success('Certificado descargado'); setSelectedFirma(null); }} className="btn-primary w-full h-[48px] mt-4 flex items-center justify-center gap-2">
              <Download size={18} /> Descargar Certificado (.p12)
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
