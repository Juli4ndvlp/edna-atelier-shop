import "server-only";
import { and, asc, desc, eq, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { seedCategories, seedProducts } from "@/db/seed-data";

let seeding: Promise<void> | null = null;
let seededChecked = false;

const fallbackCategories = seedCategories.map((c, idx) => ({
  id: idx + 1,
  slug: c.slug,
  name: c.name,
  description: c.description,
  image: c.image,
}));

const categoryBySlug = new Map(fallbackCategories.map((c) => [c.slug, c]));

const fallbackProducts = seedProducts.map((p, idx) => {
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

export type ProductWithCategory = (typeof fallbackProducts)[number];
export type CategoryItem = (typeof fallbackCategories)[number];

function normalizeCategorySlug(slug?: string): string | undefined {
  if (!slug) return undefined;
  if (slug === "sudaderas") return "buzos";
  return slug;
}

/** Carga el catálogo del taller la primera vez que la base de datos está vacía. */
export async function ensureSeeded(): Promise<boolean> {
  if (!db) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required for the production catalog");
    }
    return false;
  }
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

      if (process.env.NODE_ENV === "production") {
        throw new Error("The production catalog is empty; demo seed data is disabled");
      }

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

/** Devuelve la conexión ya validada por `ensureSeeded`; nunca degrada a datos semilla. */
function requireDb() {
  if (!db) throw new Error("DATABASE_URL is required for the catalog");
  return db;
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

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    if (!(await ensureSeeded())) return fallbackCategories;
    return await requireDb().select().from(categories).orderBy(asc(categories.id));
  } catch (error) {
    console.error("catalog categories query failed", error);
    throw error;
  }
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithCategory[]> {
  try {
    if (!(await ensureSeeded())) {
      return fallbackProducts.filter((p) => p.featured).slice(0, limit);
    }
    return await requireDb()
      .select(productSelect)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.featured, true))
      .orderBy(desc(products.createdAt), asc(products.id))
      .limit(limit);
  } catch (error) {
    console.error("featured products query failed", error);
    throw error;
  }
}

export async function getNewProducts(limit = 4): Promise<ProductWithCategory[]> {
  try {
    if (!(await ensureSeeded())) {
      return fallbackProducts.filter((p) => p.isNew).slice(0, limit);
    }
    return await requireDb()
      .select(productSelect)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isNew, true))
      .orderBy(asc(products.id))
      .limit(limit);
  } catch (error) {
    console.error("new products query failed", error);
    throw error;
  }
}

export type ProductFilters = {
  category?: string;
  gender?: string;
  q?: string;
  sort?: string;
  sale?: boolean;
  limit?: number;
  offset?: number;
};

function filterFallbackProducts(filters: ProductFilters): ProductWithCategory[] {
  let result = [...fallbackProducts];
  const category = normalizeCategorySlug(filters.category);
  if (category) {
    result = result.filter((p) => p.categorySlug === category);
  }
  if (filters.gender === "mujer" || filters.gender === "hombre") {
    result = result.filter((p) => p.gender === filters.gender || p.gender === "unisex");
  }
  if (filters.q) {
    const term = filters.q.trim().toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term),
    );
  }
  if (filters.sale) {
    result = result.filter((p) => p.compareAtPrice !== null);
  }
  if (filters.sort === "precio-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sort === "precio-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (filters.sort === "novedades") {
    result.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id);
  } else {
    result.sort((a, b) => Number(b.featured) - Number(a.featured) || a.id - b.id);
  }
  const offset = Math.max(0, Math.floor(filters.offset ?? 0));
  const limit = Math.max(1, Math.floor(filters.limit ?? 60));
  return result.slice(offset, offset + limit);
}

export async function searchProducts(filters: ProductFilters): Promise<ProductWithCategory[]> {
  try {
    if (!(await ensureSeeded())) return filterFallbackProducts(filters);
    const conds: SQL[] = [];
    const category = normalizeCategorySlug(filters.category);
    if (category) conds.push(eq(categories.slug, category));
    if (filters.gender === "mujer" || filters.gender === "hombre") {
      conds.push(inArray(products.gender, [filters.gender, "unisex"]));
    }
    if (filters.q) {
      const term = `%${filters.q.replace(/[%_]/g, "").slice(0, 80)}%`;
      const c = or(ilike(products.name, term), ilike(products.description, term));
      if (c) conds.push(c);
    }
    if (filters.sale) conds.push(sql`${products.compareAtPrice} is not null`);

    const order =
      filters.sort === "precio-asc"
        ? [asc(products.price)]
        : filters.sort === "precio-desc"
          ? [desc(products.price)]
          : filters.sort === "novedades"
            ? [desc(products.isNew), desc(products.id)]
            : [desc(products.featured), asc(products.id)];

    const limit = Math.min(Math.max(Math.floor(filters.limit ?? 60), 1), 100);
    const offset = Math.max(0, Math.floor(filters.offset ?? 0));
    return await requireDb()
      .select(productSelect)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(...order)
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("product search query failed", error);
    throw error;
  }
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  try {
    if (!(await ensureSeeded())) {
      return fallbackProducts.find((p) => p.slug === slug) ?? null;
    }
    const [row] = await requireDb()
      .select(productSelect)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug))
      .limit(1);
    return row ?? null;
  } catch (error) {
    console.error("product lookup query failed", error);
    throw error;
  }
}

export async function getRelatedProducts(
  categoryId: number,
  excludeId: number,
  limit = 4,
): Promise<ProductWithCategory[]> {
  try {
    if (!(await ensureSeeded())) {
      return fallbackProducts
        .filter((p) => p.categoryId === categoryId && p.id !== excludeId)
        .slice(0, limit);
    }
    return await requireDb()
      .select(productSelect)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.categoryId, categoryId), ne(products.id, excludeId)))
      .orderBy(asc(products.id))
      .limit(limit);
  } catch (error) {
    console.error("related products query failed", error);
    throw error;
  }
}
