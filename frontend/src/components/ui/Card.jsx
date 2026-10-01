export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800
        rounded-xl border border-gray-200 dark:border-slate-700
        shadow-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}