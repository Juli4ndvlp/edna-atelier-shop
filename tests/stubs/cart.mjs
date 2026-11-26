// Fixture de carrito para renderizar /checkout sin navegador.
// El carrito real vive en localStorage (client-only), por eso el HTML servido
// por Next muestra el estado "carrito vacío". Ver tests/README.md.
const FIXTURE = [
  {
    productId: 1,
    slug: "pijama-de-prueba",
    name: "Pijama de prueba",
    image: "/producto.png",
    price: 100000,
    size: "M",
    color: "Negro",
    quantity: 1,
  },
];

export function useCart() {
  // globalThis permite simular el borde de carrito vacío en el mismo módulo.
  const items = globalThis.__COBIJO_TEST_CART__ ?? FIXTURE;
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  return { items, count: items.length, subtotal };
}

export const cartActions = {
  add() {},
  setQuantity() {},
  remove() {},
  clear() {},
};
