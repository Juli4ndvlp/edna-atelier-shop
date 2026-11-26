import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, getFeaturedProducts, getNewProducts } from "@/lib/catalog";
import { LOOKBOOK_VIDEOS } from "@/lib/media";
import { CONTACT_EMAIL, SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";
import { buildSafeWhatsAppUrl, formatWholesaleWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${SITE_NAME} · Pijamas, Buzos y Remates en Bogotá (San Victorino)`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const HERO = "/collections/buzo-hoodie-verde-modelo.webp";
const BANNER = "/collections/trio-pijamas-atelier.webp";

export default async function HomePage() {
  const [requestHeaders, categories, featured, news] = await Promise.all([
    headers(),
    getCategories(),
    getFeaturedProducts(8),
    getNewProducts(4),
  ]);
  const nonce = requestHeaders.get("x-nonce") ?? undefined;
  const wholesaleWhatsAppUrl = buildSafeWhatsAppUrl(formatWholesaleWhatsAppMessage());

  const siteUrl = getSiteUrl();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ClothingStore",
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        email: CONTACT_EMAIL,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bogotá",
          addressRegion: "Cundinamarca",
          streetAddress: "Sector San Victorino, Centro de Bogotá",
          addressCountry: "CO",
        },
        areaServed: ["Bogotá", "San Victorino", "Cundinamarca", "Colombia"],
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: siteUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/tienda?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <JsonLd nonce={nonce} data={orgJsonLd} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-12 h-80 w-80 rounded-full bg-volt/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 right-0 h-96 w-96 rounded-full bg-ink/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-6 sm:px-6 md:grid-cols-2 md:py-14">
          <div>
            <span className="glass-pill inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-clay-dark">
              Taller Bogotá · Sector San Victorino
            </span>
            <h1 className="font-display mt-4 text-4xl font-bold leading-[1.04] text-ink sm:text-5xl lg:text-6xl">
              Pijamas y buzos hechos en <em className="not-italic text-clay-dark">EDNA ATELIER</em>.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/85 sm:text-lg">
              Confección bogotana en satén, algodón peinado y perchado térmico. Encuentra{" "}
              <strong className="font-semibold text-ink">remates semanales</strong>, precios de taller
              en San Victorino al detal o por mayor y pedido directo por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tienda" className="btn-primary">
                Ver catálogo completo
              </Link>
              <Link href="/tienda?ofertas=1" className="btn-outline">
                Remates San Victorino
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-ink/85">
              <span className="glass-pill rounded-md px-3 py-1.5">Envío gratis desde $180.000</span>
              <span className="glass-pill rounded-md px-3 py-1.5">Despachos el mismo día en Bogotá</span>
              <span className="glass-pill rounded-md px-3 py-1.5">Mayoristas desde 6 prendas</span>
            </div>
          </div>

          <div className="relative pb-6 md:pb-0">
            <div className="glass-card glass-interactive relative aspect-[4/5] overflow-hidden rounded-xl p-2 md:ml-auto md:max-w-md">
              <div className="relative h-full w-full overflow-hidden rounded-lg bg-surface-muted">
                <Image
                  src={HERO}
                  alt="Buzos oversize y pijamas confeccionadas en EDNA ATELIER Bogotá"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 768px) 92vw, 448px"
                  className="object-cover"
                />
              </div>
            </div>
            <Link
              href="/producto/buzo-hoodie-verde-bosque"
              className="glass-float animate-float-slow absolute bottom-0 left-3 right-3 max-w-[calc(100%-1.5rem)] rounded-xl px-5 py-3 transition hover:border-ink focus-visible:outline-white focus-visible:-outline-offset-4 focus-visible:ring-2 focus-visible:ring-ink sm:right-auto md:-bottom-3 md:left-12"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-clay-dark">
                Destacado del taller
              </p>
              <p className="font-semibold text-ink">Conjunto Hoodie Verde · $ 94.900 →</p>
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFICIOS Y ASOCIACIONES LOCALES */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {[
          ["🪡", "Taller propio Bogotá", "Confección directa sin intermediarios"],
          ["🏷️", "Remates San Victorino", "Lotes y curvas con hasta 35% dcto"],
          ["💬", "Pedido por WhatsApp", "Orden clara con talla, color y envío"],
          ["🚚", "Envíos a toda Colombia", "Contraentrega en Bogotá y despacho nacional"],
        ].map(([icon, title, text]) => (
          <div key={title} className="glass-card glass-interactive flex items-start gap-3 rounded-xl p-4">
            <span className="text-2xl" aria-hidden="true">
              {icon}
            </span>
            <div>
              <p className="font-semibold text-ink">{title}</p>
              <p className="text-sm text-ink/75">{text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">
              Hecho en Bogotá
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold text-ink">Compra por línea</h2>
          </div>
          {wholesaleWhatsAppUrl ? (
            <a
              href={wholesaleWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-clay-dark underline underline-offset-4 hover:text-ink"
            >
              Cotizar al por mayor →
            </a>
          ) : (
            <span className="inline-flex min-h-11 items-center text-sm font-semibold text-clay-dark">
              WhatsApp mayorista pendiente de configurar
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/tienda?categoria=${c.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-surface-muted shadow-md transition duration-300 hover:-translate-y-1 focus-visible:outline-white focus-visible:-outline-offset-4 focus-visible:ring-2 focus-visible:ring-ink"
            >
              <Image
                src={c.image}
                alt={`${c.name} en Bogotá · EDNA ATELIER`}
                fill
                sizes="(max-width: 640px) 94vw, 32vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="glass-dark absolute inset-x-3 bottom-3 rounded-lg p-4 text-white sm:p-5">
                <h3 className="font-display text-2xl font-bold sm:text-3xl">{c.name}</h3>
                <p className="mt-1 text-sm text-white/90">{c.description}</p>
                <span className="mt-2.5 inline-block text-sm font-semibold text-volt underline underline-offset-4">
                  Explorar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">
              Favoritos del taller
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold text-ink">
              Pijamas y buzos más pedidos
            </h2>
          </div>
          <Link
            href="/tienda"
            className="min-h-11 inline-flex items-center text-sm font-semibold text-ink underline underline-offset-4 hover:text-clay-dark"
          >
            Ver todo
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((p, index) => (
            <ProductCard key={p.id} product={p} priority={index < 2} />
          ))}
        </div>
      </section>

      {/* LOOKBOOK EN VIDEO */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">
              Prendas en movimiento · Bogotá
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold text-ink">
              Lookbook en video EDNA ATELIER
            </h2>
          </div>
          <Link
            href="/tienda"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline underline-offset-4 hover:text-clay-dark"
          >
            Explorar colección →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOOKBOOK_VIDEOS.map((item) => (
            <article
              key={item.id}
              className="glass-card glass-interactive flex flex-col overflow-hidden rounded-xl p-2.5"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-ink">
                <video
                  controls
                  playsInline
                  muted
                  loop
                  preload="metadata"
                  poster={item.poster}
                  aria-label={`${item.title} · EDNA ATELIER`}
                  className="h-full w-full object-cover"
                >
                  <source src={item.src} type="video/mp4" />
                </video>
              </div>
              <div className="flex flex-1 flex-col justify-between px-1 pb-1 pt-3">
                <div>
                  <span className="inline-block rounded border border-ink bg-volt px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                    {item.tag}
                  </span>
                  <h3 className="font-display mt-2 text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink/75">{item.subtitle}</p>
                </div>
                <Link
                  href={item.href}
                  className="mt-3 inline-flex min-h-10 items-center text-xs font-semibold uppercase tracking-wider text-clay-dark underline underline-offset-4 hover:text-ink"
                >
                  {item.cta} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BANNER REMATES SAN VICTORINO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          <Image
            src={BANNER}
            alt="Remates de pijamas y buzos en San Victorino Bogotá"
            fill
            sizes="(max-width: 1280px) 95vw, 1232px"
            className="object-cover"
          />
          <div className="relative z-10 flex min-h-80 items-center bg-ink/40 p-4 sm:min-h-96 sm:p-10">
            <div className="glass-dark max-w-lg rounded-xl p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-volt">
                Remates y Mayoristas · San Victorino
              </p>
              <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
                Remates directos de taller hasta -33%
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                Últimas curvas de pijamas en satén, buzos perchados y chaquetas térmicas. Pide por
                unidad o arma tu surtido mayorista por WhatsApp.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/tienda?ofertas=1" className="btn-primary !bg-volt hover:!bg-volt-light">
                  Ver remates
                </Link>
                {wholesaleWhatsAppUrl ? (
                  <a
                    href={wholesaleWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                  >
                    Lista mayorista WhatsApp
                  </a>
                ) : (
                  <span className="inline-flex min-h-11 items-center rounded-md border border-volt/50 px-3.5 text-xs font-semibold text-volt">
                    WhatsApp mayorista pendiente
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOVEDADES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold text-ink">Recién salidas del taller</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {news.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
