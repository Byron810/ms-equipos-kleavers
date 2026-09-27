import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Package, HelpCircle } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/eventos', label: 'Eventos', icon: Calendar },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/equipos', label: 'Equipos', icon: Package },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center">
          <span className="text-white font-bold text-lg">K</span>
        </div>
        <span className="font-bold text-lg text-gray-900 dark:text-white">
          Kleavers
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
      <div className="px-3 py-4 border-t border-gray-200 dark:border-slate-700">
        <a
          href="#"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <HelpCircle size={18} />
          <span>Soporte Técnico</span>
        </a>
      </div>
    </aside>
  );
}