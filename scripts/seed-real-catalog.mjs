import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { config } from "dotenv";
import pg from "pg";

const { Client } = pg;
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpDir = resolve(root, "scripts", ".tmp");

config({ path: [resolve(root, ".env.local"), resolve(root, ".env")], quiet: true });

const connectionString =
  process.env.MIGRATION_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
if (!connectionString) {
  throw new Error("Define DATABASE_URL o MIGRATION_DATABASE_URL antes de cargar el catálogo real");
}

async function loadCatalog() {
  mkdirSync(tmpDir, { recursive: true });
  const outfile = resolve(tmpDir, "real-catalog.mjs");
  await build({
    entryPoints: [resolve(root, "src/db/real-catalog.ts")],
    bundle: true,
    write: true,
    outfile,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });
  return import(pathToFileURL(outfile).href);
}

const { realCategories, realProducts } = await loadCatalog();
const client = new Client({ connectionString });

await client.connect();
try {
  await client.query("BEGIN");

  for (const category of realCategories) {
    await client.query(
      `insert into categories (slug, name, description, image)
       values ($1, $2, $3, $4)
       on conflict (slug) do update
       set name = excluded.name,
           description = excluded.description,
           image = excluded.image`,
      [category.slug, category.name, category.description, category.image],
    );
  }

  const { rows: categoryRows } = await client.query("select id, slug from categories");
  const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));

  for (const product of realProducts) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Categoría no encontrada: ${product.category}`);

    await client.query(
      `insert into products
        (slug, name, description, details, price, compare_at_price, category_id, gender,
         images, sizes, colors, stock, featured, is_new)
       values ($1, $2, $3, $4, $5, null, $6, $7, $8, $9, $10::jsonb, $11, $12, $13)
       on conflict (slug) do update
       set name = excluded.name,
           description = excluded.description,
           details = excluded.details,
           price = excluded.price,
           compare_at_price = null,
           category_id = excluded.category_id,
           gender = excluded.gender,
           images = excluded.images,
           sizes = excluded.sizes,
           colors = excluded.colors,
           stock = excluded.stock,
           featured = excluded.featured,
           is_new = excluded.is_new`,
      [
        product.slug,
        product.name,
        product.description,
        product.details,
        product.price,
        categoryId,
        product.gender,
        product.images,
        product.sizes,
        JSON.stringify(product.colors),
        product.stock,
        product.featured ?? false,
        product.isNew ?? false,
      ],
    );
  }

  await client.query("COMMIT");
  const { rows } = await client.query("select count(*)::int as count from products");
  console.log(
    `Catálogo real cargado: ${realCategories.length} categorías, ${realProducts.length} prendas. Total en base: ${rows[0].count}.`,
  );
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
