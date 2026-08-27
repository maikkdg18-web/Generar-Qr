import { Link } from 'react-router-dom'
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout'
import { CONTACT_EMAIL, SITE_NAME } from '../lib/site'

export default function TermsPage() {
  return (
    <LegalPageLayout title="Términos de Uso" subtitle="Última actualización: agosto de 2026.">
      <LegalSection title="1. Qué es este servicio">
        <p>
          {SITE_NAME} es una herramienta para generar códigos QR de uso personal o comercial
          legítimo. Al usarla, aceptás estos términos.
        </p>
      </LegalSection>

      <LegalSection title="2. Uso permitido">
        <p>
          Podés usar {SITE_NAME} para compartir enlaces, redes WiFi, datos de contacto, texto o
          direcciones de email que vos mismo/a tenés derecho a distribuir: tu negocio, tu evento,
          tu red doméstica, tu información de contacto, etc.
        </p>
      </LegalSection>

      <LegalSection title="3. Uso prohibido">
        <p>Está prohibido usar {SITE_NAME} para:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Phishing, suplantación de identidad o de marcas/empresas que no te pertenecen.</li>
          <li>Distribuir malware, virus o software malicioso.</li>
          <li>Fraude, estafas o cualquier engaño hacia quien escanea el código.</li>
          <li>Contenido ilegal, difamatorio o que viole derechos de terceros.</li>
          <li>Spam masivo o acoso.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Responsabilidad del usuario">
        <p>
          Sos el único responsable del contenido al que apunta tu QR, incluso si lo cambiás
          después de haberlo impreso o compartido. {SITE_NAME} no revisa ni aprueba los destinos de
          los QRs que se crean en la plataforma.
        </p>
      </LegalSection>

      <LegalSection title="5. Suspensión">
        <p>
          Nos reservamos el derecho de eliminar cualquier QR o cuenta que viole estos términos,
          especialmente ante reportes de phishing, fraude o contenido malicioso, sin previo aviso.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilidad">
        <p>
          El servicio se ofrece "tal cual", sin garantía de disponibilidad continua del
          redirector de QRs dinámicos.
        </p>
      </LegalSection>

      <LegalSection title="7. Reportar un abuso">
        <p>
          Si encontraste un QR generado con {SITE_NAME} que te parece fraudulento o malicioso,
          escribinos a{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet-600 hover:underline dark:text-violet-400">
            {CONTACT_EMAIL}
          </a>{' '}
          indicando el link corto o el destino del QR. También podés visitar la página de{' '}
          <Link to="/contacto" className="text-violet-600 hover:underline dark:text-violet-400">
            Contacto
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
