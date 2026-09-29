import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Package, HelpCircle, X } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/eventos', label: 'Eventos', icon: Calendar },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/equipos', label: 'Equipos', icon: Package },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay oscuro en móvil cuando está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-60
          bg-white dark:bg-slate-900 
          border-r border-gray-200 dark:border-slate-700
          transform transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo + botón cerrar */}
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              Kleavers
            </span>
          </div>

          {/* Botón cerrar solo en móvil */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-gray-200 dark:border-slate-700">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <HelpCircle size={18} />
            <span>Soporte Técnico</span>
          </a>
        </div>
      </aside>
    </>
  );
}