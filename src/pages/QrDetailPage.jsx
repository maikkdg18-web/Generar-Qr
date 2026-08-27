import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../lib/supabase'
import { qrPreviewValue, summarizeQr } from '../lib/qrContent'
import QrCodeCanvas from '../components/QrCodeCanvas'
import Button from '../components/Button'
import { ChevronLeftIcon, DownloadIcon, PencilIcon, ScanIcon, TrashIcon } from '../components/icons'

export default function QrDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [qr, setQr] = useState(null)
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data: qrData, error: qrError } = await supabase
        .from('qrs')
        .select('*')
        .eq('id', id)
        .single()

      if (cancelled) return

      if (qrError) {
        setError(qrError.message)
        setLoading(false)
        return
      }

      setQr(qrData)

      const { data: scansData, error: scansError } = await supabase
        .from('scans')
        .select('*')
        .eq('qr_id', id)
        .order('scanned_at', { ascending: false })

      if (!cancelled && !scansError) {
        setScans(scansData ?? [])
      }

      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    if (!confirm('¿Eliminar este QR? Esta acción no se puede deshacer.')) return
    const { error } = await supabase.from('qrs').delete().eq('id', id)
    if (error) {
      alert(`Error al eliminar: ${error.message}`)
      return
    }
    navigate('/')
  }

  function downloadPng() {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${qr.short_code}.png`
    a.click()
  }

  async function downloadSvg() {
    const svg = await QRCode.toString(qrPreviewValue(qr), {
      type: 'svg',
      margin: 2,
      color: { dark: qr.color_fg, light: qr.color_bg },
    })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${qr.short_code}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <p className="text-slate-500 dark:text-slate-400">Cargando…</p>
  if (error) return <p className="text-rose-600 dark:text-rose-400">{error}</p>
  if (!qr) return null

  const scansByDay = Object.values(
    scans.reduce((acc, scan) => {
      const day = new Date(scan.scanned_at).toLocaleDateString()
      acc[day] = acc[day] || { day, count: 0 }
      acc[day].count += 1
      return acc
    }, {})
  ).reverse()

  return (
    <div>
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">
        <ChevronLeftIcon className="h-4 w-4" />
        Volver
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="animate-fade-up">
          <h1 className="mb-4 text-2xl font-extrabold text-slate-900 dark:text-white">
            {qr.title || summarizeQr(qr)}
          </h1>

          <div className="rounded-[28px] bg-gradient-to-br from-violet-600 to-fuchsia-500 p-6 shadow-xl shadow-violet-300/50 dark:shadow-violet-950/50">
            <div className="relative mx-auto w-fit">
              <div className="animate-spin-slow pointer-events-none absolute -inset-5 rounded-full border-2 border-dashed border-white/25" />
              <div className="animate-spin-slow pointer-events-none absolute -inset-9 rounded-full border border-dashed border-white/15 [animation-direction:reverse] [animation-duration:34s]" />
              <div className="relative flex justify-center rounded-3xl bg-white p-5">
                <QrCodeCanvas
                  canvasRef={canvasRef}
                  value={qrPreviewValue(qr)}
                  colorFg={qr.color_fg}
                  colorBg={qr.color_bg}
                  logoUrl={qr.logo_url}
                  size={240}
                />
              </div>
            </div>

            <dl className="mt-5 space-y-1.5 text-sm text-violet-50">
              {qr.qr_type === 'url' && (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-violet-200">Destino</dt>
                    <dd className="truncate text-right">
                      <a href={qr.destination_url} target="_blank" rel="noreferrer" className="hover:underline">
                        {qr.destination_url}
                      </a>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-violet-200">URL corta</dt>
                    <dd className="truncate text-right">{qrPreviewValue(qr)}</dd>
                  </div>
                </>
              )}
              {qr.qr_type === 'wifi' && (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-violet-200">Red (SSID)</dt>
                    <dd className="truncate text-right">{qr.payload?.ssid}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-violet-200">Seguridad</dt>
                    <dd className="truncate text-right">{qr.payload?.security === 'nopass' ? 'Red abierta' : qr.payload?.security}</dd>
                  </div>
                </>
              )}
              {qr.qr_type === 'vcard' && (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-violet-200">Nombre</dt>
                    <dd className="truncate text-right">{qr.payload?.name}</dd>
                  </div>
                  {qr.payload?.phone && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-violet-200">Teléfono</dt>
                      <dd className="truncate text-right">{qr.payload.phone}</dd>
                    </div>
                  )}
                  {qr.payload?.email && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-violet-200">Email</dt>
                      <dd className="truncate text-right">{qr.payload.email}</dd>
                    </div>
                  )}
                </>
              )}
              {qr.qr_type === 'email' && (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-violet-200">Para</dt>
                    <dd className="truncate text-right">{qr.payload?.to}</dd>
                  </div>
                  {qr.payload?.subject && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-violet-200">Asunto</dt>
                      <dd className="truncate text-right">{qr.payload.subject}</dd>
                    </div>
                  )}
                </>
              )}
              {qr.qr_type === 'text' && (
                <div className="flex justify-between gap-4">
                  <dt className="text-violet-200">Texto</dt>
                  <dd className="truncate text-right">{qr.payload?.value}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-violet-200">Creado</dt>
                <dd className="text-right">{new Date(qr.created_at).toLocaleString()}</dd>
              </div>
            </dl>

            <div className="mt-5 flex gap-2">
              <button
                onClick={downloadPng}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-white/25 active:scale-95"
              >
                <DownloadIcon className="h-4 w-4" />
                PNG
              </button>
              <button
                onClick={downloadSvg}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-white/25 active:scale-95"
              >
                <DownloadIcon className="h-4 w-4" />
                SVG
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button as={Link} to={`/qrs/${id}/edit`} variant="outline" className="flex-1">
              <PencilIcon className="h-4 w-4" />
              Editar
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              <TrashIcon className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <ScanIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            Escaneos ({scans.length})
          </h2>

          {qr.qr_type !== 'url' && (
            <div className="rounded-[24px] border border-dashed border-violet-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-400 dark:border-violet-900/60 dark:bg-slate-900/40 dark:text-slate-500">
              Este tipo de QR no tiene seguimiento de escaneos: el contenido queda codificado directamente en la imagen, no hay un link de por medio.
            </div>
          )}

          {qr.qr_type === 'url' && scansByDay.length > 0 && (
            <div className="mb-6 h-56 rounded-[24px] border border-violet-100/70 bg-white p-4 shadow-sm shadow-violet-100 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scansByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" className="dark:opacity-10" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: '#f5f3ff' }} contentStyle={{ borderRadius: 12 }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {qr.qr_type === 'url' && (scans.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-violet-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-400 dark:border-violet-900/60 dark:bg-slate-900/40 dark:text-slate-500">
              Todavía no hay escaneos.
            </div>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {scans.map((scan, index) => (
                <div
                  key={scan.id}
                  style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
                  className="animate-fade-up rounded-2xl border border-violet-100/70 bg-white p-4 shadow-sm shadow-violet-100 dark:border-white/10 dark:bg-slate-900 dark:shadow-none"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(scan.scanned_at).toLocaleString()}
                    </span>
                    {scan.ip_country && (
                      <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
                        {scan.ip_country}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-xs text-slate-400 dark:text-slate-500" title={scan.user_agent}>
                    {scan.user_agent || 'User agent desconocido'}
                  </p>
                  {scan.referrer && (
                    <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500" title={scan.referrer}>
                      Desde: {scan.referrer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
