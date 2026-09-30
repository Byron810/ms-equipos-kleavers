// Datos mock temporales mientras APIM está listo.

const MOCK_DATA = [
  { id: 1, nombre: 'Proyector HD 4K', categoria: 'Video', cantidad: 5, disponible: 2, asignado: 3, estado: 'Disponible' },
  { id: 2, nombre: 'Sistema de Sonido JBL', categoria: 'Audio', cantidad: 3, disponible: 1, asignado: 2, estado: 'Disponible' },
  { id: 3, nombre: 'Mesa Rectangular 2.4m', categoria: 'Mobiliario', cantidad: 20, disponible: 15, asignado: 5, estado: 'Disponible' },
  { id: 4, nombre: 'Silla Tiffany', categoria: 'Mobiliario', cantidad: 100, disponible: 45, asignado: 55, estado: 'Disponible' },
  { id: 5, nombre: 'Carpa 6×6m', categoria: 'Estructuras', cantidad: 4, disponible: 0, asignado: 4, estado: 'En Mantenimiento' },
  { id: 6, nombre: 'Iluminación LED Set', categoria: 'Iluminación', cantidad: 12, disponible: 8, asignado: 4, estado: 'Disponible' },
  { id: 7, nombre: 'Escenario Modular', categoria: 'Estructuras', cantidad: 2, disponible: 1, asignado: 1, estado: 'Asignado' },
  { id: 8, nombre: 'Set Decoración Floral', categoria: 'Decoración', cantidad: 10, disponible: 7, asignado: 3, estado: 'Disponible' },
  { id: 9, nombre: 'Micrófono Inalámbrico', categoria: 'Audio', cantidad: 8, disponible: 6, asignado: 2, estado: 'Disponible' },
  { id: 10, nombre: 'Pantalla LED 4×3', categoria: 'Video', cantidad: 3, disponible: 3, asignado: 0, estado: 'Disponible' },
  { id: 11, nombre: 'Silla Plegable', categoria: 'Mobiliario', cantidad: 150, disponible: 80, asignado: 70, estado: 'Disponible' },
  { id: 12, nombre: 'Mantelería Blanca', categoria: 'Decoración', cantidad: 200, disponible: 120, asignado: 80, estado: 'Disponible' },
  { id: 13, nombre: 'Generador Eléctrico', categoria: 'Estructuras', cantidad: 2, disponible: 0, asignado: 2, estado: 'En Mantenimiento' },
  { id: 14, nombre: 'Truss Estructura', categoria: 'Estructuras', cantidad: 15, disponible: 10, asignado: 5, estado: 'Disponible' },
  { id: 15, nombre: 'Foco LED RGB', categoria: 'Iluminación', cantidad: 20, disponible: 12, asignado: 8, estado: 'Disponible' },
];

let nextId = MOCK_DATA.length + 1;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const mockGetEquipos = async (page = 1, pageSize = 10, search = '', filters = {}) => {
  await delay(400);

  let filtered = [...MOCK_DATA];

  // Búsqueda
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.nombre.toLowerCase().includes(s) ||
        e.categoria.toLowerCase().includes(s)
    );
  }

  // Filtro por categoría
  if (filters.categoria && filters.categoria !== 'Todos') {
    filtered = filtered.filter((e) => e.categoria === filters.categoria);
  }

  // Filtro por estado
  if (filters.estado && filters.estado !== 'Todos') {
    filtered = filtered.filter((e) => e.estado === filters.estado);
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