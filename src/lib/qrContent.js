import { buildRedirectUrl } from './redirectUrl'

export const QR_TYPES = [
  { id: 'url', label: 'Link' },
  { id: 'wifi', label: 'WiFi' },
  { id: 'vcard', label: 'Contacto' },
  { id: 'text', label: 'Texto' },
  { id: 'email', label: 'Email' },
]

export function normalizeUrl(raw) {
  const trimmed = (raw ?? '').trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function escapeWifi(value = '') {
  return value.replace(/([\\;,:"])/g, '\\$1')
}

function buildWifiContent({ ssid = '', password = '', security = 'WPA' } = {}) {
  const pass = security === 'nopass' ? '' : escapeWifi(password)
  return `WIFI:T:${security};S:${escapeWifi(ssid)};P:${pass};;`
}

function buildVCardContent({ name = '', phone = '', email = '', org = '' } = {}) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  if (name) lines.push(`FN:${name}`)
  if (org) lines.push(`ORG:${org}`)
  if (phone) lines.push(`TEL:${phone}`)
  if (email) lines.push(`EMAIL:${email}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

function buildEmailContent({ to = '', subject = '', body = '' } = {}) {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return `mailto:${to}${query ? `?${query}` : ''}`
}

// Arma el contenido final que se codifica en el QR según el tipo.
export function buildQrContent(qrType, { destinationUrl, payload } = {}) {
  switch (qrType) {
    case 'wifi':
      return buildWifiContent(payload)
    case 'vcard':
      return buildVCardContent(payload)
    case 'email':
      return buildEmailContent(payload)
    case 'text':
      return payload?.value ?? ''
    case 'url':
    default:
      return normalizeUrl(destinationUrl)
  }
}

export function isQrContentValid(qrType, { destinationUrl, payload } = {}) {
  switch (qrType) {
    case 'wifi':
      return !!payload?.ssid?.trim()
    case 'vcard':
      return !!payload?.name?.trim()
    case 'text':
      return !!payload?.value?.trim()
    case 'email':
      return !!payload?.to?.trim()
    case 'url':
    default:
      return !!normalizeUrl(destinationUrl)
  }
}

// Valor a codificar en el QR de un registro ya guardado.
export function qrPreviewValue(qr) {
  return qr.qr_type === 'url' ? buildRedirectUrl(qr.short_code) : qr.destination_url
}

// Texto corto para mostrar en tarjetas/listas.
export function summarizeQr(qr) {
  switch (qr.qr_type) {
    case 'wifi':
      return `Red WiFi: ${qr.payload?.ssid || '—'}`
    case 'vcard':
      return `Contacto: ${qr.payload?.name || '—'}`
    case 'email':
      return `Email a ${qr.payload?.to || '—'}`
    case 'text':
      return qr.payload?.value || '—'
    case 'url':
    default:
      return qr.destination_url
  }
}
