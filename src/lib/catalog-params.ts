export function normalizeCategorySlug(slug?: string): string | undefined {
  if (!slug) return undefined;
  return slug === "sudaderas" ? "buzos" : slug;
}

export type ShopSearchInput = Record<string, string | string[] | undefined>;

const firstParam = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) || undefined;

export function parseShopSearchParams(sp: ShopSearchInput) {
  const rawCategory = firstParam(sp.categoria);
  const category = normalizeCategorySlug(rawCategory);
  const sale = firstParam(sp.ofertas) === "1";
  const hasSaleParam = firstParam(sp.ofertas) !== undefined;
  const q = firstParam(sp.q)?.slice(0, 80);
  const sort = firstParam(sp.orden);
  const gender = firstParam(sp.genero);
  const hasRepeatedFilter = Object.values(sp).some(
    (value) => Array.isArray(value) && value.length > 1,
  );

  return {
    rawCategory,
    category,
    gender,
    q,
    sort,
    sale,
    hasSaleParam,
    hasRepeatedFilter,
  };
}
