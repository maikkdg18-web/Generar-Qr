import { useEffect, useRef, useState } from 'react'
import { LogoutIcon } from './icons'

export default function ProfileMenu({ email, onSignOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initial = email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Tu cuenta"
        className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white shadow-md shadow-violet-300/50"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-violet-100 bg-white p-2 shadow-xl shadow-violet-200/60 dark:border-white/10 dark:bg-slate-800 dark:shadow-black/40">
          <p className="truncate px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400">{email}</p>
          <button
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <LogoutIcon className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
