import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const pageTitles = {
  '/': 'Dashboard',
  '/eventos': 'Eventos',
  '/clientes': 'Clientes',
  '/equipos': 'Equipos',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Kleavers';

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}