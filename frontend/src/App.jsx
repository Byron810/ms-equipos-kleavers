import { useTheme } from './context/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <h1 className="text-4xl font-bold mb-6">
        Modo actual: {theme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
      </h1>
      <button
        onClick={toggleTheme}
        className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
      >
        Cambiar tema
      </button>
    </div>
  );
}

export default App;