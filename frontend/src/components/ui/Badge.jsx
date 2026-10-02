const variants = {
  green:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  amber:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  blue:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  red:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  gray:
    'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
  teal:
    'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}