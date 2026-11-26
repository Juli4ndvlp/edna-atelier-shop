import { calcShipping, formatPrice } from "@/lib/format";

const DEFAULT_WHATSAPP_NUMBER = "573000000000";
const WHATSAPP_NUMBER_PATTERN = /^\+?[\d\s().-]+$/;

function configuredWhatsAppNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (!raw || !WHATSAPP_NUMBER_PATTERN.test(raw)) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15 || digits === DEFAULT_WHATSAPP_NUMBER) return null;
  return digits;
}

export function isDemoWhatsAppNumber(): boolean {
  return configuredWhatsAppNumber() === null;
}

export function getWhatsAppNumber(): string {
  const configured = configuredWhatsAppNumber();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_WHATSAPP_NUMBER must be a real 10-15 digit business number in production",
    );
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

export function buildSafeWhatsAppUrl(message: string): string | null {
  const configured = configuredWhatsAppNumber();
  const target = configured ?? (process.env.NODE_ENV === "production" ? null : DEFAULT_WHATSAPP_NUMBER);
  if (!target) return null;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppOrderLine = {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number; // COP
  slug?: string;
};

export type WhatsAppCustomerInfo = {
  customerName: string;
  phone?: string;
  email?: string;
  address?: string;
  postalCode?: string; // Barrio / Localidad en Bogotá o municipio
  city?: string;
  paymentMethod?: string;
  notes?: string;
};

export function formatProductWhatsAppMessage(input: {
  name: string;
  slug: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  origin?: string;
}): string {
  const subtotal = input.price * input.quantity;
  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;
  const productUrl = input.origin ? `${input.origin}/producto/${input.slug}` : `/producto/${input.slug}`;

  return [
    "Hola *EDNA ATELIER* (Bogotá), quiero hacer un pedido de esta prenda:",
    "",
    `*Prenda:* ${input.name}`,
    `*Talla:* ${input.size}`,
    `*Color:* ${input.color}`,
    `*Cantidad:* ${input.quantity}`,
    `*Precio unitario:* ${formatPrice(input.price)}`,
    `*Subtotal:* ${formatPrice(subtotal)}`,
    `*Envío estimado:* ${shipping === 0 ? "Gratis (Bogotá / Nacional)" : formatPrice(shipping)}`,
    `*Total estimado:* ${formatPrice(total)}`,
    `*Enlace:* ${productUrl}`,
    "",
    "¿Me confirmas disponibilidad para despacho en Bogotá / envío nacional?",
  ].join("\n");
}

export function formatCartWhatsAppMessage(input: {
  items: WhatsAppOrderLine[];
  customer?: WhatsAppCustomerInfo;
  orderCode?: string;
  totals?: { subtotal: number; shipping: number; total: number };
}): string {
  // En pedidos confirmados se usan los valores persistidos: las tarifas vigentes
  // pueden haber cambiado desde que se creó la orden.
  const subtotal =
    input.totals?.subtotal ?? input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = input.totals?.shipping ?? calcShipping(subtotal);
  const total = input.totals?.total ?? subtotal + shipping;

  const lines: string[] = [
    input.orderCode
      ? `Hola *EDNA ATELIER*, envío mi orden *${input.orderCode}*:`
      : "Hola *EDNA ATELIER* (Bogotá), quiero realizar el siguiente pedido:",
    "",
    "*Detalle de prendas:*",
  ];

  input.items.forEach((item, idx) => {
    lines.push(
      `${idx + 1}. ${item.name} — Talla ${item.size} · ${item.color} · x${item.quantity} (${formatPrice(item.price * item.quantity)})`,
    );
  });

  lines.push(
    "",
    `*Subtotal:* ${formatPrice(subtotal)}`,
    `*Envío:* ${shipping === 0 ? "Gratis" : formatPrice(shipping)}`,
    `*Total:* ${formatPrice(total)}`,
  );

  if (input.customer) {
    lines.push("", "*Datos de entrega:*");
    lines.push(`Nombre: ${input.customer.customerName}`);
    if (input.customer.phone) lines.push(`Teléfono / WhatsApp: ${input.customer.phone}`);
    if (input.customer.email) lines.push(`Email: ${input.customer.email}`);
    if (input.customer.address) {
      lines.push(
        `Dirección: ${input.customer.address}${input.customer.postalCode ? ` · Barrio/Localidad: ${input.customer.postalCode}` : ""}${input.customer.city ? ` (${input.customer.city})` : ""}`,
      );
    }
    if (input.customer.paymentMethod) lines.push(`Pago preferido: ${input.customer.paymentMethod}`);
    if (input.customer.notes) lines.push(`Notas: ${input.customer.notes}`);
  }

  lines.push("", "Quedo atento/a para confirmar el pedido.");
  return lines.join("\n");
}

export function formatSupportWhatsAppMessage(): string {
  return "Hola *EDNA ATELIER*, quiero consultar por pijamas, buzos o precios al por mayor / remates en Bogotá.";
}

export function formatWholesaleWhatsAppMessage(): string {
  return "Hola *EDNA ATELIER*, me interesa información de precios al por mayor y remates de taller en San Victorino / Bogotá.";
}
