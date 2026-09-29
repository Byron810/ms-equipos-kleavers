import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-slate-700">
      <p className="text-sm text-gray-600 dark:text-slate-400">
        Mostrando <span className="font-medium">{start}</span>–
        <span className="font-medium">{end}</span> de{' '}
        <span className="font-medium">{totalRecords}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-slate-300"
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="px-3 text-sm font-medium text-gray-700 dark:text-slate-200">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-slate-300"
          aria-label="Página siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}