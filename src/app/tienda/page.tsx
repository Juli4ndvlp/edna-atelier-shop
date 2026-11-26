import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { getCategories, searchProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const rawCategory = one(sp.categoria);
  const category = rawCategory === "sudaderas" ? "buzos" : rawCategory;
  const sale = one(sp.ofertas) === "1";
  const hasSaleParam = one(sp.ofertas) !== undefined;
  const q = one(sp.q)?.slice(0, 80);
  const sort = one(sp.orden);
  const gender = one(sp.genero);
  const categories = await getCategories();
  const categoryItem = categories.find((item) => item.slug === category);
  const categoryName = categoryItem?.name ?? "";
  const categoryExists = Boolean(categoryItem);
  const hasRepeatedFilter = Object.values(sp).some((value) => Array.isArray(value) && value.length > 1);

  const label = q
    ? `Buscar “${q}”`
    : sale
      ? categoryItem
        ? `Remates de ${categoryItem.name} en San Victorino`
        : "Remates de Pijamas y Buzos en San Victorino"
      : categoryExists
        ? `${categoryName} en Bogotá al Detal y Mayor`
        : "Catálogo EDNA ATELIER Bogotá";

  const description = sale
    ? categoryItem
      ? `Remates de ${categoryName.toLowerCase()} de EDNA ATELIER en San Victorino, Bogotá. Compra por unidad o al por mayor.`
      : "Remates directos de taller EDNA ATELIER en San Victorino, Bogotá. Pijamas y buzos con descuento por unidad o al por mayor."
    : categoryExists
      ? category === "buzos"
        ? "Compra buzos y hoodies confeccionados en Bogotá por EDNA ATELIER. Calidad de taller, envíos en Bogotá y toda Colombia por WhatsApp."
        : `Compra ${categoryName.toLowerCase()} confeccionadas en Bogotá por EDNA ATELIER. Calidad de taller, envíos en Bogotá y toda Colombia por WhatsApp.`
      : "Catálogo completo de pijamas, buzos perchados, hoodies y chaquetas de EDNA ATELIER en Bogotá y San Victorino.";

  const canonical = categoryItem
    ? `/tienda?categoria=${encodeURIComponent(categoryItem.slug)}`
    : sale
      ? "/tienda?ofertas=1"
      : "/tienda";
  const isBaseCatalog = !category && !sale && !hasSaleParam && !gender && !q && !sort;
  const isCategoryLanding =
    categoryExists && rawCategory === category && !sale && !gender && !q && !sort && !hasRepeatedFilter;
  const isSaleLanding = sale && !category && !gender && !q && !sort && !hasRepeatedFilter;
  const isIndexableLanding = isBaseCatalog || isCategoryLanding || isSaleLanding;

  return {
    title: label,
    description,
    alternates: { canonical },
    robots: isIndexableLanding ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: `${label} · EDNA ATELIER`,
      description,
      url: canonical,
    },
  };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const rawCategory = one(sp.categoria);
  const normalizedCategory = rawCategory === "sudaderas" ? "buzos" : rawCategory;

  const filters = {
    category: normalizedCategory,
    gender: one(sp.genero),
    q: one(sp.q)?.slice(0, 80),
    sort: one(sp.orden),
    sale: one(sp.ofertas) === "1",
  };

  const [categories, items] = await Promise.all([getCategories(), searchProducts(filters)]);

  const href = (patch: Partial<Record<string, string | undefined>>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      categoria: filters.category,
      genero: filters.gender,
      q: filters.q,
      orden: filters.sort,
      ofertas: filters.sale ? "1" : undefined,
      ...patch,
    };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/tienda?${s}` : "/tienda";
  };

  const chip = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 py-2 text-sm font-medium transition ${
      active
        ? "border-volt bg-volt text-ink shadow-sm"
        : "border-white/80 bg-white/70 text-ink backdrop-blur-md hover:-translate-y-0.5 hover:border-volt"
    }`;

  const activeCat = categories.find((c) => c.slug === filters.category);
  const title = filters.q
    ? `Resultados para “${filters.q}”`
    : filters.sale
      ? "Remates San Victorino"
      : (activeCat?.name ?? "Catálogo EDNA ATELIER");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-clay-dark">
          Taller Bogotá · Ventas al detal y mayor
        </p>
        <h1 className="font-display mt-1 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        <p className="mt-1 text-ink/80">
          {activeCat?.description ??
            "Prendas confeccionadas en Bogotá con despacho rápido por WhatsApp."}
        </p>
      </div>

      <div className="glass-surface mt-6 flex flex-col gap-4 rounded-3xl p-4">
        <div
          role="group"
          aria-label="Filtrar por categoría"
          className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
        >
          <Link
            href={href({ categoria: undefined })}
            className={chip(!filters.category && !filters.sale)}
            aria-current={!filters.category && !filters.sale ? "true" : undefined}
          >
            Todas
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={href({ categoria: c.slug })}
              className={chip(filters.category === c.slug)}
              aria-current={filters.category === c.slug ? "true" : undefined}
            >
              {c.name}
            </Link>
          ))}
          <Link
            href={href({ ofertas: filters.sale ? undefined : "1" })}
            className={chip(filters.sale)}
            aria-current={filters.sale ? "true" : undefined}
          >
            Remates
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/60 pt-3">
          <div role="group" aria-label="Filtrar por género" className="flex flex-wrap gap-2">
            <Link
              href={href({ genero: undefined })}
              className={chip(!filters.gender)}
              aria-current={!filters.gender ? "true" : undefined}
            >
              Todos
            </Link>
            <Link
              href={href({ genero: "mujer" })}
              className={chip(filters.gender === "mujer")}
              aria-current={filters.gender === "mujer" ? "true" : undefined}
            >
              Mujer
            </Link>
            <Link
              href={href({ genero: "hombre" })}
              className={chip(filters.gender === "hombre")}
              aria-current={filters.gender === "hombre" ? "true" : undefined}
            >
              Hombre
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-ink/75">Ordenar:</span>
            {[
              ["", "Destacados"],
              ["novedades", "Novedades"],
              ["precio-asc", "Precio ↑"],
              ["precio-desc", "Precio ↓"],
            ].map(([v, l]) => (
              <Link
                key={v}
                href={href({ orden: v || undefined })}
                aria-current={(filters.sort ?? "") === v ? "true" : undefined}
                className={`inline-flex min-h-11 items-center underline-offset-4 ${
                  (filters.sort ?? "") === v
                    ? "font-semibold text-clay-dark underline"
                    : "text-ink/75 hover:text-clay-dark hover:underline"
                }`}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <h2 className="sr-only">Prendas del catálogo: {title}</h2>
      <p className="mt-5 text-sm font-medium text-ink/75">{items.length} prendas disponibles</p>

      {items.length === 0 ? (
        <div className="glass-card mt-6 rounded-3xl py-20 text-center">
          <p className="text-lg text-ink">No encontramos prendas con esos filtros.</p>
          <Link href="/tienda" className="btn-primary mt-6">
            Ver todo el catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
