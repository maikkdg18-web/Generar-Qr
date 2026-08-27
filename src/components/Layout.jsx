import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'
import { LogoutIcon, PlusIcon, QrIcon } from './icons'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-violet-100/80 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-300/50">
              <QrIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">ScannQR</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/qrs/new"
                className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-300/50 hover:brightness-105 sm:inline-flex"
              >
                <PlusIcon className="h-4 w-4" />
                Nuevo QR
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 dark:border-white/10 dark:text-violet-300 dark:hover:bg-slate-800 sm:inline-flex"
              >
                Iniciar sesión
              </Link>
            )}
            <ThemeToggle />
            {user && <ProfileMenu email={user.email} onSignOut={handleSignOut} />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:pb-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-violet-100 bg-white/90 py-2 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90 sm:hidden">
        {user ? (
          <>
            <Link to="/" className="flex flex-col items-center gap-0.5 px-4 py-1 text-violet-700 dark:text-violet-300">
              <QrIcon className="h-5 w-5" />
              <span className="text-[11px] font-medium">Mis QRs</span>
            </Link>
            <Link
              to="/qrs/new"
              className="grid h-12 w-12 -translate-y-3 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-300/60"
            >
              <PlusIcon className="h-6 w-6" />
            </Link>
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center gap-0.5 px-4 py-1 text-slate-400 dark:text-slate-500"
            >
              <LogoutIcon className="h-5 w-5" />
              <span className="text-[11px] font-medium">Salir</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/qrs/new" className="flex flex-col items-center gap-0.5 px-4 py-1 text-violet-700 dark:text-violet-300">
              <QrIcon className="h-5 w-5" />
              <span className="text-[11px] font-medium">Crear QR</span>
            </Link>
            <Link to="/login" className="flex flex-col items-center gap-0.5 px-4 py-1 text-slate-400 dark:text-slate-500">
              <LogoutIcon className="h-5 w-5 rotate-180" />
              <span className="text-[11px] font-medium">Entrar</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
