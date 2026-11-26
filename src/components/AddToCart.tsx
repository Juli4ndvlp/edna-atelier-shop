"use client";

import Link from "next/link";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import type { ColorOption } from "@/db/schema";
import { cartActions } from "@/lib/cart";
import { trackGa4Event } from "@/lib/analytics";
import { calcShipping, formatPrice } from "@/lib/format";
import { getSiteUrl } from "@/lib/site";
import {
  buildSafeWhatsAppUrl,
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

  const productWhatsAppUrl = size
    ? buildSafeWhatsAppUrl(
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
    : buildSafeWhatsAppUrl("preview");

  const wholesaleWhatsAppUrl = buildSafeWhatsAppUrl(formatWholesaleWhatsAppMessage());
  const whatsappMissing = productWhatsAppUrl === null;

  function validateWhatsAppClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!size) {
      e.preventDefault();
      setError("Selecciona una talla antes de enviar el pedido por WhatsApp");
      return;
    }
    setError("");
  }

  return (
    <div className="glass-card mt-6 space-y-6 rounded-xl p-5 sm:p-6">
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
              className={`h-11 w-11 rounded-full border-2 transition ${
                color === c.name
                  ? "scale-105 border-ink ring-2 ring-clay-dark ring-offset-2 ring-offset-white"
                  : "border-ink/45 hover:scale-105 hover:border-ink"
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
              className={`min-h-11 min-w-12 rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                size === s
                  ? "border-ink bg-volt text-ink shadow"
                  : "border-ink/30 bg-white/80 text-ink hover:-translate-y-0.5 hover:border-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm font-semibold text-clay-dark">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-pill flex items-center rounded-lg">
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

          {soldOut ? (
            <button type="button" disabled className="btn-whatsapp min-w-[210px] flex-1">
              <WhatsAppIcon size={19} />
              Agotado
            </button>
          ) : whatsappMissing ? (
            <button type="button" disabled className="btn-whatsapp min-w-[210px] flex-1">
              <WhatsAppIcon size={19} />
              WhatsApp no configurado
            </button>
          ) : !size ? (
            <button
              type="button"
              onClick={() => setError("Selecciona una talla antes de enviar el pedido por WhatsApp")}
              className="btn-whatsapp min-w-[210px] flex-1"
            >
              <WhatsAppIcon size={19} />
              Pedir prenda por WhatsApp
            </button>
          ) : (
            <a
              href={productWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={validateWhatsAppClick}
              className="btn-whatsapp min-w-[210px] flex-1"
            >
              <WhatsAppIcon size={19} />
              Pedir prenda por WhatsApp
            </a>
          )}
        </div>

        <button type="button" onClick={add} disabled={soldOut} className="btn-outline w-full">
          {soldOut ? "Sin stock disponible" : `Añadir al carrito · ${formatPrice(subtotal)}`}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/80">
          <span>
            Total estimado con envío ({shipping === 0 ? "Gratis" : formatPrice(shipping)}):{" "}
            <strong className="text-ink">{formatPrice(subtotal + shipping)}</strong>
          </span>
          {wholesaleWhatsAppUrl ? (
            <a
              href={wholesaleWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-semibold text-clay-dark underline underline-offset-4"
            >
              ¿Compras por mayor (6+ unds)?
            </a>
          ) : (
            <span className="inline-flex min-h-11 items-center font-semibold text-clay-dark">
              WhatsApp mayorista pendiente de configurar
            </span>
          )}
        </div>
      </div>

      {added && (
        <div
          role="status"
          aria-live="polite"
          className="glass-surface flex items-center justify-between rounded-lg px-4 py-2 text-sm"
        >
          <span className="font-medium text-ink">✓ Añadido al carrito</span>
          <Link
            href="/carrito"
            className="inline-flex min-h-11 items-center font-semibold text-clay-dark underline underline-offset-4"
          >
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
