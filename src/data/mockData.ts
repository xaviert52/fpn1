export const plans = [
  { id: 'plan-3m' as const, duration: '3 meses', price: 7.00, badge: null, features: ['Firma ilimitada', 'Soporte por correo', 'Válido legalmente'] },
  { id: 'plan-6m' as const, duration: '6 meses', price: 8.00, badge: null, features: ['Firma ilimitada', 'Soporte por correo', 'Válido legalmente'] },
  { id: 'plan-1y' as const, duration: '1 año', price: 12.00, badge: 'Más popular', features: ['Firma ilimitada', 'Soporte prioritario', 'Válido legalmente'] },
  { id: 'plan-2y' as const, duration: '2 años', price: 19.00, badge: 'Mejor valor', features: ['Firma ilimitada', 'Soporte prioritario', 'Válido legalmente'] },
  { id: 'plan-3y' as const, duration: '3 años', price: 34.00, badge: 'Máxima vigencia', features: ['Firma ilimitada', 'Soporte VIP', 'Válido legalmente'] },
];

export const IVA_RATE = 0.15;

export const provincias = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
  'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
  'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
  'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas',
  'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe',
];

export const ciudadesPorProvincia: Record<string, string[]> = {
  Azuay: ['Cuenca', 'Gualaceo', 'Paute', 'Sigsig'],
  Bolívar: ['Guaranda', 'Caluma', 'Chillanes', 'San Miguel'],
  Cañar: ['Azogues', 'Biblián', 'Cañar', 'La Troncal'],
  Carchi: ['Tulcán', 'Montúfar', 'Espejo', 'Mira'],
  Chimborazo: ['Riobamba', 'Alausí', 'Guano', 'Colta'],
  Cotopaxi: ['Latacunga', 'La Maná', 'Salcedo', 'Pujilí'],
  'El Oro': ['Machala', 'Pasaje', 'Santa Rosa', 'Huaquillas'],
  Esmeraldas: ['Esmeraldas', 'Atacames', 'Quinindé', 'San Lorenzo'],
  Galápagos: ['Puerto Baquerizo Moreno', 'Puerto Ayora', 'Puerto Villamil'],
  Guayas: ['Guayaquil', 'Durán', 'Samborondón', 'Daule', 'Milagro'],
  Imbabura: ['Ibarra', 'Otavalo', 'Cotacachi', 'Antonio Ante'],
  Loja: ['Loja', 'Catamayo', 'Macará', 'Cariamanga'],
  'Los Ríos': ['Babahoyo', 'Quevedo', 'Vinces', 'Ventanas'],
  Manabí: ['Portoviejo', 'Manta', 'Chone', 'Jipijapa'],
  'Morona Santiago': ['Macas', 'Gualaquiza', 'Sucúa', 'Palora'],
  Napo: ['Tena', 'Archidona', 'El Chaco', 'Quijos'],
  Orellana: ['Francisco de Orellana', 'La Joya de los Sachas', 'Loreto'],
  Pastaza: ['Puyo', 'Mera', 'Santa Clara', 'Arajuno'],
  Pichincha: ['Quito', 'Cayambe', 'Rumiñahui', 'Mejía', 'Pedro Moncayo'],
  'Santa Elena': ['Santa Elena', 'La Libertad', 'Salinas'],
  'Santo Domingo de los Tsáchilas': ['Santo Domingo'],
  Sucumbíos: ['Nueva Loja', 'Shushufindi', 'Gonzalo Pizarro'],
  Tungurahua: ['Ambato', 'Baños', 'Pelileo', 'Píllaro'],
  'Zamora Chinchipe': ['Zamora', 'Yantzaza', 'Centinela del Cóndor'],
};

export const actividadReciente = [
  { text: 'Firma electrónica emitida', time: 'hace 5 días', icon: 'Award' },
  { text: 'Documento firmado: Contrato_Servicio.pdf', time: 'hace 3 días', icon: 'FileSignature' },
  { text: 'Verificación de documento realizada', time: 'hace 1 día', icon: 'CheckCircle' },
];

export const demoUser = {
  name: 'Gerald Moreno',
  firstName: 'Gerald',
  email: 'gerald.moreno@correo.com',
  phone: '+593 99 876 5432',
  cedula: '1712345678',
  initials: 'GM',
};
