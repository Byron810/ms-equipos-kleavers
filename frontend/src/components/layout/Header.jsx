import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Badge from '../ui/Badge';

const mockNotifications = [
  { id: 1, text: 'Proyector HD con stock bajo', time: 'Hace 2h', type: 'warning' },
  { id: 2, text: 'Boda García-López confirmada', time: 'Hace 5h', type: 'success' },
  { id: 3, text: 'Carpa 6×6 sobre-reservada para 15 Nov', time: 'Ayer', type: 'error' },
];

export default function Header({ title, onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const handleOpenNotifications = () => {
    setNotifOpen((prev) => !prev);
    setHasUnread(false);
  };

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
      </div>

      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar eventos, equipos..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Campana con dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleOpenNotifications}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
            aria-label="Notificaciones"
            aria-expanded={notifOpen}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  Notificaciones
                </h3>
                <Badge variant="teal">{mockNotifications.length} nuevas</Badge>
              </div>

              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
                {mockNotifications.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.type === 'warning'
                          ? 'bg-amber-500'
                          : n.type === 'error'
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-slate-200">
                        {n.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700 text-center">
                <button className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline">
                  Ver todas
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="hidden sm:flex items-center gap-3 pl-3 ml-2 border-l border-gray-200 dark:border-slate-700">
          <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold text-sm">
            AK
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              Admin Kleavers
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-tight">
              Coordinador Principal
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}