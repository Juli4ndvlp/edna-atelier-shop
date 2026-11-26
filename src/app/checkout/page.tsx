"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { cartActions, useCart } from "@/lib/cart";
import { calcShipping, formatPrice } from "@/lib/format";
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

const quoteSchema = z.object({
  subtotal: z.number().int().nonnegative(),
  shipping: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  items: z.array(z.object({ productId: z.number().int().positive(), price: z.number().int().nonnegative() })),
});

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const shipping = calcShipping(subtotal);
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]["id"]>("whatsapp");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<z.infer<typeof quoteSchema> & { cartSignature: string } | null>(null);
  const idempotencyKey = useRef<string | null>(null);
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
        <div className="glass-surface rounded-3xl p-10">
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
    setError("");
    setLoading(true);
    idempotencyKey.current ??= crypto.randomUUID();
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
          "Idempotency-Key": idempotencyKey.current,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const parsedQuote = quoteSchema.safeParse(data.quote);
        if (parsedQuote.success) {
          setQuote({ ...parsedQuote.data, cartSignature });
          setError(data.error ?? "El precio cambió. Revisa el nuevo total y confirma otra vez.");
          setLoading(false);
          return;
        }
        throw new Error(data.error ?? "Error al crear el pedido");
      }

      if (typeof data.code !== "string" || !/^EA-[A-F0-9]{12}$/.test(data.code)) {
        throw new Error("El pedido se recibió, pero no pudimos validar su código. Contacta al taller antes de volver a enviarlo.");
      }

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
          <section className="glass-card rounded-3xl p-5 sm:p-6">
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

          <fieldset className="glass-card rounded-3xl p-5 sm:p-6">
            <legend className="mb-4 text-lg font-semibold text-ink">
              Método de pedido y pago
            </legend>
            <div className="space-y-2.5">
              {PAYMENTS.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    payment === p.id
                      ? "border-volt bg-white/90 shadow-sm"
                      : "border-white/75 bg-white/55 hover:border-volt/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={p.id}
                    checked={payment === p.id}
                    onChange={() => setPayment(p.id)}
                    className="mt-1 h-4 w-4 accent-[#d8ff3e]"
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

        <aside className="glass-surface h-fit rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-ink">Tu pedido</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}-${i.color}`} className="flex gap-3 text-sm">
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
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

          <dl className="mt-5 space-y-2 border-t border-white/60 pt-4 text-sm text-ink">
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

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-ink/80">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#d8ff3e]"
            />
            <span>
              He leído y acepto la{" "}
              <Link href="/privacidad" className="font-semibold underline underline-offset-4">
                Política de Privacidad
              </Link>{" "}
              y los{" "}
              <Link href="/terminos" className="font-semibold underline underline-offset-4">
                Términos y Condiciones
              </Link>
              .
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">
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
