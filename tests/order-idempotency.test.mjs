import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(here, ".tmp");

class MemoryStorage {
  constructor() {
    this.entries = new Map();
  }
  get length() {
    return this.entries.size;
  }
  key(index) {
    return [...this.entries.keys()][index] ?? null;
  }
  getItem(key) {
    return this.entries.get(key) ?? null;
  }
  setItem(key, value) {
    this.entries.set(key, String(value));
  }
  removeItem(key) {
    this.entries.delete(key);
  }
}

async function loadModule() {
  mkdirSync(outDir, { recursive: true });
  const outfile = resolve(outDir, "order-idempotency.mjs");
  await build({
    entryPoints: [resolve(root, "src/lib/order-idempotency.ts")],
    bundle: true,
    write: true,
    outfile,
    format: "esm",
    platform: "node",
    logLevel: "silent",
  });
  return import(pathToFileURL(outfile).href);
}

function onlyKey(storage) {
  const keys = [...storage.entries.keys()].filter((key) => key.startsWith("edna-order-key:"));
  assert.equal(keys.length, 1);
  return keys[0];
}

test("la clave se reutiliza tras recargar con la misma firma", async () => {
  const { getOrCreateOrderIdempotencyKey } = await loadModule();
  const previousWindow = globalThis.window;
  globalThis.window = { sessionStorage: new MemoryStorage() };
  try {
    const signature = JSON.stringify({
      cart: [{ productId: 1, quantity: 2 }],
      payment: "whatsapp",
      customer: { address: "Calle 1 # 2-3" },
    });
    const first = getOrCreateOrderIdempotencyKey(signature);
    const afterReload = getOrCreateOrderIdempotencyKey(signature);
    assert.match(first, /^[0-9a-f]{8}-/i);
    assert.equal(afterReload, first);
    assert.doesNotMatch(onlyKey(globalThis.window.sessionStorage), /Calle|address/i);
  } finally {
    globalThis.window = previousWindow;
  }
});

test("cambiar la entrega crea una clave distinta", async () => {
  const { getOrCreateOrderIdempotencyKey } = await loadModule();
  const previousWindow = globalThis.window;
  globalThis.window = { sessionStorage: new MemoryStorage() };
  try {
    const base = { cart: [{ productId: 7, quantity: 1 }], payment: "whatsapp" };
    const first = getOrCreateOrderIdempotencyKey(
      JSON.stringify({ ...base, customer: { address: "Calle 1" } }),
    );
    const changed = getOrCreateOrderIdempotencyKey(
      JSON.stringify({ ...base, customer: { address: "Calle 2" } }),
    );
    assert.notEqual(changed, first);
  } finally {
    globalThis.window = previousWindow;
  }
});

test("la clave se limpia solo al abrir la orden confirmada", async () => {
  const { getOrCreateOrderIdempotencyKey, markOrderRedirect, clearRedirectedOrderKey } =
    await loadModule();
  const previousWindow = globalThis.window;
  globalThis.window = { sessionStorage: new MemoryStorage() };
  try {
    const signature = JSON.stringify({
      cart: [{ productId: 7, quantity: 1 }],
      customer: { email: "cliente@example.com" },
    });
    const key = getOrCreateOrderIdempotencyKey(signature);
    markOrderRedirect(signature, "EA-ABCDEF123456");
    assert.equal(globalThis.window.sessionStorage.getItem(onlyKey(globalThis.window.sessionStorage)), key);
    assert.doesNotMatch(
      [...globalThis.window.sessionStorage.entries.keys()].join(" "),
      /cliente@example\.com/i,
    );

    clearRedirectedOrderKey("EA-OTROCODIGO");
    assert.equal(globalThis.window.sessionStorage.getItem(onlyKey(globalThis.window.sessionStorage)), key);

    clearRedirectedOrderKey("EA-ABCDEF123456");
    assert.equal(globalThis.window.sessionStorage.length, 0);
  } finally {
    globalThis.window = previousWindow;
  }
});
