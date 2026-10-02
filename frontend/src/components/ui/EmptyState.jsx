import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No hay datos',
  description = 'No se encontraron resultados para mostrar.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
        <Icon size={24} className="text-gray-400 dark:text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm mb-4">
        {description}
      </p>
      {action}
    </div>
  );
}