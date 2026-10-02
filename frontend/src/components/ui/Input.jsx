import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, icon: Icon, className = '', id, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-lg border bg-white dark:bg-slate-800
            text-sm text-gray-900 dark:text-slate-100
            placeholder-gray-400
            px-3 py-2
            ${Icon ? 'pl-10' : ''}
            ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-slate-700 focus:ring-teal-500'
            }
            focus:outline-none focus:ring-2
            disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

export default Input;