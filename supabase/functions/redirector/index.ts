import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  const url = new URL(req.url)
  // Soporta tanto /redirector/:short_code como /redirector?code=:short_code
  const pathParts = url.pathname.split('/').filter(Boolean)
  const shortCode = pathParts[pathParts.length - 1] === 'redirector'
    ? url.searchParams.get('code')
    : pathParts[pathParts.length - 1]

  if (!shortCode) {
    return new Response('Falta el short_code', { status: 400 })
  }

  const { data: qr, error } = await supabaseAdmin
    .from('qrs')
    .select('id, destination_url')
    .eq('short_code', shortCode)
    .single()

  if (error || !qr) {
    return new Response('QR no encontrado', { status: 404 })
  }

  await supabaseAdmin.from('scans').insert({
    qr_id: qr.id,
    user_agent: req.headers.get('user-agent'),
    referrer: req.headers.get('referer'),
  })

  return new Response(null, {
    status: 302,
    headers: { Location: qr.destination_url },
  })
})
