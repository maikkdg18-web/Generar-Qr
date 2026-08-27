import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { qrPreviewValue, summarizeQr } from '../lib/qrContent'
import { useCountUp } from '../lib/useCountUp'
import QrCodeCanvas from '../components/QrCodeCanvas'
import Button from '../components/Button'
import { TYPE_ICONS } from '../components/QrTypeSelector'
import { PlusIcon, QrIcon, ScanIcon, TrashIcon } from '../components/icons'

export default function DashboardPage() {
  const { user } = useAuth()
  const [qrs, setQrs] = useState([])
  const [scanCounts, setScanCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data: qrsData, error: qrsError } = await supabase
        .from('qrs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (qrsError) {
        setError(qrsError.message)
        setLoading(false)
        return
      }

      setQrs(qrsData ?? [])

      if (qrsData && qrsData.length > 0) {
        const { data: scansData, error: scansError } = await supabase
          .from('scans')
          .select('qr_id')
          .in('qr_id', qrsData.map((q) => q.id))

        if (!cancelled && !scansError && scansData) {
          const counts = {}
          for (const scan of scansData) {
            counts[scan.qr_id] = (counts[scan.qr_id] ?? 0) + 1
          }
          setScanCounts(counts)
        }
      }

      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user.id])

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este QR? Esta acción no se puede deshacer.')) return

    const { error } = await supabase.from('qrs').delete().eq('id', id)
    if (error) {
      alert(`Error al eliminar: ${error.message}`)
      return
    }
    setQrs((prev) => prev.filter((q) => q.id !== id))
  }

  const totalScans = Object.values(scanCounts).reduce((a, b) => a + b, 0)
  const firstName = user.email.split('@')[0]
  const qrsCountDisplay = useCountUp(qrs.length)
  const totalScansDisplay = useCountUp(totalScans)

  return (
    <div>
      <div className="animate-fade-up mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-600 via-violet-600 to-fuchsia-500 p-6 text-white shadow-xl shadow-violet-300/50 sm:p-8">
        <p className="text-sm font-medium text-violet-100">Hola, {firstName}</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Tus códigos QR</h1>
        <div className="mt-6 flex gap-6">
          <div>
            <p className="text-2xl font-extrabold tabular-nums">{qrsCountDisplay}</p>
            <p className="text-xs font-medium text-violet-100">QRs creados</p>
          </div>
          <div>
            <p className="text-2xl font-extrabold tabular-nums">{totalScansDisplay}</p>
            <p className="text-xs font-medium text-violet-100">Escaneos totales</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-up mb-4 flex items-center justify-between" style={{ animationDelay: '80ms' }}>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tus QRs</h2>
        <Button as={Link} to="/qrs/new" size="sm" className="hidden sm:inline-flex">
          <PlusIcon className="h-4 w-4" />
          Nuevo QR
        </Button>
      </div>

      {loading && <p className="text-slate-500 dark:text-slate-400">Cargando…</p>}
      {error && <p className="text-rose-600 dark:text-rose-400">{error}</p>}

      {!loading && qrs.length === 0 && (
        <div className="animate-fade-up rounded-[28px] border border-dashed border-violet-200 bg-violet-50/50 p-10 text-center dark:border-violet-900/60 dark:bg-slate-900/60">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/60 dark:text-violet-300">
            <QrIcon className="h-6 w-6" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">Todavía no tienes ningún QR.</p>
          <Button as={Link} to="/qrs/new" size="sm" className="mt-4">
            <PlusIcon className="h-4 w-4" />
            Crear el primero
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {qrs.map((qr, index) => (
          <Link
            key={qr.id}
            to={`/qrs/${qr.id}`}
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            className="animate-fade-up group rounded-[24px] border border-violet-100/70 bg-white p-4 shadow-sm shadow-violet-100 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200 dark:border-white/10 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-violet-950/40"
          >
            <div className="mb-3 flex justify-center rounded-2xl bg-violet-50/70 p-4 dark:bg-white">
              <QrCodeCanvas
                value={qrPreviewValue(qr)}
                colorFg={qr.color_fg}
                colorBg={qr.color_bg}
                logoUrl={qr.logo_url}
                size={130}
              />
            </div>
            <h2 className="truncate font-semibold text-slate-900 dark:text-white">{qr.title || summarizeQr(qr)}</h2>
            <p className="truncate text-sm text-slate-400 dark:text-slate-500">{summarizeQr(qr)}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {new Date(qr.created_at).toLocaleDateString()}
              </span>
              {qr.qr_type === 'url' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
                  <ScanIcon className="h-3.5 w-3.5" />
                  {scanCounts[qr.id] ?? 0}
                </span>
              ) : (
                <span
                  title="Este tipo de QR no tiene seguimiento de escaneos"
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                >
                  {(() => {
                    const Icon = TYPE_ICONS[qr.qr_type]
                    return Icon ? <Icon className="h-3.5 w-3.5" /> : null
                  })()}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                handleDelete(qr.id)
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-rose-100 py-1.5 text-sm text-rose-500 transition hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Eliminar
            </button>
          </Link>
        ))}
      </div>
    </div>
  )
}
