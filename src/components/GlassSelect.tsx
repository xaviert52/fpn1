import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function GlassSelect({ value, onChange, options, placeholder = 'Selecciona...', disabled = false, className = '', icon }: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const updatePos = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, updatePos]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const portal = document.getElementById('glass-select-portal');
        if (portal && portal.contains(e.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  const dropdown = open ? createPortal(
    <AnimatePresence>
      <motion.ul
        initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
        animate={{ opacity: 1, y: 0, scaleY: 1 }}
        exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed max-h-[240px] overflow-y-auto rounded-xl py-1"
        style={{
          top: pos.top,
          left: pos.left,
          width: pos.width,
          zIndex: 99999,
          background: 'rgba(15, 22, 40, 0.98)',
          backdropFilter: 'blur(32px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
        role="listbox"
      >
        {options.map(opt => {
          const isSelected = opt.value === value;
          return (
            <li
              key={opt.value}
              role="option"
              aria-selected={isSelected}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors"
              style={{
                color: isSelected ? 'var(--color-teal)' : 'var(--color-white-primary)',
                background: isSelected ? 'rgba(0,201,177,0.08)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (!isSelected) (e.currentTarget as HTMLLIElement).style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLLIElement).style.background = isSelected ? 'rgba(0,201,177,0.08)' : 'transparent';
              }}
            >
              <span className="truncate">{opt.label}</span>
              {isSelected && <Check size={16} style={{ color: 'var(--color-teal)' }} />}
            </li>
          );
        })}
      </motion.ul>
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          updatePos();
          setOpen(!open);
        }}
        className="glass-input w-full flex items-center justify-between gap-2 px-4 py-3 text-sm text-left transition-all"
        style={{
          color: selected ? 'var(--color-white-primary)' : 'var(--color-white-muted)',
          borderColor: open ? 'var(--color-teal)' : undefined,
          boxShadow: open ? '0 0 16px var(--color-teal-glow)' : undefined,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: 'var(--color-white-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {dropdown}
    </div>
  );
}
