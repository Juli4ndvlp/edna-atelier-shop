import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Uso de cookies y almacenamiento local en EDNA ATELIER para el carrito, seguridad y preferencias.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    type: "website",
    url: "/cookies",
    title: "Política de Cookies · EDNA ATELIER",
    description:
      "Uso de cookies y almacenamiento local en EDNA ATELIER para el carrito, seguridad y preferencias.",
  },
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <article className="glass-surface space-y-6 rounded-xl p-6 sm:p-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">
            Transparencia Digital
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-ink sm:text-4xl">
            Política de Cookies
          </h1>
          <p className="mt-2 text-sm text-ink/75">
            {SITE_NAME} · Última actualización: noviembre de 2026
          </p>
        </header>

        <section className="space-y-2 text-sm leading-relaxed text-ink/85">
          <h2 className="text-lg font-semibold text-ink">1. ¿Para qué usamos cookies?</h2>
          <p>
            Utilizamos almacenamiento técnico esencial para conservar las prendas que añades a tu
            carrito de compras, recordar tu preferencia de privacidad y proteger el panel de
            administración del taller. Cuando la medición esté habilitada, Google Analytics 4 puede
            usar cookies de analítica únicamente si aceptas esa categoría; puedes cambiar tu
            decisión desde “Configurar cookies”.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-ink/85">
          <h2 className="text-lg font-semibold text-ink">2. Detalle técnico</h2>
          <div className="overflow-x-auto rounded-lg border border-ink/15 bg-white/75">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-ink/15 text-ink">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Nombre</th>
                  <th scope="col" className="p-3 font-semibold">Tipo</th>
                  <th scope="col" className="p-3 font-semibold">Finalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                <tr>
                  <td className="p-3 font-mono">edna-atelier-cart-v1</td>
                  <td className="p-3">Necesaria (localStorage)</td>
                  <td className="p-3">Guarda las prendas de tu carrito antes de enviar por WhatsApp.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono">edna_consent</td>
                  <td className="p-3">Necesaria (Cookie)</td>
                  <td className="p-3">Recuerda un resumen de tu elección sobre el banner de cookies.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono">edna-atelier-cookie-consent-v1</td>
                  <td className="p-3">Preferencias (localStorage)</td>
                  <td className="p-3">
                    Conserva la selección de analítica y personalización para respetar tu elección.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono">_ga, _ga_*</td>
                  <td className="p-3">Analítica opcional (Cookie)</td>
                  <td className="p-3">
                    Google Analytics 4 las usa para medir visitas y sesiones solo después de aceptar
                    analítica. Puedes retirar el consentimiento desde “Configurar cookies”.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-mono">__Host-edna_atelier_admin</td>
                  <td className="p-3">Seguridad (Solo taller)</td>
                  <td className="p-3">Sesión cifrada HttpOnly del panel de administración.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="flex flex-wrap gap-3 border-t border-ink/10 pt-5 text-sm">
          <Link href="/privacidad" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:text-clay-dark">
            Política de Privacidad
          </Link>
          <Link href="/tienda" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:text-clay-dark">
            Volver al catálogo
          </Link>
        </footer>
      </article>
    </div>
  );
}
