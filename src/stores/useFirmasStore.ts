import { create } from 'zustand';

export interface Firma {
  id: string;
  serial: string;
  tipo: 'natural' | 'juridica';
  estado: 'activa' | 'por_vencer' | 'vencida' | 'revocada';
  fechaEmision: string;
  fechaExpiracion: string;
  titular: string;
  cedula: string;
}

interface FirmasState {
  firmas: Firma[];
  documentosFirmados: number;
  firmasRevocadas: number;
}

export const useFirmasStore = create<FirmasState>(() => ({
  firmas: [
    {
      id: 'firma-001',
      serial: 'EC-FE-2025-001847',
      tipo: 'natural',
      estado: 'activa',
      fechaEmision: '2025-03-15',
      fechaExpiracion: '2026-03-15',
      titular: 'Gerald Moreno',
      cedula: '1712345678',
    },
    {
      id: 'firma-002',
      serial: 'EC-FE-2024-000932',
      tipo: 'natural',
      estado: 'por_vencer',
      fechaEmision: '2024-05-20',
      fechaExpiracion: '2025-05-20',
      titular: 'Gerald Moreno',
      cedula: '1712345678',
    },
  ],
  documentosFirmados: 8,
  firmasRevocadas: 0,
}));
