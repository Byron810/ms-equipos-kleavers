import api from "./api";

// Equipos creados durante esta sesión (el mock no los persiste de
// verdad). Variable en memoria: se borra sola al recargar la página.
let localExtra = [];

/**
 * Traduce un equipo de APIM (nombreEquipo, cantidadTotal,
 * cantidadDisponible, etc.) al formato que usa la interfaz
 * (nombre, cantidad, disponible, asignado).
 */
function mapEquipo(e) {
  const cantidad = e.cantidadTotal ?? e.cantidad ?? 0;
  const disponible = e.cantidadDisponible ?? e.disponible ?? 0;
  return {
    id: e.id,
    nombre: e.nombreEquipo || e.nombre,
    categoria: e.categoria,
    cantidad,
    disponible,
    asignado: e.asignado ?? cantidad - disponible,
    estado: e.estado,
    descripcion: e.descripcion,
    precioAlquiler: e.precioAlquiler,
  };
}

const SEARCH_FIELDS = ["nombre", "categoria"];
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
 * Lista equipos con paginación y búsqueda. Igual que en eventosService:
 * como el mock ignora `search`, traemos todo y filtramos/paginamos aquí.
 */
export const getEquipos = async (page = 1, pageSize = 10, search = "") => {
  const res = await api.get("/equipos", {
    params: { page: 1, pageSize: 1000, search: "" },
  });

  const apiItems = (res.data.items || []).map(mapEquipo);
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

export const getEquipo = async (id) => {
  const local = localExtra.find((e) => String(e.id) === String(id));
  if (local) return { data: local };

  const res = await api.get(`/equipos/${id}`);
  return { ...res, data: mapEquipo(res.data) };
};

/**
 * Crea el equipo contra la API real (POST /equipos) y, como el mock no
 * lo persiste, también lo guarda en memoria para que aparezca en la
 * lista hasta que se recargue la página.
 */
export const createEquipo = async (data) => {
  const res = await api.post("/equipos", data);

  const nuevo = mapEquipo({
    id: `local-${Date.now()}`,
    nombre: data.nombre,
    categoria: data.categoria,
    cantidad: data.cantidad,
    disponible: data.disponible,
    asignado: data.asignado,
    estado: data.estado,
  });
  localExtra = [nuevo, ...localExtra];

  return res;
};

export const updateEquipo = (id, data) => api.put(`/equipos/${id}`, data);

export const deleteEquipo = (id) => api.delete(`/equipos/${id}`);
