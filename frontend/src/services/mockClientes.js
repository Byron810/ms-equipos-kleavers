// Datos mock temporales mientras APIM está listo.

const MOCK_DATA = [
  { id: 1, nombre: 'María González', email: 'maria.g@techsolutions.es', telefono: '+34 600 123 456', empresa: 'Tech Solutions SA', tipo: 'Empresa', eventos: 5, ultimoEvento: '2026-11-15', estado: 'Activo' },
  { id: 2, nombre: 'Carlos Mendoza', email: 'c.mendoza@grupoandina.com', telefono: '+34 600 234 567', empresa: 'Grupo Andino', tipo: 'Empresa', eventos: 12, ultimoEvento: '2026-11-18', estado: 'Activo' },
  { id: 3, nombre: 'Ana Ruiz', email: 'ana.ruiz@gmail.com', telefono: '+34 600 345 678', empresa: 'Particular', tipo: 'Particular', eventos: 3, ultimoEvento: '2026-11-24', estado: 'Activo' },
  { id: 4, nombre: 'Alejandro Sanz', email: 'a.sanz@novacorp.es', telefono: '+34 600 456 789', empresa: 'Nova Corp', tipo: 'Empresa', eventos: 8, ultimoEvento: '2026-11-20', estado: 'Activo' },
  { id: 5, nombre: 'Beatriz Soler', email: 'b.soler@outlook.com', telefono: '+34 600 567 890', empresa: 'Particular', tipo: 'Particular', eventos: 1, ultimoEvento: '2026-11-10', estado: 'Activo' },
  { id: 6, nombre: 'Francisco Javier', email: 'f.javier@zara.es', telefono: '+34 600 678 901', empresa: 'Zara S.A.', tipo: 'Empresa', eventos: 3, ultimoEvento: '2026-12-15', estado: 'Activo' },
  { id: 7, nombre: 'Sofía Garrido', email: 's.garrido@starlight.es', telefono: '+34 600 789 012', empresa: 'Starlight Motors', tipo: 'Empresa', eventos: 4, ultimoEvento: '2026-12-02', estado: 'Activo' },
  { id: 8, nombre: 'Lucía García', email: 'lucia.garcia@gmail.com', telefono: '+34 600 890 123', empresa: 'Particular', tipo: 'Particular', eventos: 2, ultimoEvento: '2026-11-15', estado: 'Activo' },
  { id: 9, nombre: 'Mateo Soler', email: 'm.soler@gmail.com', telefono: '+34 600 901 234', empresa: 'Particular', tipo: 'Particular', eventos: 1, ultimoEvento: '2026-11-24', estado: 'Inactivo' },
  { id: 10, nombre: 'Inversiones Iberia', email: 'info@iberia.es', telefono: '+34 910 000 000', empresa: 'Inversiones Iberia', tipo: 'Empresa', eventos: 15, ultimoEvento: '2026-11-12', estado: 'Activo' },
  { id: 11, nombre: 'Madrid Innova', email: 'contacto@madridinnova.es', telefono: '+34 910 111 111', empresa: 'Madrid Innova', tipo: 'Empresa', eventos: 6, ultimoEvento: '2026-11-18', estado: 'Activo' },
  { id: 12, nombre: 'Club Rotario', email: 'info@rotarios.es', telefono: '+34 910 222 222', empresa: 'Club Rotario', tipo: 'Empresa', eventos: 9, ultimoEvento: '2026-11-28', estado: 'Activo' },
];

let nextId = MOCK_DATA.length + 1;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const mockGetClientes = async (page = 1, pageSize = 10, search = '', filters = {}) => {
  await delay(400);

  let filtered = [...MOCK_DATA];

  // Búsqueda
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.nombre.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.empresa.toLowerCase().includes(s)
    );
  }

  // Filtro por tipo
  if (filters.tipo && filters.tipo !== 'Todos') {
    filtered = filtered.filter((c) => c.tipo === filters.tipo);
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

export const mockCreateCliente = async (data) => {
  await delay(300);
  const newItem = {
    id: nextId++,
    eventos: 0,
    ultimoEvento: null,
    estado: 'Activo',
    tipo: 'Particular',
    ...data,
  };
  MOCK_DATA.push(newItem);
  return { data: newItem };
};

export const mockUpdateCliente = async (id, data) => {
  await delay(300);
  const idx = MOCK_DATA.findIndex((c) => c.id === id);
  if (idx === -1) {
    const err = new Error('No encontrado');
    err.response = { status: 404, data: { message: 'Cliente no encontrado' } };
    throw err;
  }
  MOCK_DATA[idx] = { ...MOCK_DATA[idx], ...data };
  return { data: MOCK_DATA[idx] };
};

export const mockDeleteCliente = async (id) => {
  await delay(300);
  const idx = MOCK_DATA.findIndex((c) => c.id === id);
  if (idx === -1) {
    const err = new Error('No encontrado');
    err.response = { status: 404, data: { message: 'Cliente no encontrado' } };
    throw err;
  }
  MOCK_DATA.splice(idx, 1);
  return { data: { success: true } };
};