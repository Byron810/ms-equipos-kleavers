import api from "./api";

let clientesCache = null;
let clientesCachePromise = null;

// Clientes creados durante esta sesión (el mock no los persiste de
// verdad). Variable en memoria: se borra sola al recargar la página.
let localExtra = [];

/**
 * Traduce un cliente de APIM (nombreCompleto, correo, tipoCliente,
 * eventosContratados, etc.) al formato que usa la interfaz
 * (nombre, email, empresa, tipo, eventos, estado).
 */
function mapCliente(c) {
  const esEmpresa = c.tipoCliente === "Empresarial" || c.tipo === "Empresa";
  return {
    id: c.id,
    nombre: c.nombreCompleto || c.nombre,
    email: c.correo || c.email,
    telefono: c.telefono,
    empresa: esEmpresa ? c.nombreCompleto || c.nombre : "Particular",
    tipo: esEmpresa ? "Empresa" : "Particular",
    eventos: c.eventos ?? (c.eventosContratados || []).length,
    ultimoEvento: c.ultimoEvento ?? null, // no existe este dato en el mock de APIM
    estado: c.estado || "Activo", // no existe este dato en el mock de APIM
    cedula: c.cedula,
    direccion: c.direccion,
  };
}

const SEARCH_FIELDS = ["nombre", "email", "empresa"];
function matchesSearch(item, search) {
  if (!search) return true;
  const s = search.toLowerCase();
  return SEARCH_FIELDS.some((f) =>
    String(item[f] ?? "")
      .toLowerCase()
      .includes(s),
  );
}

/**
 * Mapa { id: nombreCompleto } para usarlo al mostrar el cliente
 * de un evento (ver eventosService.js). Se cachea en memoria.
 */
export const getClientesMap = async () => {
  if (clientesCache) return clientesCache;
  if (!clientesCachePromise) {
    clientesCachePromise = api
      .get("/clientes", { params: { page: 1, pageSize: 100 } })
      .then((res) => {
        const map = {};
        (res.data.items || []).forEach((c) => {
          map[c.id] = c.nombreCompleto;
        });
        clientesCache = map;
        return map;
      })
      .catch(() => ({}));
  }
  return clientesCachePromise;
};

/**
 * Lista clientes con paginación y búsqueda. Igual que en eventosService:
 * como el mock ignora `search`, traemos todo y filtramos/paginamos aquí.
 */
export const getClientes = async (page = 1, pageSize = 10, search = "") => {
  const res = await api.get("/clientes", {
    params: { page: 1, pageSize: 1000, search: "" },
  });

  const apiItems = (res.data.items || []).map(mapCliente);
  const allItems = [...localExtra, ...apiItems];
  const filtered = allItems.filter((it) => matchesSearch(it, search));

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return {
    ...res,
    data: {
      totalRecords: filtered.length,
      page,
      pageSize,
      items: pageItems,
    },
  };
};

export const getCliente = async (id) => {
  const local = localExtra.find((c) => String(c.id) === String(id));
  if (local) return { data: local };

  const res = await api.get(`/clientes/${id}`);
  return { ...res, data: mapCliente(res.data) };
};

/**
 * Crea el cliente contra la API real (POST /clientes) y, como el mock no
 * lo persiste, también lo guarda en memoria para que aparezca en la
 * lista hasta que se recargue la página.
 */
export const createCliente = async (data) => {
  const res = await api.post("/clientes", data);

  const nuevo = mapCliente({
    id: `local-${Date.now()}`,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    empresa: data.empresa,
    tipo: data.tipo,
    estado: data.estado,
    eventos: 0,
  });
  localExtra = [nuevo, ...localExtra];

  return res;
};

export const updateCliente = (id, data) => api.put(`/clientes/${id}`, data);

export const deleteCliente = (id) => api.delete(`/clientes/${id}`);
