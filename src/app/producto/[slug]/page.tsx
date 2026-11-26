import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { AddToCart } from "@/components/AddToCart";
import { Gallery } from "@/components/Gallery";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) {
    return {
      title: "Prenda no encontrada",
      robots: { index: false, follow: false },
    };
  }
  const canonical = `/producto/${p.slug}`;
  return {
    title: `${p.name} · Bogotá`,
    description: `${p.description} Pide directo por WhatsApp en EDNA ATELIER (San Victorino, Bogotá).`,
    alternates: { canonical },
    openGraph: {
      title: `${p.name} · EDNA ATELIER`,
      description: p.description,
      url: canonical,
      type: "website",
      images: p.images[0]
        ? [{ url: p.images[0], width: 800, height: 1200, alt: p.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} · EDNA ATELIER`,
      description: p.description,
      images: p.images[0] ? [p.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const [{ slug }, requestHeaders] = await Promise.all([params, headers()]);
  const nonce = requestHeaders.get("x-nonce") ?? undefined;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/producto/${product.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images,
        sku: product.slug,
        brand: { "@type": "Brand", name: "EDNA ATELIER" },
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "COP",
          price: String(product.price),
          availability:
            product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: product.categoryName,
            item: `${siteUrl}/tienda?categoria=${product.categorySlug}`,
          },
          { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-ink/75">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-clay-dark hover:underline">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/tienda?categoria=${product.categorySlug}`}
              className="hover:text-clay-dark hover:underline"
            >
              {product.categoryName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <Gallery images={product.images} alt={`${product.name} · EDNA ATELIER`} />

        <div className="lg:py-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay-dark">
            {product.categoryName} ·{" "}
            {product.gender === "unisex" ? "Unisex" : product.gender === "mujer" ? "Mujer" : "Hombre"}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold text-ink">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-ink/65 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span className="whitespace-nowrap rounded-full bg-volt px-2.5 py-1 text-xs font-semibold text-ink">
                  Remate -{discount}%
                </span>
              </>
            )}
          </div>
          <p className="mt-4 leading-relaxed text-ink/85">{product.description}</p>

          <AddToCart
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images[0],
              sizes: product.sizes,
              colors: product.colors,
              stock: product.stock,
            }}
          />

          <div className="glass-card mt-6 space-y-2 rounded-2xl p-5 text-sm">
            <p className="font-semibold text-ink">Detalles de confección y cuidados</p>
            <ul className="list-disc space-y-1 pl-5 text-ink/80">
              {product.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="glass-card rounded-xl p-4 text-ink">
              🚚 Envío gratis desde $ 180.000
            </div>
            <div className="glass-card rounded-xl p-4 text-ink">
              • Despacho Bogotá / San Victorino y nacional
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold text-ink">Combínalo con otras prendas</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
