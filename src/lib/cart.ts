"use client";

import { useMemo, useSyncExternalStore } from "react";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

const KEY = "edna-atelier-cart-v1";
const listeners = new Set<() => void>();
const EMPTY = "[]";

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.productId === "number" &&
    Number.isInteger(v.productId) &&
    v.productId > 0 &&
    typeof v.slug === "string" &&
    v.slug.length > 0 &&
    v.slug.length <= 120 &&
    typeof v.name === "string" &&
    v.name.length > 0 &&
    v.name.length <= 160 &&
    typeof v.image === "string" &&
    v.image.length > 0 &&
    v.image.length <= 500 &&
    typeof v.price === "number" &&
    Number.isInteger(v.price) &&
    v.price >= 0 &&
    typeof v.size === "string" &&
    v.size.length > 0 &&
    v.size.length <= 10 &&
    typeof v.color === "string" &&
    v.color.length > 0 &&
    v.color.length <= 40 &&
    typeof v.quantity === "number" &&
    Number.isInteger(v.quantity) &&
    v.quantity >= 1 &&
    v.quantity <= 20
  );
}

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(items: CartItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* almacenamiento no disponible */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function parse(raw: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem).slice(0, 40);
  } catch {
    return [];
  }
}

const sameLine = (a: CartItem, b: Pick<CartItem, "productId" | "size" | "color">) =>
  a.productId === b.productId && a.size === b.size && a.color === b.color;

export const cartActions = {
  add(item: CartItem) {
    if (!isCartItem(item)) return;
    const items = parse(read());
    const existing = items.find((i) => sameLine(i, item));
    if (existing) existing.quantity = Math.min(20, existing.quantity + item.quantity);
    else if (items.length < 40) items.push({ ...item, quantity: Math.min(20, item.quantity) });
    write(items);
  },
  setQuantity(line: Pick<CartItem, "productId" | "size" | "color">, quantity: number) {
    const items = parse(read())
      .map((i) => (sameLine(i, line) ? { ...i, quantity: Math.min(20, quantity) } : i))
      .filter((i) => i.quantity > 0);
    write(items);
  },
  remove(line: Pick<CartItem, "productId" | "size" | "color">) {
    write(parse(read()).filter((i) => !sameLine(i, line)));
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  const raw = useSyncExternalStore(subscribe, read, () => EMPTY);
  const items = useMemo(() => parse(raw), [raw]);
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.quantity * i.price, 0);
  return { items, count, subtotal };
}
