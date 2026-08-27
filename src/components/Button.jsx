const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100'

const variants = {
  primary:
    'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-300/50 hover:shadow-violet-300/70 hover:brightness-105 active:brightness-95 dark:shadow-violet-900/50',
  outline:
    'border border-violet-200 bg-white text-violet-700 hover:bg-violet-50 dark:border-white/10 dark:bg-slate-800 dark:text-violet-300 dark:hover:bg-slate-700',
  danger:
    'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  as: Component = 'button',
  ...props
}) {
  return (
    <Component
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
