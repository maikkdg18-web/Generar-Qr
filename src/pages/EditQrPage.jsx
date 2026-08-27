import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { buildRedirectUrl } from '../lib/redirectUrl'
import { QR_TYPES, buildQrContent, isQrContentValid } from '../lib/qrContent'
import QrCodeCanvas from '../components/QrCodeCanvas'
import QrTypeFields from '../components/QrTypeFields'
import { TextField } from '../components/FormField'
import Button from '../components/Button'
import { ChevronLeftIcon, DownloadIcon, TrashIcon } from '../components/icons'

const LOGOS_BUCKET = 'logos'

export default function EditQrPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [destinationUrl, setDestinationUrl] = useState('')
  const [payload, setPayload] = useState({})
  const [title, setTitle] = useState('')
  const [colorFg, setColorFg] = useState('#000000')
  const [colorBg, setColorBg] = useState('#FFFFFF')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)

      const { data, error } = await supabase.from('qrs').select('*').eq('id', id).single()

      if (cancelled) return

      if (error) {
        setLoadError(error.message)
        setLoading(false)
        return
      }

      setQr(data)
      setDestinationUrl(data.qr_type === 'url' ? data.destination_url : '')
      setPayload(data.payload ?? {})
      setTitle(data.title ?? '')
      setColorFg(data.color_fg)
      setColorBg(data.color_bg)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const qrType = qr?.qr_type ?? 'url'
  const typeLabel = QR_TYPES.find((t) => t.id === qrType)?.label ?? 'Link'
  const content = useMemo(
    () => buildQrContent(qrType, { destinationUrl, payload }),
    [qrType, destinationUrl, payload]
  )
  const isValid = qr ? isQrContentValid(qrType, { destinationUrl, payload }) : false
  const currentLogoUrl = removeLogo ? null : logoPreview || qr?.logo_url || null

  function handleLogoChange(e) {
    const file = e.target.files?.[0] ?? null
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : null)
    setRemoveLogo(false)
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
    const value = qrType === 'url' ? buildRedirectUrl(qr.short_code) : content
    const svg = await QRCode.toString(value, {
      type: 'svg',
      margin: 2,
      color: { dark: colorFg, light: colorBg },
    })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${qr.short_code}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!isValid) return

    setError(null)
    setSubmitting(true)

    let logoUrl = qr.logo_url

    if (removeLogo) {
      logoUrl = null
    } else if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(LOGOS_BUCKET).upload(path, logoFile)

      if (uploadError) {
        setError(`Error al subir el logo: ${uploadError.message}`)
        setSubmitting(false)
        return
      }

      const { data: publicUrlData } = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(path)
      logoUrl = publicUrlData.publicUrl
    }

    const { error: updateError } = await supabase
      .from('qrs')
      .update({
        destination_url: content,
        payload: qrType === 'url' ? null : payload,
        title: title.trim() || null,
        color_fg: colorFg,
        color_bg: colorBg,
        logo_url: logoUrl,
      })
      .eq('id', id)

    setSubmitting(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    navigate(`/qrs/${id}`)
  }

  if (loading) return <p className="text-slate-500 dark:text-slate-400">Cargando…</p>
  if (loadError) return <p className="text-rose-600 dark:text-rose-400">{loadError}</p>
  if (!qr) return null

  const previewValue = qrType === 'url' ? buildRedirectUrl(qr.short_code) : content

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={`/qrs/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Volver
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white">
        Editar QR <span className="text-base font-medium text-slate-400 dark:text-slate-500">· {typeLabel}</span>
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <form
          onSubmit={handleSave}
          className="animate-fade-up space-y-4 rounded-[28px] border border-violet-100/70 bg-white p-6 shadow-sm shadow-violet-100 dark:border-white/10 dark:bg-slate-900 dark:shadow-none md:col-span-3"
        >
          <QrTypeFields
            qrType={qrType}
            destinationUrl={destinationUrl}
            onDestinationUrlChange={setDestinationUrl}
            payload={payload}
            onPayloadChange={setPayload}
          />

          <TextField
            id="title"
            label="Título (opcional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="colorFg">
                Color frente
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-slate-800">
                <input
                  id="colorFg"
                  type="color"
                  value={colorFg}
                  onChange={(e) => setColorFg(e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">{colorFg}</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="colorBg">
                Color fondo
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 dark:border-white/10 dark:bg-slate-800">
                <input
                  id="colorBg"
                  type="color"
                  value={colorBg}
                  onChange={(e) => setColorBg(e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">{colorBg}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="logo">
              Logo (opcional)
            </label>
            <input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full text-sm text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-violet-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-200 dark:text-slate-400 dark:file:bg-violet-900/60 dark:file:text-violet-300 dark:hover:file:bg-violet-900"
            />
            {currentLogoUrl && (
              <button
                type="button"
                onClick={() => {
                  setRemoveLogo(true)
                  setLogoFile(null)
                  setLogoPreview(null)
                }}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600"
              >
                <TrashIcon className="h-3.5 w-3.5" />
                Quitar logo
              </button>
            )}
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">{error}</p>}

          <Button type="submit" disabled={submitting || !isValid} className="w-full">
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>

        <div
          className="animate-fade-up flex flex-col items-center justify-center gap-4 rounded-[28px] bg-gradient-to-br from-violet-600 to-fuchsia-500 p-6 text-center shadow-xl shadow-violet-300/50 dark:shadow-violet-950/50 md:col-span-2"
          style={{ animationDelay: '100ms' }}
        >
          <p className="text-sm font-medium text-violet-100">Vista previa</p>
          <div className="relative">
            <div className="animate-spin-slow pointer-events-none absolute -inset-5 rounded-full border-2 border-dashed border-white/25" />
            <div className="animate-spin-slow pointer-events-none absolute -inset-9 rounded-full border border-dashed border-white/15 [animation-direction:reverse] [animation-duration:34s]" />
            <div className="relative rounded-3xl bg-white p-4 shadow-lg">
              <QrCodeCanvas
                canvasRef={canvasRef}
                value={previewValue}
                colorFg={colorFg}
                colorBg={colorBg}
                logoUrl={currentLogoUrl}
                size={200}
              />
            </div>
          </div>

          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={downloadPng}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-white/25 active:scale-95"
            >
              <DownloadIcon className="h-4 w-4" />
              PNG
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-white/25 active:scale-95"
            >
              <DownloadIcon className="h-4 w-4" />
              SVG
            </button>
          </div>
          <p className="text-xs text-violet-100">
            {qrType === 'url' ? 'La URL corta no cambia — solo hacia dónde redirige' : 'Este QR se regenera con el nuevo contenido'}
          </p>
        </div>
      </div>
    </div>
  )
}
