import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import { QrIcon } from '../components/icons'

export default function LoginPage() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const { error } = mode === 'signin' ? await signIn(email, password) : await signUp(email, password)

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    if (mode === 'signup') {
      setInfo('Cuenta creada. Si tu proyecto requiere confirmación de email, revisa tu bandeja de entrada.')
    }

    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 dark:bg-slate-950">
      <div className="animate-fade-up w-full max-w-sm overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-600 via-violet-600 to-fuchsia-500 p-8 shadow-2xl shadow-violet-300/60 dark:shadow-violet-950/60">
        <div className="mb-8 flex items-center gap-2">
          <span className="animate-rock grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-white">
            <QrIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold text-white">ScannQR</span>
        </div>

        <h1 className="text-3xl font-extrabold leading-tight text-white">
          {mode === 'signin' ? (
            <>
              Hola de nuevo,
              <br />
              inicia sesión
            </>
          ) : (
            <>
              Crea tu cuenta
              <br />
              en segundos
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-violet-100">
          Genera y gestiona tus códigos QR dinámicos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-violet-100" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-white focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-violet-100" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-white focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-white/15 px-3 py-2 text-sm text-white">{error}</p>
          )}
          {info && (
            <p className="rounded-xl bg-white/15 px-3 py-2 text-sm text-white">{info}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full !bg-white !bg-none !text-violet-700 shadow-lg shadow-black/10"
          >
            {submitting ? 'Procesando…' : mode === 'signin' ? 'Entrar' : 'Registrarme'}
          </Button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
            setInfo(null)
          }}
          className="mt-5 w-full text-center text-sm font-medium text-violet-100 hover:text-white"
        >
          {mode === 'signin' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  )
}
