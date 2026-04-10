import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitMerge, FileCheck, AlertCircle, CheckCircle, Clock, Search, Filter, Download, Eye } from 'lucide-react';
import GlassSelect from '@/components/GlassSelect';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

interface ReconciliationItem {
  id: string;
  document: string;
  status: 'conciliado' | 'pendiente' | 'discrepancia';
  firmante: string;
  fecha: string;
  hash: string;
}

const mockData: ReconciliationItem[] = [
  { id: 'rec-001', document: 'Contrato_Servicio_2025.pdf', status: 'conciliado', firmante: 'Gerald Moreno', fecha: '2025-04-01', hash: 'a3f2b8c1' },
  { id: 'rec-002', document: 'NDA_Confidencialidad.pdf', status: 'conciliado', firmante: 'Gerald Moreno', fecha: '2025-03-28', hash: 'b7d4e9f0' },
  { id: 'rec-003', document: 'Acuerdo_Comercial.pdf', status: 'pendiente', firmante: 'Gerald Moreno', fecha: '2025-03-25', hash: 'c1a5f3d2' },
  { id: 'rec-004', document: 'Poder_Notarial.pdf', status: 'discrepancia', firmante: 'Gerald Moreno', fecha: '2025-03-20', hash: 'e8b2c4a7' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  conciliado: { label: 'Conciliado', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle },
  pendiente: { label: 'Pendiente', color: '#F5A623', bg: 'rgba(245,166,35,0.1)', icon: Clock },
  discrepancia: { label: 'Discrepancia', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: AlertCircle },
};

export default function Reconciliacion() {
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const filtered = mockData.filter(r => {
    const matchSearch = r.document.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = filtro === 'todos' || r.status === filtro;
    return matchSearch && matchFiltro;
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="font-display font-bold text-[28px]" style={{ color: 'var(--color-white-primary)' }}>Reconciliación de Documentos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-white-secondary)' }}>Verifica la consistencia entre documentos firmados y sus registros en la plataforma</p>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Conciliados', value: mockData.filter(r => r.status === 'conciliado').length, ...statusConfig.conciliado },
          { label: 'Pendientes', value: mockData.filter(r => r.status === 'pendiente').length, ...statusConfig.pendiente },
          { label: 'Discrepancias', value: mockData.filter(r => r.status === 'discrepancia').length, ...statusConfig.discrepancia },
        ].map(k => (
          <div key={k.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
              <k.icon size={20} style={{ color: k.color }} />
            </div>
            <div>
              <p className="font-display font-bold text-xl" style={{ color: 'var(--color-white-primary)' }}>{k.value}</p>
              <p className="text-xs" style={{ color: 'var(--color-white-muted)' }}>{k.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-white-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por documento..." className="glass-input w-full pl-11 pr-4 py-3 text-sm" />
        </div>
        <div className="flex gap-2">
          {['todos', 'conciliado', 'pendiente', 'discrepancia'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className="px-3 py-2 rounded-xl text-xs font-display font-medium transition-all"
              style={{
                background: filtro === f ? 'rgba(0,201,177,0.15)' : 'rgba(255,255,255,0.06)',
                color: filtro === f ? 'var(--color-teal)' : 'var(--color-white-secondary)',
                border: `1px solid ${filtro === f ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {f === 'todos' ? 'Todos' : statusConfig[f]?.label || f}
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
                {['Documento', 'Estado', 'Firmante', 'Fecha', 'Hash', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-display font-semibold uppercase tracking-wider" style={{ color: 'var(--color-white-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--color-white-muted)' }}>No se encontraron registros</td></tr>
              ) : filtered.map(r => {
                const cfg = statusConfig[r.status];
                return (
                  <tr key={r.id} className="transition-colors hover:bg-white/[0.03]" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileCheck size={16} style={{ color: 'var(--color-teal)' }} />
                        <span className="text-sm truncate max-w-[200px]" style={{ color: 'var(--color-white-primary)' }}>{r.document}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                        <cfg.icon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-white-secondary)' }}>{r.firmante}</td>
                    <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-white-secondary)' }}>{new Date(r.fecha).toLocaleDateString('es-EC')}</td>
                    <td className="px-5 py-4"><span className="font-mono text-xs" style={{ color: 'var(--color-white-muted)' }}>{r.hash}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg transition-colors hover:bg-white/[0.06]" title="Ver"><Eye size={16} style={{ color: 'var(--color-white-secondary)' }} /></button>
                        <button className="p-2 rounded-lg transition-colors hover:bg-white/[0.06]" title="Descargar"><Download size={16} style={{ color: 'var(--color-white-secondary)' }} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
