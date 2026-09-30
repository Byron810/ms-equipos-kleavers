import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(import.meta.env.VITE_API_KEY && {
      'Ocp-Apim-Subscription-Key': import.meta.env.VITE_API_KEY,
    }),
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || 'Error inesperado';

    if (status === 400) toast.error('Datos inválidos. Revisa el formulario.');
    else if (status === 404) toast.error('Recurso no encontrado.');
    else if (status === 500) toast.error('Error del servidor. Intenta más tarde.');
    else if (error.code === 'ECONNABORTED') toast.error('Tiempo de espera agotado.');
    else toast.error(message);

    return Promise.reject(error);
  }
);

export default api;