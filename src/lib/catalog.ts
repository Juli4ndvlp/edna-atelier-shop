import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { normalizeCategorySlug } from "@/lib/catalog-params";
import type { ColorOption } from "@/db/schema";

export type CategoryItem = {
  id: number;
  slug: string;
  name: string;
  description: string;
  image: string;
};

export type ProductWithCategory = {
  id: number;
  slug: string;
  name: string;
  description: string;
  details: string[];
  price: number;
  compareAtPrice: number | null;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  gender: string;
  images: string[];
  sizes: string[];
  colors: ColorOption[];
  stock: number;
  featured: boolean;
  isNew: boolean;
};

export type ProductFilters = {
  category?: string;
  gender?: string;
  q?: string;
  sort?: string;
  sale?: boolean;
  limit?: number;
  offset?: number;
};

let seeding: Promise<void> | null = null;
let seededChecked = false;
let fallbackCache: { categories: CategoryItem[]; products: ProductWithCategory[] } | null = null;

async function getDevFallback() {
  if (fallbackCache) return fallbackCache;
  const { seedCategories, seedProducts } = await import("@/db/seed-data");
  const fallbackCategories: CategoryItem[] = seedCategories.map((c, idx) => ({
    id: idx + 1,
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
  }));
  const categoryBySlug = new Map(fallbackCategories.map((c) => [c.slug, c]));
  const fallbackProducts: ProductWithCategory[] = seedProducts.map((p, idx) => {
    const cat = categoryBySlug.get(p.category) ?? fallbackCategories[0];
    return {
      id: idx + 1,
      slug: p.slug,
      name: p.name,
      description: p.description,
      details: p.details,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      categoryId: cat.id,
      categorySlug: cat.slug,
      categoryName: cat.name,
      gender: p.gender as string,
      images: p.images,
      sizes: p.sizes,
      colors: p.colors,
      stock: p.stock,
      featured: p.featured ?? false,
      isNew: p.isNew ?? false,
    };
  });
  fallbackCache = { categories: fallbackCategories, products: fallbackProducts };
  return fallbackCache;
}

function requireConfiguredDb() {
  if (!db) {
    throw new Error("DATABASE_URL is required for the production catalog");
  }
  return db;
}

/** Carga el catálogo del taller la primera vez que la base de datos está vacía en desarrollo. */
export async function ensureSeeded(): Promise<boolean> {
  if (!db) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required for the production catalog");
    }
    return false;
  }
  if (process.env.NODE_ENV === "production") return true;
  if (seededChecked) return true;

  if (!seeding) {
    seeding = (async () => {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(products);
      if (count > 0) {
        seededChecked = true;
        return;
      }

      const { seedCategories, seedProducts } = await import("@/db/seed-data");
      await db.insert(categories).values(seedCategories).onConflictDoNothing();
      const cats = await db.select().from(categories);
      const bySlug = new Map(cats.map((c) => [c.slug, c.id]));

      await db
        .insert(products)
        .values(
          seedProducts.map((p) => ({
            slug: p.slug,
            name: p.name,
            description: p.description,
            details: p.details,
            price: p.price,
            compareAtPrice: p.compareAtPrice ?? null,
            categoryId: bySlug.get(p.category)!,
            gender: p.gender,
            images: p.images,
            sizes: p.sizes,
            colors: p.colors,
            stock: p.stock,
            featured: p.featured ?? false,
            isNew: p.isNew ?? false,
          })),
        )
        .onConflictDoNothing();
      seededChecked = true;
    })().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  await seeding;
  return true;
}

const productSelect = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  description: products.description,
  details: products.details,
  price: products.price,
  compareAtPrice: products.compareAtPrice,
  categoryId: products.categoryId,
  categorySlug: categories.slug,
  categoryName: categories.name,
  gender: products.gender,
  images: products.images,
  sizes: products.sizes,
  colors: products.colors,
  stock: products.stock,
  featured: products.featured,
  isNew: products.isNew,
};

