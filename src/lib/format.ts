export const FREE_SHIPPING_THRESHOLD = 180000; // $180.000 COP
export const SHIPPING_COST = 12000; // $12.000 COP envío estándar Bogotá / Colombia

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatPrice(pesos: number): string {
  return COP_FORMATTER.format(pesos);
}

export function calcShipping(subtotal: number): number {
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function discountPercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export const ORDER_STATUSES = [
  "pendiente",
  "pagado",
  "whatsapp",
  "enviado",
  "entregado",
  "devuelto",
  "cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pendiente: ["whatsapp", "pagado", "cancelado"],
  whatsapp: ["pendiente", "pagado", "cancelado"],
  // Un pedido pagado no se cancela sin registrar reembolso; solo se devuelve.
  pagado: ["enviado", "devuelto"],
  enviado: ["entregado", "devuelto"],
  entregado: ["devuelto"],
  devuelto: [],
  cancelado: [],
};
