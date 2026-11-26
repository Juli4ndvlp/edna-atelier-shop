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
  const outfile = resolve(outDir, "whatsapp.mjs");
  await build({
    entryPoints: [resolve(root, "src/lib/whatsapp.ts")],
    bundle: true,
    write: true,
    outfile,
    format: "esm",
    platform: "node",
    logLevel: "silent",
    plugins: [
      {
        name: "alias-format",
        setup(build) {
          build.onResolve({ filter: /^@\/lib\/format$/ }, () => ({
            path: resolve(root, "src/lib/format.ts"),
          }));
        },
      },
    ],
  });
  return import(pathToFileURL(outfile).href);
}

test("el resumen de una orden usa los totales persistidos, no los vigentes", async () => {
  const { formatCartWhatsAppMessage } = await loadModule();
  const message = formatCartWhatsAppMessage({
    orderCode: "EA-ABCDEF123456",
    items: [{ name: "Pijama", size: "M", color: "Negro", quantity: 1, price: 79900 }],
    totals: { subtotal: 79900, shipping: 12000, total: 91900 },
  });

  assert.match(message, /\*Subtotal:\*.*79\.900/);
  assert.match(message, /\*Envío:\*.*12\.000/);
  assert.match(message, /\*Total:\*.*91\.900/);
});