async function queryCategoriesDb(): Promise<CategoryItem[]> {
  return requireConfiguredDb().select().from(categories).orderBy(asc(categories.id));
}

const getCachedCategoriesDb = unstable_cache(queryCategoriesDb, ["catalog-categories-v1"], {
  revalidate: 600,
  tags: ["catalog", "catalog-categories"],
});

export const getCategories = cache(async (): Promise<CategoryItem[]> => {
  try {
    if (!(await ensureSeeded())) return (await getDevFallback()).categories;
    return await getCachedCategoriesDb();
  } catch (error) {
    console.error("catalog categories query failed", error);
    throw error;
  }
});

async function queryFeaturedDb(limit: number): Promise<ProductWithCategory[]> {
  return requireConfiguredDb()
    .select(productSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.featured, true))
    .orderBy(desc(products.createdAt), asc(products.id))
    .limit(limit);
}

const getCachedFeaturedDb = unstable_cache(queryFeaturedDb, ["catalog-featured-v1"], {
  revalidate: 300,
  tags: ["catalog", "catalog-products"],
});

export const getFeaturedProducts = cache(async (limit = 8): Promise<ProductWithCategory[]> => {
  try {
    if (!(await ensureSeeded())) {
      return (await getDevFallback()).products.filter((p) => p.featured).slice(0, limit);
    }
    return await getCachedFeaturedDb(limit);
  } catch (error) {
    console.error("featured products query failed", error);
    throw error;
  }
});

async function queryNewDb(limit: number): Promise<ProductWithCategory[]> {
  return requireConfiguredDb()
    .select(productSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isNew, true))
    .orderBy(asc(products.id))
    .limit(limit);
}

const getCachedNewDb = unstable_cache(queryNewDb, ["catalog-new-v1"], {
  revalidate: 300,
  tags: ["catalog", "catalog-products"],
});

export const getNewProducts = cache(async (limit = 4): Promise<ProductWithCategory[]> => {
  try {
    if (!(await ensureSeeded())) {
      return (await getDevFallback()).products.filter((p) => p.isNew).slice(0, limit);
    }
    return await getCachedNewDb(limit);
  } catch (error) {
    console.error("new products query failed", error);
    throw error;
  }
});

function filterFallbackProducts(
  all: ProductWithCategory[],
  filters: ProductFilters,
): ProductWithCategory[] {
  let result = [...all];
  const category = normalizeCategorySlug(filters.category);
  if (category) result = result.filter((p) => p.categorySlug === category);
  if (filters.gender === "mujer" || filters.gender === "hombre") {
    result = result.filter((p) => p.gender === filters.gender || p.gender === "unisex");
  }
  if (filters.q) {
    const term = filters.q.trim().toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term),
    );
  }
  if (filters.sale) result = result.filter((p) => p.compareAtPrice !== null);

  if (filters.sort === "precio-asc") result.sort((a, b) => a.price - b.price);
  else if (filters.sort === "precio-desc") result.sort((a, b) => b.price - a.price);
  else if (filters.sort === "novedades") result.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id);
  else result.sort((a, b) => Number(b.featured) - Number(a.featured) || a.id - b.id);

  const offset = Math.max(0, Math.floor(filters.offset ?? 0));
  const limit = Math.max(1, Math.floor(filters.limit ?? 60));
  return result.slice(offset, offset + limit);
}

