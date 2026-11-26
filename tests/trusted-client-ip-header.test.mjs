import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const stub = (name) => resolve(here, "stubs", name);

async function loadRateLimit() {
  const result = await build({
    entryPoints: [resolve(root, "src/lib/rate-limit.ts")],
    bundle: true,
    write: false,
    format: "esm",
    platform: "node",
    logLevel: "silent",
    external: ["drizzle-orm"],
    plugins: [
      {
        name: "cobijo-rate-limit-stubs",
        setup(b) {
          const map = {
            "@/db": stub("db-null.mjs"),
            "@/db/schema": stub("rate-limit-schema.mjs"),
          };
          b.onResolve({ filter: /.*/ }, (args) =>
            map[args.path] ? { path: map[args.path] } : null,
          );
        },
      },
    ],
  });

  const outDir = resolve(here, ".tmp");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(outDir, "rate-limit-bundle.mjs");
  writeFileSync(outFile, result.outputFiles[0].text);
  return import(pathToFileURL(outFile).href);
}

const { getClientIpFromHeaders } = await loadRateLimit();

function withHeaders(entries, configuredHeader) {
  process.env.TRUSTED_CLIENT_IP_HEADER = configuredHeader;
  process.env.NODE_ENV = "production";
  return getClientIpFromHeaders(new Headers(entries));
}

test("en producción usa x-nf-client-connection-ip de Netlify", () => {
  assert.equal(
    withHeaders({ "x-nf-client-connection-ip": "181.48.20.10" }, "x-nf-client-connection-ip"),
    "181.48.20.10",
  );
});

test("en producción rechaza IP no válida de la cabecera de Netlify", () => {
  assert.equal(withHeaders({ "x-nf-client-connection-ip": "no-es-ip" }, "x-nf-client-connection-ip"), null);
});

test("en producción no mezcla cabeceras no configuradas", () => {
  assert.equal(withHeaders({ "x-forwarded-for": "1.2.3.4" }, "x-forwarded-for"), "1.2.3.4");
  assert.equal(withHeaders({ "x-forwarded-for": "1.2.3.4" }, "x-nf-client-connection-ip"), null);
});
