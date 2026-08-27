import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from './icons'

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

export default function LegalPageLayout({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Volver
      </Link>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{subtitle}</p>}
      <div className="animate-fade-up mt-6 space-y-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </div>
  )
}
