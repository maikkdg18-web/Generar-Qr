import { Link } from 'react-router-dom'
import LegalPageLayout, { LegalSection } from '../components/LegalPageLayout'
import { SITE_NAME } from '../lib/site'

export default function AboutPage() {
  return (
    <LegalPageLayout title="Acerca de" subtitle={`Qué es ${SITE_NAME} y para qué sirve.`}>
      <LegalSection title="Qué es">
        <p>
          <strong>{SITE_NAME}</strong> es una herramienta para crear códigos QR: dinámicos (con
          link editable después de imprimirlos y estadísticas de escaneo) y estáticos (WiFi,
          tarjeta de contacto, texto o email), sin necesidad de instalar nada.
        </p>
      </LegalSection>

      <LegalSection title="Para qué se usa">
        <p>
          Pensada para usos cotidianos y legítimos: compartir el menú de un local, la red WiFi de
          tu casa u oficina, tu tarjeta de contacto en un evento, el link de tu negocio en un
          flyer, o cualquier información que quieras que alguien obtenga escaneando un código en
          vez de escribiendo un link a mano.
        </p>
      </LegalSection>

      <LegalSection title="Cómo funciona">
        <p>
          Podés generar y descargar un QR sin cuenta — no se guarda en ningún lado, se genera en
          tu propio navegador. Si te registrás, el QR queda guardado con seguimiento de escaneos y
          podés editar hacia dónde apunta después, sin tener que reimprimirlo.
        </p>
        <p>
          Como el destino de un QR dinámico se puede cambiar en cualquier momento, es importante
          usarlo de forma responsable — más detalle en los{' '}
          <Link to="/terminos-de-uso" className="text-violet-600 hover:underline dark:text-violet-400">
            Términos de Uso
          </Link>{' '}
          y en la{' '}
          <Link to="/politica-de-privacidad" className="text-violet-600 hover:underline dark:text-violet-400">
            Política de Privacidad
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
