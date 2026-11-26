import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const stub = (name) => resolve(here, "stubs", name);

// Compila el componente real (TSX + alias "@/") a un bundle ESM que Node puede
// importar. Solo se sustituyen dependencias de navegador de Next y el carrito.
async function loadCheckoutRenderer() {
  const result = await build({
    entryPoints: [stub("entry.tsx")],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    jsx: "automatic",
    logLevel: "silent",
    external: ["react", "react-dom", "react-dom/server", "react/jsx-runtime", "zod"],
    plugins: [
      {
        name: "cobijo-test-stubs",
        setup(b) {
          const map = {
            "next/link": stub("link.mjs"),
            "next/image": stub("image.mjs"),
            "next/navigation": stub("navigation.mjs"),
            "@/lib/cart": stub("cart.mjs"),
            "@/lib/format": resolve(root, "src/lib/format.ts"),
            "@/lib/analytics": resolve(root, "src/lib/analytics.ts"),
          };
          b.onResolve({ filter: /.*/ }, (args) =>
            map[args.path] ? { path: map[args.path] } : null,
          );
        },
      },
    ],
  });

  // Se escribe dentro del repo para que Node resuelva react/zod de node_modules.
  const outDir = resolve(here, ".tmp");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(outDir, "checkout-bundle.mjs");
  writeFileSync(outFile, result.outputFiles[0].text);
  return import(pathToFileURL(outFile).href);
}

const { renderCheckout } = await loadCheckoutRenderer();

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  return m ? m[1] : undefined;
}

function radiosIn(fragment) {
  return [...fragment.matchAll(/<input\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => attr(tag, "type") === "radio");
}

const html = renderCheckout();
const fieldsetMatch = html.match(/<fieldset\b[^>]*>([\s\S]*?)<\/fieldset>/);

test("renderiza un <fieldset> cuyo <legend> es 'Método de pedido y pago'", () => {
  assert.ok(fieldsetMatch, "no se encontró ningún <fieldset> en /checkout");
  const legendMatch = fieldsetMatch[1].match(/<legend\b[^>]*>([\s\S]*?)<\/legend>/);
  assert.ok(legendMatch, "el <fieldset> no contiene <legend>");
  const legendText = legendMatch[1].replace(/<[^>]+>/g, "").trim();
  assert.equal(legendText, "Método de pedido y pago");
});

test("todos los radios del fieldset usan name=payment", () => {
  assert.ok(fieldsetMatch, "no se encontró ningún <fieldset> en /checkout");
  const radios = radiosIn(fieldsetMatch[1]);
  assert.ok(radios.length > 0, "el fieldset no contiene radios");
  for (const radio of radios) {
    assert.equal(attr(radio, "name"), "payment", `radio sin name=payment: ${radio}`);
  }
});

test("los valores de los radios name=payment son únicos y no vacíos", () => {
  assert.ok(fieldsetMatch, "no se encontró ningún <fieldset> en /checkout");
  const values = radiosIn(fieldsetMatch[1]).map((r) => attr(r, "value"));
  for (const value of values) {
    assert.ok(value && value.length > 0, "hay un radio name=payment sin value");
  }
  assert.equal(
    new Set(values).size,
    values.length,
    `valores duplicados en name=payment: ${values.join(", ")}`,
  );
});

test("no hay radios name=payment fuera del fieldset de método de pago", () => {
  assert.ok(fieldsetMatch, "no se encontró ningún <fieldset> en /checkout");
  const outside = html.replace(fieldsetMatch[0], "");
  const stray = radiosIn(outside).filter((r) => attr(r, "name") === "payment");
  assert.equal(stray.length, 0, "hay radios name=payment fuera del fieldset");
});

test("con el carrito vacío no se muestran los métodos de pago", () => {
  globalThis.__COBIJO_TEST_CART__ = [];
  try {
    const emptyHtml = renderCheckout();
    assert.doesNotMatch(emptyHtml, /name="payment"/);
    assert.match(emptyHtml, /No hay nada que pedir/);
  } finally {
    delete globalThis.__COBIJO_TEST_CART__;
  }
});
