import api from "./api";

let clientesCache = null;
let clientesCachePromise = null;

/**
 * Traduce un cliente de APIM (nombreCompleto, correo, tipoCliente,
 * eventosContratados, etc.) al formato que usa la interfaz
 * (nombre, email, empresa, tipo, eventos, estado).
 */
function mapCliente(c) {
  const esEmpresa = c.tipoCliente === "Empresarial";
  return {
    id: c.id,
    nombre: c.nombreCompleto,
    email: c.correo,
    telefono: c.telefono,
    empresa: esEmpresa ? c.nombreCompleto : "Particular",
    tipo: esEmpresa ? "Empresa" : "Particular",
    eventos: (c.eventosContratados || []).length,
    ultimoEvento: null, // no existe este dato en el mock de APIM
    estado: "Activo", // no existe este dato en el mock de APIM
    cedula: c.cedula,
    direccion: c.direccion,
  };
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

export const getClientes = async (page = 1, pageSize = 10, search = "") => {
  const res = await api.get("/clientes", {
    params: { page, pageSize, search },
  });
  return {
    ...res,
    data: {
      totalRecords: res.data.totalRecords,
      page: res.data.page,
      pageSize: res.data.pageSize,
      items: (res.data.items || []).map(mapCliente),
    },
  };
};

export const getCliente = async (id) => {
  const res = await api.get(`/clientes/${id}`);
  return { ...res, data: mapCliente(res.data) };
};

export const createCliente = (data) => api.post("/clientes", data);

export const updateCliente = (id, data) => api.put(`/clientes/${id}`, data);

export const deleteCliente = (id) => api.delete(`/clientes/${id}`);
