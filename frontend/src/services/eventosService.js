import api from "./api";
import { getClientesMap } from "./clientesService";

// Eventos creados durante esta sesión (el mock no los persiste de verdad).
// Es una variable en memoria: vive mientras la pestaña esté abierta y se
// borra sola al recargar la página.
let localExtra = [];

/**
 * El mock de APIM devuelve campos más detallados de lo que la interfaz
 * necesita (nombreEvento, clienteId, montoTotal, etc.). Esta función
 * traduce la respuesta de APIM (o un objeto recién creado localmente)
 * al formato que espera la UI.
 */
function mapEvento(e, clientesMap = {}) {
  return {
    id: e.id,
    nombre: e.nombreEvento || e.nombre,
    cliente:
      e.clienteNombre ||
      e.cliente ||
      clientesMap[e.clienteId] ||
      `Cliente #${e.clienteId}`,
    fecha: e.fecha,
    estado: e.estado,
    costo: e.montoTotal ?? e.costo,
    lugar: e.lugar,
    horaInicio: e.horaInicio,
    horaFin: e.horaFin,
    tipoEvento: e.tipoEvento,
    equiposAsignados: e.equiposAsignados,
  };
}

const SEARCH_FIELDS = ["nombre", "cliente"];
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
 * Lista eventos con paginación y búsqueda.
 * Como el mock de APIM ignora `search` y siempre devuelve el mismo set fijo,
 * traemos todo lo que haya, lo combinamos con lo creado localmente, y
 * filtramos/paginamos aquí mismo en el frontend.
 */
export const getEventos = async (page = 1, pageSize = 10, search = "") => {
  const [res, clientesMap] = await Promise.all([
    api.get("/eventos", { params: { page: 1, pageSize: 1000, search: "" } }),
    getClientesMap(),
  ]);

  const apiItems = (res.data.items || []).map((e) => mapEvento(e, clientesMap));
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

export const getEvento = async (id) => {
  const local = localExtra.find((e) => String(e.id) === String(id));
  if (local) return { data: local };

  const [res, clientesMap] = await Promise.all([
    api.get(`/eventos/${id}`),
    getClientesMap(),
  ]);
  return { ...res, data: mapEvento(res.data, clientesMap) };
};

/**
 * Crea el evento contra la API real (POST /eventos) y, como el mock no
 * lo persiste, también lo guarda en memoria para que aparezca en la
 * lista hasta que se recargue la página.
 */
export const createEvento = async (data) => {
  const res = await api.post("/eventos", data);

  const nuevo = mapEvento({
    id: `local-${Date.now()}`,
    nombreEvento: data.nombreEvento || data.nombre,
    clienteNombre: data.clienteNombre || data.cliente,
    fecha: data.fecha,
    lugar: data.lugar,
    estado: data.estado,
    montoTotal: data.montoTotal ?? data.costo,
    equiposAsignados: data.equiposAsignados,
  });
  localExtra = [nuevo, ...localExtra];

  return res;
};

export const updateEvento = (id, data) => api.put(`/eventos/${id}`, data);

export const deleteEvento = (id) => api.delete(`/eventos/${id}`);
