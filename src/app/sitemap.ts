import { unstable_cache } from "next/cache";
import type { MetadataRoute } from "next";
import { getCategories, searchProducts, type ProductWithCategory } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const getCachedCatalog = unstable_cache(
  async () => {
    const categories = await getCategories();
    const staticRouteCount = 6;
    const maxProducts = Math.max(0, 50_000 - staticRouteCount - categories.length);
    const products: ProductWithCategory[] = [];

    for (let offset = 0; offset < maxProducts; offset += 100) {
      const limit = Math.min(100, maxProducts - offset);
      const batch = await searchProducts({ limit, offset });
      products.push(...batch);
      if (batch.length < limit) break;
    }

    return { categories, products };
  },
  ["edna-sitemap-catalog-v1"],
  { revalidate: 60 * 60 },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const { categories, products } = await getCachedCatalog();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/tienda`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/tienda?ofertas=1`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/cookies`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/tienda?categoria=${encodeURIComponent(c.slug)}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/producto/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
