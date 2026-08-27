import { SelectField, TextareaField, TextField } from './FormField'

const SECURITY_OPTIONS = [
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'Red abierta' },
]

export default function QrTypeFields({ qrType, destinationUrl, onDestinationUrlChange, payload, onPayloadChange }) {
  function set(key) {
    return (e) => onPayloadChange({ ...payload, [key]: e.target.value })
  }

  if (qrType === 'wifi') {
    return (
      <>
        <TextField
          id="ssid"
          label="Nombre de red (SSID) *"
          required
          value={payload.ssid || ''}
          onChange={set('ssid')}
        />
        <SelectField
          id="security"
          label="Seguridad"
          value={payload.security || 'WPA'}
          onChange={set('security')}
          options={SECURITY_OPTIONS}
        />
        {payload.security !== 'nopass' && (
          <TextField id="wifiPassword" label="Contraseña" value={payload.password || ''} onChange={set('password')} />
        )}
      </>
    )
  }

  if (qrType === 'vcard') {
    return (
      <>
        <TextField id="name" label="Nombre *" required value={payload.name || ''} onChange={set('name')} />
        <TextField id="org" label="Empresa / cargo (opcional)" value={payload.org || ''} onChange={set('org')} />
        <TextField id="phone" label="Teléfono (opcional)" value={payload.phone || ''} onChange={set('phone')} />
        <TextField id="vcardEmail" label="Email (opcional)" type="email" value={payload.email || ''} onChange={set('email')} />
      </>
    )
  }

  if (qrType === 'text') {
    return (
      <TextareaField
        id="textValue"
        label="Texto *"
        required
        rows={5}
        value={payload.value || ''}
        onChange={set('value')}
      />
    )
  }

  if (qrType === 'email') {
    return (
      <>
        <TextField id="to" label="Para (email) *" required type="email" value={payload.to || ''} onChange={set('to')} />
        <TextField id="subject" label="Asunto (opcional)" value={payload.subject || ''} onChange={set('subject')} />
        <TextareaField
          id="body"
          label="Mensaje (opcional)"
          rows={3}
          value={payload.body || ''}
          onChange={set('body')}
        />
      </>
    )
  }

  return (
    <TextField
      id="destinationUrl"
      label="Link destino *"
      required
      placeholder="https://ejemplo.com"
      value={destinationUrl}
      onChange={(e) => onDestinationUrlChange(e.target.value)}
    />
  )
}
