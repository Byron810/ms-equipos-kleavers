const MOCK_DATA = [
  { id: 1, nombre: 'Proyector HD', categoria: 'Audiovisual', cantidad: 3, disponible: 1, estado: 'Activo' },
  { id: 2, nombre: 'Carpa 6×6', categoria: 'Estructura', cantidad: 10, disponible: 0, estado: 'Activo' },
  { id: 3, nombre: 'Silla Tiffany', categoria: 'Mobiliario', cantidad: 200, disponible: 150, estado: 'Activo' },
  { id: 4, nombre: 'Mesa Redonda', categoria: 'Mobiliario', cantidad: 50, disponible: 30, estado: 'Activo' },
  { id: 5, nombre: 'Sistema de Sonido', categoria: 'Audiovisual', cantidad: 5, disponible: 3, estado: 'Activo' },
  { id: 6, nombre: 'Iluminación LED', categoria: 'Iluminación', cantidad: 20, disponible: 12, estado: 'Activo' },
  { id: 7, nombre: 'Pantalla LED 4×3', categoria: 'Audiovisual', cantidad: 2, disponible: 2, estado: 'Activo' },
  { id: 8, nombre: 'Mantelería Blanca', categoria: 'Textil', cantidad: 100, disponible: 60, estado: 'Activo' },
  { id: 9, nombre: 'Vajilla Premium', categoria: 'Menaje', cantidad: 300, disponible: 200, estado: 'Activo' },
  { id: 10, nombre: 'Escenario Modular', categoria: 'Estructura', cantidad: 4, disponible: 1, estado: 'Activo' },
  { id: 11, nombre: 'Generador Eléctrico', categoria: 'Energía', cantidad: 2, disponible: 1, estado: 'Mantenimiento' },
  { id: 12, nombre: 'Calentador de Comida', categoria: 'Menaje', cantidad: 8, disponible: 8, estado: 'Activo' },
];

let nextId = MOCK_DATA.length + 1;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const mockGetEquipos = async (page = 1, pageSize = 5, search = '') => {
  await delay(400);
  const filtered = search
    ? MOCK_DATA.filter(
        (e) =>
          e.nombre.toLowerCase().includes(search.toLowerCase()) ||
          e.categoria.toLowerCase().includes(search.toLowerCase())
      )
    : MOCK_DATA;
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

export const mockCreateEquipo = async (data) => {
  await delay(300);
  const newItem = { id: nextId++, ...data };
  MOCK_DATA.push(newItem);
  return { data: newItem };
};

export const mockUpdateEquipo = async (id, data) => {
  await delay(300);
  const idx = MOCK_DATA.findIndex((e) => e.id === id);
  if (idx === -1) {
    const err = new Error('No encontrado');
    err.response = { status: 404, data: { message: 'Equipo no encontrado' } };
    throw err;
  }
  MOCK_DATA[idx] = { ...MOCK_DATA[idx], ...data };
  return { data: MOCK_DATA[idx] };
};

export const mockDeleteEquipo = async (id) => {
  await delay(300);
  const idx = MOCK_DATA.findIndex((e) => e.id === id);
  if (idx === -1) {
    const err = new Error('No encontrado');
    err.response = { status: 404, data: { message: 'Equipo no encontrado' } };
    throw err;
  }
  MOCK_DATA.splice(idx, 1);
  return { data: { success: true } };
};