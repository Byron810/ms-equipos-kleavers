import api from "./api";

/**
 * El mock de APIM devuelve campos más detallados de lo que la interfaz
 * necesita (nombreEvento, clienteId, montoTotal, etc.). Esta función
 * traduce la respuesta de APIM al formato que espera la UI.
 */
function mapEvento(e) {
  return {
    id: e.id,
    nombre: e.nombreEvento,
    cliente: e.clienteNombre || `Cliente #${e.clienteId}`,
    fecha: e.fecha,
    estado: e.estado,
    costo: e.montoTotal,
    // se conservan por si se necesitan en el detalle del evento
    lugar: e.lugar,
    horaInicio: e.horaInicio,
    horaFin: e.horaFin,
    tipoEvento: e.tipoEvento,
    equiposAsignados: e.equiposAsignados,
  };
}

/**
 * Lista eventos con paginación y búsqueda.
 * Espera respuesta: { totalRecords, page, pageSize, items: [...] }
 */
export const getEventos = async (page = 1, pageSize = 10, search = "") => {
  const res = await api.get("/eventos", { params: { page, pageSize, search } });
  return {
    ...res,
    data: {
      totalRecords: res.data.totalRecords,
      page: res.data.page,
      pageSize: res.data.pageSize,
      items: (res.data.items || []).map(mapEvento),
    },
  };
};

export const getEvento = async (id) => {
  const res = await api.get(`/eventos/${id}`);
  return { ...res, data: mapEvento(res.data) };
};

export const createEvento = (data) => api.post("/eventos", data);

export const updateEvento = (id, data) => api.put(`/eventos/${id}`, data);

export const deleteEvento = (id) => api.delete(`/eventos/${id}`);
