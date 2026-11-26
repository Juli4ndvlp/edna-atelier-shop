import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(here, ".tmp");

async function loadModule() {
  mkdirSync(outDir, { recursive: true });
  const outfile = resolve(outDir, "site.mjs");
  await build({
    entryPoints: [resolve(root, "src/lib/site.ts")],
    bundle: true,
    write: true,
    outfile,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });
  return import(pathToFileURL(outfile).href);
}

test("solo acepta HTTPS para URLs públicas", async () => {
  const { parseSiteUrl } = await loadModule();
  assert.equal(parseSiteUrl("https://edna-atelier-shop.netlify.app"), "https://edna-atelier-shop.netlify.app");
  assert.equal(parseSiteUrl("http://edna-atelier-shop.netlify.app"), null);
  assert.equal(parseSiteUrl("https://user:pass@example.com"), null);
  assert.equal(parseSiteUrl("javascript:alert(1)"), null);
});

test("permite http en localhost solo fuera de producción", async () => {
  const { parseSiteUrl } = await loadModule();
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "development";
    assert.equal(parseSiteUrl("http://localhost:3000"), "http://localhost:3000");
    process.env.NODE_ENV = "production";
    assert.equal(parseSiteUrl("http://localhost:3000"), null);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
