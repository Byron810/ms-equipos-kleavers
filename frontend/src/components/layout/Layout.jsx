import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const pageTitles = {
  '/': 'Dashboard',
  '/eventos': 'Eventos',
  '/eventos/crear': 'Crear Evento',
  '/clientes': 'Clientes',
  '/equipos': 'Equipos',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Si la ruta empieza con /eventos/ y no es /eventos ni /eventos/crear,
  // asumimos que es el detalle de un evento.
  let title = pageTitles[location.pathname];
  if (!title) {
    if (location.pathname.startsWith('/eventos/')) title = 'Detalle del Evento';
    else title = 'Kleavers';
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}