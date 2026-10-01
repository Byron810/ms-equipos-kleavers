import api from "./api";
import { getClientesMap } from "./clientesService";

function mapEvento(e, clientesMap = {}) {
  return {
    id: e.id,
    nombre: e.nombreEvento,
    cliente: clientesMap[e.clienteId] || `Cliente #${e.clienteId}`,
    fecha: e.fecha,
    estado: e.estado,
    costo: e.montoTotal,
    lugar: e.lugar,
    horaInicio: e.horaInicio,
    horaFin: e.horaFin,
    tipoEvento: e.tipoEvento,
    equiposAsignados: e.equiposAsignados,
  };
}

export const getEventos = async (page = 1, pageSize = 10, search = "") => {
  const [res, clientesMap] = await Promise.all([
    api.get("/eventos", { params: { page, pageSize, search } }),
    getClientesMap(),
  ]);
  return {
    ...res,
    data: {
      totalRecords: res.data.totalRecords,
      page: res.data.page,
      pageSize: res.data.pageSize,
      items: (res.data.items || []).map((e) => mapEvento(e, clientesMap)),
    },
  };
};

export const getEvento = async (id) => {
  const [res, clientesMap] = await Promise.all([
    api.get(`/eventos/${id}`),
    getClientesMap(),
  ]);
  return { ...res, data: mapEvento(res.data, clientesMap) };
};

export const createEvento = (data) => api.post("/eventos", data);

export const updateEvento = (id, data) => api.put(`/eventos/${id}`, data);

export const deleteEvento = (id) => api.delete(`/eventos/${id}`);
