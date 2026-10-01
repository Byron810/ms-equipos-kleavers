import api from "./api";

let clientesCache = null;
let clientesCachePromise = null;

/**
 * Trae todos los clientes una sola vez y arma un mapa { id: nombreCompleto }.
 * Se cachea en memoria durante la sesión para no pedirlo repetidamente.
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

export const getClientes = (page = 1, pageSize = 10, search = "") =>
  api.get("/clientes", { params: { page, pageSize, search } });

export const getCliente = (id) => api.get(`/clientes/${id}`);

export const createCliente = (data) => api.post("/clientes", data);

export const updateCliente = (id, data) => api.put(`/clientes/${id}`, data);

export const deleteCliente = (id) => api.delete(`/clientes/${id}`);
