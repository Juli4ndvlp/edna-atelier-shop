import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(here, ".tmp");

async function loadCatalog() {
  mkdirSync(outDir, { recursive: true });
  const outfile = resolve(outDir, "real-catalog.mjs");
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

test("el catálogo real tiene 12 prendas y las sudaderas están en Buzos", async () => {
  const { realCategories, realProducts } = await loadCatalog();

  assert.deepEqual(
    realCategories.map((category) => category.slug),
    ["pijamas", "buzos", "chaquetas"],
  );
  assert.equal(realProducts.length, 12);

  const counts = realProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] ?? 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(counts, { pijamas: 5, buzos: 5, chaquetas: 2 });
  assert.equal(new Set(realProducts.map((product) => product.slug)).size, 12);
});

test("todas las prendas tienen precio, stock y archivos de imagen reales", async () => {
  const { realProducts } = await loadCatalog();

  for (const product of realProducts) {
    assert.ok(product.price > 0, `${product.slug} sin precio`);
    assert.ok(product.stock > 0, `${product.slug} sin stock`);
    assert.ok(product.images.length > 0, `${product.slug} sin imágenes`);
    assert.ok(
      product.images.every((src) => src.startsWith("/collections/")),
      `${product.slug} usa una imagen fuera de public/collections`,
    );
    for (const src of product.images) {
      assert.ok(existsSync(resolve(root, "public", `.${src}`)), `${product.slug}: falta ${src}`);
    }
  }
});
