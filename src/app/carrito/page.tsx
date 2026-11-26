"use client";

import Image from "next/image";
import Link from "next/link";
import { cartActions, useCart } from "@/lib/cart";
import { FREE_SHIPPING_THRESHOLD, calcShipping, formatPrice } from "@/lib/format";
import { buildSafeWhatsAppUrl, formatCartWhatsAppMessage } from "@/lib/whatsapp";

export default function CartPage() {
  const { items, subtotal } = useCart();
  const shipping = calcShipping(subtotal);
  const missing = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="glass-surface rounded-xl p-10">
          <p className="text-5xl" aria-hidden="true">
            🧺
          </p>
          <h1 className="font-display mt-4 text-3xl font-bold text-ink sm:text-4xl">
            Tu carrito está vacío
          </h1>
          <p className="mt-2 text-ink/75">Explora las pijamas, buzos y remates de EDNA ATELIER.</p>
          <Link href="/tienda" className="btn-primary mt-8">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const whatsappUrl = buildSafeWhatsAppUrl(
    formatCartWhatsAppMessage({
      items: items.map((i) => ({
        name: i.name,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: i.price,
        slug: i.slug,
      })),
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Tu carrito</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px] lg:gap-10">
        <div>
          <div className="glass-surface mb-6 rounded-xl p-4 text-sm text-ink">
            {missing > 0 ? (
              <>
                Te faltan <strong>{formatPrice(missing)}</strong> para envío gratis en Bogotá y
                Colombia.
              </>
            ) : (
              <>🎉 ¡Tu pedido califica para envío gratis!</>
            )}
            <div className="mt-2 h-2.5 overflow-hidden rounded-md border border-ink/30 bg-white/90">
              <div
                className="h-full bg-ink transition-all"
                style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>

          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.size}-${item.color}`}
                className="glass-card glass-interactive flex gap-3 rounded-xl p-3.5 sm:gap-4 sm:p-4"
              >
                <Link
                  href={`/producto/${item.slug}`}
                  className="relative h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:h-32 sm:w-24"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/producto/${item.slug}`}
                        className="font-semibold text-ink hover:text-clay-dark"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-ink/75">
                        Talla {item.size} · {item.color}
                      </p>
                    </div>
                    <p className="shrink-0 whitespace-nowrap font-semibold text-ink">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="glass-pill flex items-center rounded-lg">
                      <button
                        type="button"
                        className="grid h-11 w-11 place-items-center text-lg"
                        aria-label={`Reducir cantidad de ${item.name}`}
                        onClick={() => cartActions.setQuantity(item, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        className="grid h-11 w-11 place-items-center text-lg"
                        aria-label={`Aumentar cantidad de ${item.name}`}
                        onClick={() => cartActions.setQuantity(item, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => cartActions.remove(item)}
                      className="min-h-11 px-3 text-sm font-medium text-ink/75 underline underline-offset-4 hover:text-clay-dark"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="glass-surface h-fit rounded-xl p-6">
          <h2 className="text-lg font-semibold text-ink">Resumen del pedido</h2>
          <dl className="mt-4 space-y-3 text-sm text-ink">
            <div className="flex justify-between">
              <dt className="text-ink/80">Subtotal</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/80">Envío estimado</dt>
              <dd className="font-medium">{shipping === 0 ? "Gratis" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(subtotal + shipping)}</dd>
            </div>
          </dl>

          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6 w-full">
              Pedir todo por WhatsApp
            </a>
          ) : (
            <button type="button" disabled className="btn-whatsapp mt-6 w-full">
              WhatsApp no configurado en producción
            </button>
          )}

          <Link href="/checkout" className="btn-outline mt-3 w-full">
            Completar datos de entrega
          </Link>

          <Link
            href="/tienda"
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-sm font-medium text-ink underline underline-offset-4 hover:text-clay-dark"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
