# Tests

Runner: **`node:test`** (integrado en Node 24). Sin framework externo ni
dependencias nuevas.

```bash
node --test "tests/**/*.test.mjs"
```

Ejecutar también con `npm test`.

## `checkout-payment-methods.test.mjs`

Verifica que `/checkout` agrupe los métodos de pago en un `<fieldset>` con
`<legend>Método de pedido y pago</legend>` y que los radios `name="payment"`
tengan valores únicos y no vacíos. Cubre además el borde de carrito vacío.

### Cómo funciona

El carrito vive en `localStorage` (`src/lib/cart.ts`) y `useCart` usa un
snapshot de servidor vacío. Por eso el HTML que sirve Next en `/checkout` es el
estado "No hay nada que pedir" y **no contiene el fieldset**. Comprobado:

```bash
curl -s http://localhost:3000/checkout | grep -c 'name="payment"'   # 0
```

Para poder inspeccionar el markup sin navegador, el test compila el componente
real (`src/app/checkout/page.tsx`) con `esbuild` (ya presente en
`node_modules`) y lo renderiza con `react-dom/server`. Solo sustituye:

- `next/link`, `next/image`, `next/navigation` → stubs mínimos en `tests/stubs/`
- `@/lib/cart` → fixture con un carrito no vacío

`tests/stubs/entry.tsx` es el punto de entrada que se compila.

### Limitaciones

- Usa `esbuild` como `devDependency` declarada para compilar TSX y los alias.
- No es una prueba end-to-end: no arranca Next ni ejecuta el cliente.

### Si se quiere verificación realmente pública (HTTP + DOM)

Hace falta un navegador que siembre el carrito y espere la hidratación.
Receta con Playwright (requiere `npm i -D @playwright/test && npx playwright install chromium`):

```ts
// tests/checkout.e2e.spec.ts
import { test, expect } from "@playwright/test";

test("agrupa métodos de pago en fieldset con radios únicos", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "edna-atelier-cart-v1",
      JSON.stringify([
        { productId: 1, slug: "p", name: "P", image: "/p.png", price: 100000,
          size: "M", color: "Negro", quantity: 1 },
      ]),
    );
  });
  await page.goto("/checkout");
  const fieldset = page.locator("fieldset", {
    has: page.locator("legend", { hasText: "Método de pedido y pago" }),
  });
  await expect(fieldset).toBeVisible();
  const values = await fieldset.locator('input[type="radio"][name="payment"]').evaluateAll(
    (els) => els.map((e) => (e as HTMLInputElement).value),
  );
  expect(values.length).toBeGreaterThan(0);
  expect(new Set(values).size).toBe(values.length);
  expect(values.every(Boolean)).toBe(true);
});
```
