// Datos mock temporales mientras APIM está listo.
// Cuando Persona 3 entregue los Mock Services, este archivo se elimina.

const MOCK_DATA = [
  { id: 1, nombre: 'Boda García-López', cliente: 'Familia García', fecha: '2026-11-15', estado: 'Confirmado', ubicacion: 'San José' },
  { id: 2, nombre: 'Gala Anual BBVA', cliente: 'BBVA', fecha: '2026-11-18', estado: 'Pendiente', ubicacion: 'Escazú' },
  { id: 3, nombre: 'Tech Summit Madrid', cliente: 'Tech Corp', fecha: '2026-11-22', estado: 'Confirmado', ubicacion: 'Heredia' },
  { id: 4, nombre: 'Cena de Gala Rotarios', cliente: 'Club Rotario', fecha: '2026-11-25', estado: 'Finalizado', ubicacion: 'Cartago' },
  { id: 5, nombre: 'Conferencia Anual', cliente: 'Universidad', fecha: '2026-12-01', estado: 'Pendiente', ubicacion: 'San José' },
  { id: 6, nombre: 'Festival de Verano', cliente: 'Municipalidad', fecha: '2026-12-05', estado: 'Confirmado', ubicacion: 'Liberia' },
  { id: 7, nombre: 'Feria del Libro', cliente: 'Editorial Nacional', fecha: '2026-12-10', estado: 'Confirmado', ubicacion: 'San José' },
  { id: 8, nombre: 'Concierto Benéfico', cliente: 'Fundación', fecha: '2026-12-15', estado: 'Pendiente', ubicacion: 'Alajuela' },
  { id: 9, nombre: 'Graduación UCR', cliente: 'UCR', fecha: '2026-12-18', estado: 'Confirmado', ubicacion: 'San Pedro' },
  { id: 10, nombre: 'Cumbre Empresarial', cliente: 'Cámara de Comercio', fecha: '2026-12-20', estado: 'Finalizado', ubicacion: 'San José' },
  { id: 11, nombre: 'Festival Gastronómico', cliente: 'Asoc. Chefs', fecha: '2027-01-10', estado: 'Pendiente', ubicacion: 'Puntarenas' },
  { id: 12, nombre: 'Convención Anual', cliente: 'Grupo ICE', fecha: '2027-01-15', estado: 'Confirmado', ubicacion: 'San José' },
];

let nextId = MOCK_DATA.length + 1;

// Simula delay de red
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Simula paginación + búsqueda
export const mockGetEventos = async (page = 1, pageSize = 5, search = '') => {
  await delay(400);

  const filtered = search
    ? MOCK_DATA.filter(
        (e) =>
          e.nombre.toLowerCase().includes(search.toLowerCase()) ||
          e.cliente.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_DATA;

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    data: {
      totalRecords: filtered.length,
      page,
      pageSize,
      items,
    },
  };
};

export const mockCreateEvento = async (data) => {
  await delay(300);
  const newItem = { id: nextId++, ...data };
  MOCK_DATA.push(newItem);
  return { data: newItem };
};

export const mockUpdateEvento = async (id, data) => {
  await delay(300);
  const idx = MOCK_DATA.findIndex((e) => e.id === id);
  if (idx === -1) {
    const err = new Error('No encontrado');
    err.response = { status: 404, data: { message: 'Evento no encontrado' } };
    throw err;
  }
  MOCK_DATA[idx] = { ...MOCK_DATA[idx], ...data };
  return { data: MOCK_DATA[idx] };
};

export const mockDeleteEvento = async (id) => {
  await delay(300);
  const idx = MOCK_DATA.findIndex((e) => e.id === id);
  if (idx === -1) {
    const err = new Error('No encontrado');
    err.response = { status: 404, data: { message: 'Evento no encontrado' } };
    throw err;
  }
  MOCK_DATA.splice(idx, 1);
  return { data: { success: true } };
};