async function querySearchDb(
  category: string,
  gender: string,
  q: string,
  sort: string,
  sale: boolean,
  limit: number,
  offset: number,
): Promise<ProductWithCategory[]> {
  const conds: SQL[] = [];
  if (category) conds.push(eq(categories.slug, category));
  if (gender === "mujer" || gender === "hombre") {
    conds.push(inArray(products.gender, [gender, "unisex"]));
  }
  if (q) {
    const clean = q.replace(/[%_]/g, "").trim().slice(0, 80);
    if (clean) {
      const term = `%${clean}%`;
      const c = or(ilike(products.name, term), ilike(products.description, term));
      if (c) conds.push(c);
    }
  }
  if (sale) conds.push(sql`${products.compareAtPrice} is not null`);

  const order =
    sort === "precio-asc"
      ? [asc(products.price)]
      : sort === "precio-desc"
        ? [desc(products.price)]
        : sort === "novedades"
          ? [desc(products.isNew), desc(products.id)]
          : [desc(products.featured), asc(products.id)];

  return requireConfiguredDb()
    .select(productSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(...order)
    .limit(limit)
    .offset(offset);
}

const getCachedSearchDb = unstable_cache(querySearchDb, ["catalog-search-v1"], {
  revalidate: 300,
  tags: ["catalog", "catalog-products"],
});

const searchProductsCached = cache(
  async (
    category: string,
    gender: string,
    q: string,
    sort: string,
    sale: boolean,
    limit: number,
    offset: number,
  ): Promise<ProductWithCategory[]> => {
    try {
      if (!(await ensureSeeded())) {
        return filterFallbackProducts((await getDevFallback()).products, {
          category: category || undefined,
          gender: gender || undefined,
          q: q || undefined,
          sort: sort || undefined,
          sale,
          limit,
          offset,
        });
      }
      if (!q) {
        return await getCachedSearchDb(category, gender, "", sort, sale, limit, offset);
      }
      return await querySearchDb(category, gender, q, sort, sale, limit, offset);
    } catch (error) {
      console.error("product search query failed", error);
      throw error;
    }
  },
);

export function searchProducts(filters: ProductFilters): Promise<ProductWithCategory[]> {
  return searchProductsCached(
    normalizeCategorySlug(filters.category) ?? "",
    filters.gender ?? "",
    filters.q ?? "",
    filters.sort ?? "",
    Boolean(filters.sale),
    Math.min(Math.max(Math.floor(filters.limit ?? 60), 1), 100),
    Math.max(0, Math.floor(filters.offset ?? 0)),
  );
}

async function queryProductBySlugDb(slug: string): Promise<ProductWithCategory | null> {
  const [row] = await requireConfiguredDb()
    .select(productSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  return row ?? null;
}

const getCachedProductBySlugDb = unstable_cache(queryProductBySlugDb, ["catalog-product-slug-v1"], {
  revalidate: 300,
  tags: ["catalog", "catalog-products"],
});

export const getProductBySlug = cache(async (slug: string): Promise<ProductWithCategory | null> => {
  try {
    if (!(await ensureSeeded())) {
      return (await getDevFallback()).products.find((p) => p.slug === slug) ?? null;
    }
    return await getCachedProductBySlugDb(slug);
  } catch (error) {
    console.error("product lookup query failed", error);
    throw error;
  }
});

async function queryRelatedDb(
  categoryId: number,
  excludeId: number,
  limit: number,
): Promise<ProductWithCategory[]> {
  return requireConfiguredDb()
    .select(productSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.categoryId, categoryId), ne(products.id, excludeId)))
    .orderBy(asc(products.id))
    .limit(limit);
}

const getCachedRelatedDb = unstable_cache(queryRelatedDb, ["catalog-related-v1"], {
  revalidate: 300,
  tags: ["catalog", "catalog-products"],
});

export const getRelatedProducts = cache(
  async (categoryId: number, excludeId: number, limit = 4): Promise<ProductWithCategory[]> => {
    try {
      if (!(await ensureSeeded())) {
        return (await getDevFallback()).products
          .filter((p) => p.categoryId === categoryId && p.id !== excludeId)
          .slice(0, limit);
      }
      return await getCachedRelatedDb(categoryId, excludeId, limit);
    } catch (error) {
      console.error("related products query failed", error);
      throw error;
    }
  },
);
