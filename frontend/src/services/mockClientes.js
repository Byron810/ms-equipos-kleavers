// Datos mock temporales mientras APIM está listo.

const MOCK_DATA = [
  { id: 1, nombre: 'Familia García', email: 'garcia@example.com', telefono: '+506 8888-1111', empresa: 'Particular', estado: 'Activo' },
  { id: 2, nombre: 'BBVA', email: 'eventos@bbva.com', telefono: '+506 2222-3333', empresa: 'BBVA', estado: 'Activo' },
  { id: 3, nombre: 'Tech Corp', email: 'contacto@techcorp.com', telefono: '+506 4444-5555', empresa: 'Tech Corp', estado: 'Activo' },
  { id: 4, nombre: 'Club Rotario', email: 'info@rotarios.cr', telefono: '+506 6666-7777', empresa: 'Club Rotario', estado: 'Inactivo' },
  { id: 5, nombre: 'Universidad', email: 'eventos@ucr.ac.cr', telefono: '+506 2511-0000', empresa: 'UCR', estado: 'Activo' },
  { id: 6, nombre: 'Municipalidad', email: 'info@muni.go.cr', telefono: '+506 2000-0000', empresa: 'Gobierno', estado: 'Activo' },
  { id: 7, nombre: 'Editorial Nacional', email: 'ventas@editorial.cr', telefono: '+506 2222-4444', empresa: 'Editorial', estado: 'Activo' },
  { id: 8, nombre: 'Fundación Pro Niños', email: 'info@fpren.cr', telefono: '+506 8888-9999', empresa: 'ONG', estado: 'Activo' },
  { id: 9, nombre: 'Grupo ICE', email: 'eventos@ice.go.cr', telefono: '+506 2000-5555', empresa: 'ICE', estado: 'Activo' },
  { id: 10, nombre: 'Cámara de Comercio', email: 'info@camara.cr', telefono: '+506 2222-6666', empresa: 'Cámara', estado: 'Activo' },
  { id: 11, nombre: 'Asoc. Chefs', email: 'chefs@asoc.cr', telefono: '+506 8888-2222', empresa: 'Asoc. Chefs', estado: 'Inactivo' },
  { id: 12, nombre: 'Boutique Eventos CR', email: 'hola@boutique.cr', telefono: '+506 4444-8888', empresa: 'Boutique', estado: 'Activo' },
];

let nextId = MOCK_DATA.length + 1;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const mockGetClientes = async (page = 1, pageSize = 5, search = '') => {
  await delay(400);
  const filtered = search
    ? MOCK_DATA.filter(
        (c) =>
          c.nombre.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
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

export const mockCreateCliente = async (data) => {
  await delay(300);
  const newItem = { id: nextId++, ...data };
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