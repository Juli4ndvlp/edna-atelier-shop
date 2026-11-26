import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Condiciones de compra al detal, mayoristas, remates de San Victorino, envíos en Bogotá y cambios en EDNA ATELIER.",
  alternates: { canonical: "/terminos" },
  openGraph: {
    type: "website",
    url: "/terminos",
    title: "Términos y Condiciones · EDNA ATELIER",
    description:
      "Condiciones de compra al detal, mayoristas, remates de San Victorino, envíos en Bogotá y cambios en EDNA ATELIER.",
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <article className="glass-surface space-y-6 rounded-3xl p-6 sm:p-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">
            Condiciones Comerciales
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-ink sm:text-4xl">
            Términos y Condiciones
          </h1>
          <p className="mt-2 text-sm text-ink/75">
            {SITE_NAME} · Taller Bogotá, D.C. · Última actualización: noviembre de 2026
          </p>
        </header>

        <section className="space-y-2 text-sm leading-relaxed text-ink/85">
          <h2 className="text-lg font-semibold text-ink">1. Pedidos al detal, mayor y remates</h2>
          <p>
            En <strong>{SITE_NAME}</strong> puedes realizar pedidos directamente desde cada prenda o
            desde tu carrito mediante WhatsApp. El sistema genera una orden clara con modelo, talla,
            color, cantidad y valor estimado en pesos colombianos (COP). Los precios mayoristas y
            lotes de remate en San Victorino están sujetos a disponibilidad de curva en taller.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-ink/85">
          <h2 className="text-lg font-semibold text-ink">2. Precios y envíos en Bogotá y Colombia</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Precios expresados en pesos colombianos (COP).</li>
            <li>Envío gratis en pedidos iguales o superiores a $ 180.000 COP.</li>
            <li>Costo de envío estándar inferior a ese monto: $ 12.000 COP.</li>
            <li>
              En Bogotá contamos con despacho el mismo día o siguiente día hábil según hora de
              confirmación; envíos nacionales de 2 a 4 días hábiles.
            </li>
          </ul>
        </section>

        <section className="space-y-2 text-sm leading-relaxed text-ink/85">
          <h2 className="text-lg font-semibold text-ink">3. Cambios y garantías de confección</h2>
          <p>
            Ofrecemos garantía por defectos de confección y cambios de talla dentro de los{" "}
            <strong>15 días calendario</strong> siguientes a la entrega, siempre que la prenda no
            haya sido usada ni lavada y conserve sus etiquetas originales. Para remates finales,
            aplica garantía por costura o defecto de fábrica. Contáctanos por WhatsApp o en{" "}
            <strong>{CONTACT_EMAIL}</strong>.
          </p>
        </section>

        <footer className="flex flex-wrap gap-3 border-t border-white/60 pt-5 text-sm">
          <Link href="/privacidad" className="font-semibold underline underline-offset-4 hover:text-clay-dark">
            Política de Privacidad
          </Link>
          <Link href="/cookies" className="font-semibold underline underline-offset-4 hover:text-clay-dark">
            Política de Cookies
          </Link>
        </footer>
      </article>
    </div>
  );
}
