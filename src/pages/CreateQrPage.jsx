import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { generateShortCode } from '../lib/shortCode'
import { buildQrContent, isQrContentValid } from '../lib/qrContent'
import QrCodeCanvas from '../components/QrCodeCanvas'
import QrTypeSelector from '../components/QrTypeSelector'
import QrTypeFields from '../components/QrTypeFields'
import { TextField } from '../components/FormField'
import Button from '../components/Button'
import { ChevronLeftIcon, DownloadIcon } from '../components/icons'

const LOGOS_BUCKET = 'logos'
const PLACEHOLDER_VALUE = 'https://tu-link.com'

export default function CreateQrPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [qrType, setQrType] = useState('url')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [payload, setPayload] = useState({})
  const [title, setTitle] = useState('')
  const [colorFg, setColorFg] = useState('#000000')
  const [colorBg, setColorBg] = useState('#FFFFFF')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const content = useMemo(
    () => buildQrContent(qrType, { destinationUrl, payload }),
    [qrType, destinationUrl, payload]
  )
  const isValid = isQrContentValid(qrType, { destinationUrl, payload })
  const previewValue = isValid ? content : PLACEHOLDER_VALUE

  function handleTypeChange(nextType) {
    setQrType(nextType)
    setPayload({})
    setError(null)
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0] ?? null
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : null)
  }

  function downloadPng() {
    if (!canvasRef.current || !isValid) return
    const url = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr.png'
    a.click()
  }

  async function downloadSvg() {
    if (!isValid) return
    const svg = await QRCode.toString(content, {
      type: 'svg',
      margin: 2,
      color: { dark: colorFg, light: colorBg },
    })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!user || !isValid) return

    setError(null)
    setSubmitting(true)

    let logoUrl = null

    if (logoFile) {
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

    let shortCode = generateShortCode()
    let insertError = null
    let insertedId = null

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await supabase
        .from('qrs')
        .insert({
          user_id: user.id,
          short_code: shortCode,
          qr_type: qrType,
          destination_url: content,
          payload: qrType === 'url' ? null : payload,
          is_dynamic: qrType === 'url',
          title: title.trim() || null,
          color_fg: colorFg,
          color_bg: colorBg,
          logo_url: logoUrl,
        })
        .select('id')
        .single()

      if (!error) {
        insertedId = data.id
        insertError = null
        break
      }

      // 23505 = unique_violation, en caso de colisión de short_code reintentamos
      if (error.code === '23505') {
        shortCode = generateShortCode()
        insertError = error
        continue
      }

      insertError = error
      break
    }

    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    navigate(`/qrs/${insertedId}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      {user && (
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Volver
        </Link>
      )}
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white">
        {user ? 'Nuevo QR' : 'Genera tu código QR'}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <form
          onSubmit={handleSave}
          className="animate-fade-up space-y-4 rounded-[28px] border border-violet-100/70 bg-white p-6 shadow-sm shadow-violet-100 dark:border-white/10 dark:bg-slate-900 dark:shadow-none md:col-span-3"
        >
          <QrTypeSelector value={qrType} onChange={handleTypeChange} disabled={submitting} />

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
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">{error}</p>}

          {user ? (
            <Button type="submit" disabled={submitting || !isValid} className="w-full">
              {submitting ? 'Guardando…' : 'Guardar QR'}
            </Button>
          ) : (
            <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 p-4 text-center dark:border-violet-900/60 dark:bg-violet-950/30">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Estás generando este QR sin cuenta: se puede descargar, pero no se guardará ni tendrá seguimiento de escaneos.
              </p>
              <Button as={Link} to="/login" variant="outline" size="sm" className="mt-3">
                Iniciar sesión para guardarlo
              </Button>
            </div>
          )}
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
                logoUrl={logoPreview}
                size={200}
              />
            </div>
          </div>

          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={downloadPng}
              disabled={!isValid}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-white/25 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <DownloadIcon className="h-4 w-4" />
              PNG
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              disabled={!isValid}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-white/25 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              <DownloadIcon className="h-4 w-4" />
              SVG
            </button>
          </div>
          <p className="text-xs text-violet-100">
            {isValid ? 'Ya podés descargarlo' : 'Completá los campos para generar tu QR'}
          </p>
        </div>
      </div>
    </div>
  )
}
