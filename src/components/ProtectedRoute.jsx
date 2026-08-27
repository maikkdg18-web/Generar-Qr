import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ redirectTo = '/login' }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 to-white text-slate-400 dark:from-slate-950 dark:to-slate-950">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600 dark:border-violet-800 dark:border-t-violet-400" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
