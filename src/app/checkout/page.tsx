"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cartActions, useCart } from "@/lib/cart";
import { calcShipping, formatPrice } from "@/lib/format";
import { getOrCreateOrderIdempotencyKey, markOrderRedirect } from "@/lib/order-idempotency";
import { trackGa4Event } from "@/lib/analytics";

const PAYMENTS = [
  {
    id: "whatsapp",
    label: "Pedido directo por WhatsApp (Recomendado)",
    hint: "Enviamos tu orden completa al WhatsApp de EDNA ATELIER para confirmar pago y despacho",
  },
  { id: "contrareembolso", label: "Pago contraentrega (Bogotá)", hint: "Paga al recibir en tu domicilio" },
  { id: "transferencia", label: "Nequi / Daviplata / Transferencia", hint: "Te compartimos datos por WhatsApp o correo" },
  { id: "tarjeta", label: "Tarjeta (simulado)", hint: "Solo demostración sin cobro real" },
] as const;

type ServerQuote = {
  subtotal: number;
  shipping: number;
  total: number;
  items: { productId: number; price: number }[];
};

function parseServerQuote(value: unknown): ServerQuote | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (
    typeof v.subtotal !== "number" ||
    !Number.isInteger(v.subtotal) ||
    v.subtotal < 0 ||
    typeof v.shipping !== "number" ||
    !Number.isInteger(v.shipping) ||
    v.shipping < 0 ||
    typeof v.total !== "number" ||
    !Number.isInteger(v.total) ||
    v.total < 0 ||
    !Array.isArray(v.items)
  ) {
    return null;
  }
  const parsedItems: { productId: number; price: number }[] = [];
  for (const item of v.items) {
    if (typeof item !== "object" || item === null) return null;
    const row = item as Record<string, unknown>;
    if (
      typeof row.productId !== "number" ||
      !Number.isInteger(row.productId) ||
      row.productId <= 0 ||
      typeof row.price !== "number" ||
      !Number.isInteger(row.price) ||
      row.price < 0
    ) {
      return null;
    }
    parsedItems.push({ productId: row.productId, price: row.price });
  }
  return { subtotal: v.subtotal, shipping: v.shipping, total: v.total, items: parsedItems };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const shipping = calcShipping(subtotal);
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]["id"]>("whatsapp");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<(ServerQuote & { cartSignature: string }) | null>(null);
  const cartSignature = JSON.stringify(
    items.map(({ productId, size, color, quantity }) => ({ productId, size, color, quantity })),
  );
  const currentQuote = quote?.cartSignature === cartSignature ? quote : null;
  const displayedSubtotal = currentQuote?.subtotal ?? subtotal;
  const displayedShipping = currentQuote?.shipping ?? shipping;
  const displayedTotal = currentQuote?.total ?? subtotal + shipping;
  const lastCheckoutSignature = useRef<string | null>(null);

  useEffect(() => {
    if (items.length === 0 || lastCheckoutSignature.current === cartSignature) return;
    lastCheckoutSignature.current = cartSignature;
    trackGa4Event("begin_checkout");
  }, [cartSignature, items.length]);

  if (items.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="glass-surface rounded-xl p-10">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            No hay nada que pedir
          </h1>
          <p className="mt-2 text-ink/75">Tu carrito está vacío.</p>
          <Link href="/tienda" className="btn-primary mt-8">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Debes aceptar la Política de Privacidad y los Términos y Condiciones.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const customer = {
      customerName: String(fd.get("customerName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      postalCode: String(fd.get("postalCode") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      paymentMethod: payment,
    };

    // La clave también depende de entrega y método de pago: cambiar cualquiera
    // debe crear un pedido nuevo, no recuperar uno con datos distintos.
    const submitSignature = JSON.stringify({ cart: cartSignature, payment, customer });
    const idempotencyKey = getOrCreateOrderIdempotencyKey(submitSignature);
    if (!idempotencyKey) {
      setError("No pudimos preparar un envío seguro. Recarga la página e inténtalo de nuevo.");
      return;
    }
    setError("");
    setLoading(true);

    const body = {
      ...customer,
      expectedTotal: currentQuote?.total ?? subtotal + shipping,
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const parsedQuote = parseServerQuote(data.quote);
        if (parsedQuote) {
          setQuote({ ...parsedQuote, cartSignature });
          setError(data.error ?? "El precio cambió. Revisa el nuevo total y confirma otra vez.");
          setLoading(false);
          return;
        }
        throw new Error(data.error ?? "Error al crear el pedido");
      }

      if (typeof data.code !== "string" || !/^EA-[A-F0-9]{12}$/.test(data.code)) {
        throw new Error("El pedido se recibió, pero no pudimos validar su código. Contacta al taller antes de volver a enviarlo.");
      }

      markOrderRedirect(submitSignature, data.code);
      cartActions.clear();
      router.push(`/pedido/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Finalizar pedido</h1>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px] lg:gap-10">
        <div className="space-y-8">
          <section className="glass-card rounded-xl p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-ink">Datos de entrega (Bogotá y Colombia)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">Nombre completo</span>
                <input name="customerName" required minLength={2} className="input" autoComplete="name" />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-ink">Correo electrónico</span>
                <input name="email" type="email" required className="input" autoComplete="email" />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-ink">Celular / WhatsApp</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Ej: 300 123 4567"
                  className="input"
                  autoComplete="tel"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">Dirección completa</span>
                <input
                  name="address"
                  required
                  minLength={5}
                  placeholder="Calle / Carrera, número, torre o apto"
                  className="input"
                  autoComplete="street-address"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-ink">Ciudad</span>
                <input
                  name="city"
                  required
                  defaultValue="Bogotá"
                  className="input"
                  autoComplete="address-level2"
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-medium text-ink">Barrio / Localidad</span>
                <input
                  name="postalCode"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Ej: Chapinero, Suba, San Victorino"
                  className="input"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-sm font-medium text-ink">
                  Notas de entrega o pedido mayorista (opcional)
                </span>
                <textarea name="notes" rows={2} className="input" />
              </label>
            </div>
          </section>

          <fieldset className="glass-card rounded-xl p-5 sm:p-6">
            <legend className="mb-4 text-lg font-semibold text-ink">
              Método de pedido y pago
            </legend>
            <div className="space-y-2.5">
              {PAYMENTS.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                    payment === p.id
                      ? "border-ink bg-white ring-1 ring-ink"
                      : "border-ink/20 bg-white/65 hover:border-ink/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={p.id}
                    checked={payment === p.id}
                    onChange={() => setPayment(p.id)}
                    className="mt-1 h-4 w-4 accent-clay-dark"
                  />
                  <span>
                    <span className="block font-medium text-ink">{p.label}</span>
                    <span className="block text-sm text-ink/75">{p.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="glass-surface h-fit rounded-xl p-6">
          <h2 className="text-lg font-semibold text-ink">Tu pedido</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}-${i.color}`} className="flex gap-3 text-sm">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                  <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-ink">{i.name}</p>
                  <p className="text-ink/75">
                    {i.size} · {i.color} · x{i.quantity}
                  </p>
                </div>
                <p className="font-medium text-ink">
                  {formatPrice(
                    (currentQuote?.items.find((line) => line.productId === i.productId)?.price ?? i.price) *
                      i.quantity,
                  )}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm text-ink">
            <div className="flex justify-between">
              <dt className="text-ink/80">Subtotal</dt>
              <dd>{formatPrice(displayedSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/80">Envío</dt>
              <dd>{displayedShipping === 0 ? "Gratis" : formatPrice(displayedShipping)}</dd>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(displayedTotal)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-start gap-2.5 text-xs leading-relaxed text-ink/85">
            <input
              id="checkout-terms-consent"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-clay-dark"
            />
            <span>
              <label htmlFor="checkout-terms-consent" className="cursor-pointer">
                He leído y acepto la{" "}
              </label>
              <Link href="/privacidad" className="inline-block py-1 font-semibold underline underline-offset-4">
                Política de Privacidad
              </Link>{" "}
              <label htmlFor="checkout-terms-consent" className="cursor-pointer">
                y los{" "}
              </label>
              <Link href="/terminos" className="inline-block py-1 font-semibold underline underline-offset-4">
                Términos y Condiciones
              </Link>
              .
            </span>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-800/30 bg-red-50 p-3 text-sm font-medium text-red-900">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className={`mt-5 w-full ${payment === "whatsapp" ? "btn-whatsapp" : "btn-primary"}`}
          >
            {loading
              ? "Procesando…"
              : payment === "whatsapp"
                ? `Enviar pedido por WhatsApp · ${formatPrice(displayedTotal)}`
                : `Confirmar pedido · ${formatPrice(displayedTotal)}`}
          </button>

          <p className="mt-3 text-center text-xs text-ink/75">
            {payment === "whatsapp"
              ? "Se abrirá WhatsApp con tu orden clara y lista para despachar."
              : "No se realiza ningún cargo automático con tarjeta en esta web."}
          </p>
        </aside>
      </form>
    </div>
  );
}
