import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de tratamiento de datos personales de EDNA ATELIER en Bogotá, Colombia conforme a la Ley 1581 de 2012.",
  alternates: { canonical: "/privacidad" },
  openGraph: {
    type: "website",
    url: "/privacidad",
    title: "Política de Privacidad · EDNA ATELIER",
    description:
      "Política de tratamiento de datos personales de EDNA ATELIER en Bogotá, Colombia conforme a la Ley 1581 de 2012.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <article className="glass-surface space-y-6 rounded-xl p-6 sm:p-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">
            Información Legal · Colombia
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-ink sm:text-4xl">
            Política de Privacidad
          </h1>
          <p className="mt-2 text-sm text-ink/75">
            {SITE_NAME} · Bogotá, D.C. · Última actualización: noviembre de 2026
          </p>
        </header>

        <section className="space-y-2 text-sm leading-relaxed text-ink/85">
          <h2 className="text-lg font-semibold text-ink">1. Responsable del tratamiento</h2>
          <p>
            <strong>{SITE_NAME}</strong> (taller de confección y comercio en Bogotá, sector San
            Victorino) trata tus datos personales conforme a la Ley 1581 de 2012 y el Decreto 1377
            de 2013 de protección de datos personales en Colombia. Puedes contactarnos en{" "}
            <strong>{CONTACT_EMAIL}</strong> o mediante nuestra línea oficial de WhatsApp.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-ink/85">
          <h2 className="text-lg font-semibold text-ink">2. Datos que recopilamos y finalidad</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Gestión de pedidos y despachos:</strong> nombre, celular/WhatsApp, correo,
              dirección, ciudad y barrio o localidad para coordinar entregas en Bogotá y envíos
              nacionales.
            </li>
            <li>
              <strong>Pedidos por WhatsApp:</strong> al pulsar el botón de pedido por WhatsApp, se
              genera un mensaje con el detalle de la prenda o carrito para continuar la atención en
              tu aplicación de WhatsApp.
            </li>
            <li>
              <strong>Catálogos y remates:</strong> correo electrónico únicamente si autorizas la
              suscripción a novedades y remates del taller.
            </li>
            <li>
              <strong>Analítica opcional:</strong> si aceptas la categoría de analítica, usamos
              Google Analytics 4 para medir visitas e interacciones generales con el catálogo, el
              carrito, el checkout y los enlaces de WhatsApp. No enviamos a GA4 nombres, teléfonos,
              correos, direcciones, mensajes ni códigos de pedido. Google puede tratar datos
              técnicos y de uso conforme a su{" "}
              <a
                href="https://policies.google.com/privacy?hl=es"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-4 hover:text-clay-dark"
              >
                Política de Privacidad
              </a>
              . Puedes cambiar tu elección desde “Configurar cookies”.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-ink/85">
          <h2 className="text-lg font-semibold text-ink">3. Derechos del titular (Habeas Data)</h2>
          <p>
            Como titular de tus datos puedes conocer, actualizar, rectificar o solicitar la
            supresión de tu información escribiendo a <strong>{CONTACT_EMAIL}</strong>.
          </p>
        </section>

        <footer className="flex flex-wrap gap-3 border-t border-ink/10 pt-5 text-sm">
          <Link href="/terminos" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:text-clay-dark">
            Ver Términos y Condiciones
          </Link>
          <Link href="/cookies" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:text-clay-dark">
            Ver Política de Cookies
          </Link>
        </footer>
      </article>
    </div>
  );
}
