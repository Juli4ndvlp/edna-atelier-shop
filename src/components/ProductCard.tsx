"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProductWithCategory } from "@/lib/catalog";
import { discountPercent, formatPrice } from "@/lib/format";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductWithCategory;
  priority?: boolean;
}) {
  const [hoverEngaged, setHoverEngaged] = useState(false);
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.stock === 0;
  const secondaryImage = product.images[1];

  return (
    <Link
      href={`/producto/${product.slug}`}
      onMouseEnter={() => {
        if (secondaryImage) setHoverEngaged(true);
      }}
      onFocus={() => {
        if (secondaryImage) setHoverEngaged(true);
      }}
      className="glass-card glass-interactive group block rounded-xl p-2.5 sm:p-3"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-muted">
        <Image
          src={product.images[0]}
          alt={`${product.name} · EDNA ATELIER Bogotá`}
          fill
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 24vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {secondaryImage && hoverEngaged && (
          <Image
            src={secondaryImage}
            alt=""
            fill
            sizes="(max-width: 1024px) 31vw, 24vw"
            className="hidden object-cover opacity-0 transition duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
          />
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-md border border-ink bg-volt px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink shadow-xs">
              Nuevo
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-md border border-white/30 bg-ink/95 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              Remate -{discount}%
            </span>
          )}
        </div>
        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-white/85 text-sm font-semibold text-ink backdrop-blur-md">
            Agotado
          </div>
        )}
      </div>

      <div className="mt-3 px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-clay-dark">
          {product.categoryName}
        </p>
        <h3 className="mt-0.5 font-medium leading-snug text-ink transition group-hover:text-clay-dark">
          {product.name}
        </h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-ink/65 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="h-3.5 w-3.5 rounded-full border border-ink/55"
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
