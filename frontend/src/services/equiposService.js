import api from "./api";

/**
 * Traduce un equipo de APIM (nombreEquipo, cantidadTotal,
 * cantidadDisponible, etc.) al formato que usa la interfaz
 * (nombre, cantidad, disponible, asignado).
 */
function mapEquipo(e) {
  return {
    id: e.id,
    nombre: e.nombreEquipo,
    categoria: e.categoria,
    cantidad: e.cantidadTotal,
    disponible: e.cantidadDisponible,
    asignado: (e.cantidadTotal || 0) - (e.cantidadDisponible || 0),
    estado: e.estado,
    descripcion: e.descripcion,
    precioAlquiler: e.precioAlquiler,
  };
}

export const getEquipos = async (page = 1, pageSize = 10, search = "") => {
  const res = await api.get("/equipos", { params: { page, pageSize, search } });
  return {
    ...res,
    data: {
      totalRecords: res.data.totalRecords,
      page: res.data.page,
      pageSize: res.data.pageSize,
      items: (res.data.items || []).map(mapEquipo),
    },
  };
};

export const getEquipo = async (id) => {
  const res = await api.get(`/equipos/${id}`);
  return { ...res, data: mapEquipo(res.data) };
};

export const createEquipo = (data) => api.post("/equipos", data);

export const updateEquipo = (id, data) => api.put(`/equipos/${id}`, data);

export const deleteEquipo = (id) => api.delete(`/equipos/${id}`);
