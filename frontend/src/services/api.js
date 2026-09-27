import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || 'Error inesperado';

    if (status === 400) toast.error('Datos inválidos.');
    else if (status === 404) toast.error('Recurso no encontrado.');
    else if (status === 500) toast.error('Error del servidor.');
    else if (error.code === 'ECONNABORTED') toast.error('Tiempo agotado.');
    else toast.error(message);

    return Promise.reject(error);
  }
);

export default api;