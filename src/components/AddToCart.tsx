"use client";

import Link from "next/link";
import { useState } from "react";
import type { ColorOption } from "@/db/schema";
import { cartActions } from "@/lib/cart";
import { trackGa4Event } from "@/lib/analytics";
import { calcShipping, formatPrice } from "@/lib/format";
import { getSiteUrl } from "@/lib/site";
import {
  buildWhatsAppUrl,
  formatProductWhatsAppMessage,
  formatWholesaleWhatsAppMessage,
} from "@/lib/whatsapp";

type Props = {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    image: string;
    sizes: string[];
    colors: ColorOption[];
    stock: number;
  };
};

export function AddToCart({ product }: Props) {
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string>(product.colors[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const soldOut = product.stock === 0;
  const maxQty = Math.max(1, Math.min(20, product.stock));
  const subtotal = product.price * qty;
  const shipping = calcShipping(subtotal);

  function add() {
    if (!size) {
      setError("Selecciona una talla para continuar");
      return;
    }
    setError("");
    cartActions.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      size,
      color,
      quantity: qty,
    });
    trackGa4Event("add_to_cart");
    setAdded(true);
    setTimeout(() => setAdded(false), 3500);
  }

  const whatsappHref = size
    ? buildWhatsAppUrl(
        formatProductWhatsAppMessage({
          name: product.name,
          slug: product.slug,
          size,
          color,
          quantity: qty,
          price: product.price,
          origin: getSiteUrl(),
        }),
      )
    : "#selecciona-talla";

  function validateWhatsAppClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (soldOut) {
      e.preventDefault();
      return;
    }
    if (!size) {
      e.preventDefault();
      setError("Selecciona una talla antes de enviar el pedido por WhatsApp");
      return;
    }
    setError("");
  }

  return (
    <div className="glass-card mt-6 space-y-6 rounded-3xl p-5 sm:p-6">
      <div>
        <p className="text-sm font-semibold text-ink">
          Color: <span className="font-normal text-ink/75">{color}</span>
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2.5">
          {product.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={`Color ${c.name}`}
              aria-pressed={color === c.name}
              onClick={() => setColor(c.name)}
              className={`h-11 w-11 rounded-full border-2 transition ${color === c.name
                ? "scale-105 border-volt ring-2 ring-clay-dark/30 ring-offset-2 ring-offset-white"
                : "border-ink/35 hover:scale-105 hover:border-ink"
                }`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Talla</p>
          <span className="text-xs font-medium text-clay-dark">Confección nacional Bogotá</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={size === s}
              onClick={() => {
                setSize(s);
                setError("");
              }}
              className={`min-h-11 min-w-12 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${size === s
                ? "border-volt bg-volt text-ink shadow"
                : "border-ink/25 bg-white/80 text-ink hover:-translate-y-0.5 hover:border-volt"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-clay-dark">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-pill flex items-center rounded-full">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center text-lg"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Reducir cantidad"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center text-lg"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={validateWhatsAppClick}
            aria-disabled={soldOut}
            className="btn-whatsapp min-w-[210px] flex-1"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2a9.9 9.9 0 0 0-8.48 15.02L2 22l5.13-1.52A9.92 9.92 0 1 0 12.04 2Zm5.78 14.07c-.24.68-1.42 1.3-1.97 1.38-.52.08-1.18.11-1.91-.12-.44-.14-1-.33-1.72-.64-3.03-1.31-5.01-4.38-5.16-4.58-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.53.28-.3.6-.38.8-.38h.58c.19 0 .44-.07.69.52.25.6.86 2.08.93 2.23.08.15.13.33.03.53-.1.2-.15.33-.3.5-.15.18-.31.4-.45.54-.15.15-.3.31-.13.61.18.3.78 1.29 1.67 2.08 1.15 1.03 2.12 1.35 2.42 1.5.3.15.48.13.66-.08.18-.2.76-.88.96-1.18.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.22.58.35.07.12.07.72-.17 1.4Z" />
            </svg>
            {soldOut ? "Agotado" : "Pedir prenda por WhatsApp"}
          </a>
        </div>

        <button type="button" onClick={add} disabled={soldOut} className="btn-outline w-full">
          {soldOut ? "Sin stock disponible" : `Añadir al carrito · ${formatPrice(subtotal)}`}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/80">
          <span>
            Total estimado con envío ({shipping === 0 ? "Gratis" : formatPrice(shipping)}):{" "}
            <strong className="text-ink">{formatPrice(subtotal + shipping)}</strong>
          </span>
          <a
            href={buildWhatsAppUrl(formatWholesaleWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-semibold text-clay-dark underline underline-offset-4"
          >
            ¿Compras por mayor (6+ unds)?
          </a>
        </div>
      </div>

      {added && (
        <div className="glass-surface flex items-center justify-between rounded-xl px-4 py-3 text-sm">
          <span className="font-medium text-ink">✓ Añadido al carrito</span>
          <Link href="/carrito" className="font-semibold text-clay-dark underline underline-offset-4">
            Ver carrito
          </Link>
        </div>
      )}

      {!soldOut && product.stock <= 10 && (
        <p className="text-sm font-semibold text-clay-dark">
          ¡Últimas {product.stock} unidades disponibles en taller!
        </p>
      )}
    </div>
  );
}
