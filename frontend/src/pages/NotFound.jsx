import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6 text-gray-600 dark:text-slate-400">
        Página no encontrada
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
      >
        Volver al inicio
      </Link>
    </div>
  );
}