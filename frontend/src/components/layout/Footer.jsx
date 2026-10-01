export default function Footer() {
  const version = import.meta.env.VITE_APP_VERSION || 'dev';

  return (
    <footer className="h-12 px-4 sm:px-6 flex items-center justify-between text-xs bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
      <span>© {new Date().getFullYear()} Kleavers — Diseño de Software</span>
      <span className="font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
        v{version}
      </span>
    </footer>
  );
}