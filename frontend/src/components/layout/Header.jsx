  import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
  import { useTheme } from '../../context/ThemeContext';

  export default function Header({ title, onToggleSidebar }) {
    const { theme, toggleTheme } = useTheme();

    return (
      <header className="flex items-center justify-between gap-4 px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        {/* Título + menú móvil */}
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

        {/* Buscador */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar eventos, equipos..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
            aria-label="Notificaciones"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Perfil */}
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