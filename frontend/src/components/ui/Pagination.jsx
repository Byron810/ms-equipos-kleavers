import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const start = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  // Genera array de páginas visibles con elipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-slate-700">
      {/* Info de registros */}
      <p className="text-sm text-gray-600 dark:text-slate-400">
        Mostrando <span className="font-medium">{start}-{end}</span> de{' '}
        <span className="font-medium">{totalRecords}</span> resultados
      </p>

      {/* Controles a la derecha */}
      <div className="flex items-center gap-4">
        {/* Filas por página */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <span>Filas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Números de página */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-slate-300"
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>

          {getPageNumbers().map((num, i) =>
            num === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-sm text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={num}
                onClick={() => onPageChange(num)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition ${
                  num === currentPage
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-slate-300"
            aria-label="Página siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}