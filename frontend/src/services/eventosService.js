import api from './api';

/**
 * Lista eventos con paginación y búsqueda.
 * Espera respuesta: { totalRecords, page, pageSize, items: [...] }
 */
export const getEventos = (page = 1, pageSize = 10, search = '') =>
  api.get('/eventos', { params: { page, pageSize, search } });

export const getEvento = (id) => api.get(`/eventos/${id}`);

export const createEvento = (data) => api.post('/eventos', data);

export const updateEvento = (id, data) => api.put(`/eventos/${id}`, data);

export const deleteEvento = (id) => api.delete(`/eventos/${id}`);