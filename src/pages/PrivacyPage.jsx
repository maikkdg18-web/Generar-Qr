import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout'
import { CONTACT_EMAIL, SITE_NAME } from '../lib/site'

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Política de Privacidad" subtitle="Última actualización: agosto de 2026.">
      <LegalSection title="1. Qué datos recolectamos">
        <p>
          Si te registrás, guardamos tu email y los QRs que creás (link de destino, título,
          colores, logo opcional). Si un QR es dinámico, también registramos cada escaneo:
          fecha, user agent del navegador y referrer. No guardamos tu dirección IP ni identificamos
          a la persona que escanea — es solo información agregada para que veas estadísticas de
          tu propio QR.
        </p>
      </LegalSection>

      <LegalSection title="2. Modo invitado">
        <p>
          Si generás un QR sin iniciar sesión, no se guarda en ningún servidor: se genera y se
          descarga directamente en tu navegador.
        </p>
      </LegalSection>

      <LegalSection title="3. Dónde se alojan los datos">
        <p>
          Usamos <strong>Supabase</strong> (autenticación, base de datos y almacenamiento de
          logos) como proveedor de backend. {SITE_NAME} no usa publicidad ni trackers de
          terceros.
        </p>
      </LegalSection>

      <LegalSection title="4. Eliminar tu cuenta o tus datos">
        <p>
          Podés borrar cada QR individualmente desde el detalle. Si querés eliminar tu cuenta por
          completo, escribinos a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet-600 hover:underline dark:text-violet-400">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
