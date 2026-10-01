import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-teal-600 hover:bg-teal-700 text-white shadow-sm disabled:bg-teal-400',
  secondary:
    'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:bg-red-400',
  ghost:
    'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg transition
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1
        disabled:cursor-not-allowed disabled:opacity-70
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}