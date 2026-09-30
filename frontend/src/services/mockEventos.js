// Datos mock temporales mientras APIM está listo.

const MOCK_DATA = [
  { id: 1, nombre: 'Gala Corporativa Anual', cliente: 'Inversiones Iberia', fecha: '2026-11-12', estado: 'Confirmado', costo: 14500 },
  { id: 2, nombre: 'Boda García-López', cliente: 'Lucía García', fecha: '2026-11-15', estado: 'Confirmado', costo: 22400 },
  { id: 3, nombre: 'Conferencia Tech Summit 2026', cliente: 'Madrid Innova', fecha: '2026-11-18', estado: 'Pendiente', costo: 8900 },
  { id: 4, nombre: 'Lanzamiento Producto Nova', cliente: 'Nova Corp', fecha: '2026-11-20', estado: 'En Curso', costo: 11200 },
  { id: 5, nombre: 'Aniversario de Bodas Soler', cliente: 'Mateo Soler', fecha: '2026-11-24', estado: 'Pendiente', costo: 4500 },
  { id: 6, nombre: 'Cena de Gala Rotarios', cliente: 'Club Rotario', fecha: '2026-11-28', estado: 'Finalizado', costo: 18100 },
  { id: 7, nombre: 'Inauguración Showroom', cliente: 'Starlight Motors', fecha: '2026-12-02', estado: 'Confirmado', costo: 7300 },
  { id: 8, nombre: 'Fiesta Fin de Año Inditex', cliente: 'Zara S.A.', fecha: '2026-12-15', estado: 'Confirmado', costo: 45000 },
  { id: 9, nombre: 'Conferencia Anual UCR', cliente: 'Universidad', fecha: '2026-12-18', estado: 'Pendiente', costo: 12500 },
  { id: 10, nombre: 'Festival de Verano', cliente: 'Municipalidad', fecha: '2026-12-22', estado: 'Confirmado', costo: 22000 },
  { id: 11, nombre: 'Feria del Libro', cliente: 'Editorial Nacional', fecha: '2026-12-28', estado: 'Confirmado', costo: 9800 },
  { id: 12, nombre: 'Concierto Benéfico', cliente: 'Fundación', fecha: '2027-01-05', estado: 'Pendiente', costo: 15000 },
];

let nextId = MOCK_DATA.length + 1;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const mockGetEventos = async (page = 1, pageSize = 10, search = '', filters = {}) => {
  await delay(400);

  let filtered = [...MOCK_DATA];

  // Búsqueda
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.nombre.toLowerCase().includes(s) ||
        e.cliente.toLowerCase().includes(s)
    );
  }

  // Filtro por estado
  if (filters.estado && filters.estado !== 'Todos') {
    filtered = filtered.filter((e) => e.estado === filters.estado);
  }

  // Filtro por mes (formato YYYY-MM)
  if (filters.mes) {
    filtered = filtered.filter((e) => e.fecha.startsWith(filters.mes));
  }

  const start = (page - 1) * pageSize;
  return {
    data: {
      totalRecords: filtered.length,
      page,
      pageSize,
      items: filtered.slice(start, start + pageSize),
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