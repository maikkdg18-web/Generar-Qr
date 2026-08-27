const explicitBase = import.meta.env.VITE_REDIRECT_BASE_URL

function deriveFunctionsBase() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) return ''
  // https://<project-ref>.supabase.co -> https://<project-ref>.functions.supabase.co/redirector
  const match = supabaseUrl.match(/^https:\/\/([^.]+)\.supabase\.co/)
  if (!match) return ''
  return `https://${match[1]}.functions.supabase.co/redirector`
}

const base = explicitBase || deriveFunctionsBase()

export function buildRedirectUrl(shortCode) {
  return `${base}/${shortCode}`
}
