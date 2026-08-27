import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout'
import { CONTACT_EMAIL } from '../lib/site'

export default function ContactPage() {
  return (
    <LegalPageLayout title="Contacto" subtitle="¿Dudas, sugerencias o querés reportar un QR?">
      <LegalSection title="Escribinos">
        <p>
          Podés escribirnos directamente por correo a:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-violet-600 hover:underline dark:text-violet-400">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>Intentamos responder lo antes posible.</p>
      </LegalSection>

      <LegalSection title="Reportar un QR abusivo o fraudulento">
        <p>
          Si un QR generado con esta herramienta te llevó a un sitio malicioso o parece un
          intento de fraude, escribinos indicando el link corto (por ejemplo
          .../redirector/abc1234) o el destino al que redirige, y lo revisamos.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
