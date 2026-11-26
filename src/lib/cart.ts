"use client";

import { useMemo, useSyncExternalStore } from "react";
import { z } from "zod";

const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  slug: z.string().min(1).max(160),
  name: z.string().min(1).max(200),
  image: z.string().max(2000),
  price: z.number().int().nonnegative(),
  size: z.string().min(1).max(20),
  color: z.string().min(1).max(80),
  quantity: z.number().int().min(1).max(20),
});

const cartSchema = z.array(cartItemSchema).max(40);
export type CartItem = z.infer<typeof cartItemSchema>;

const KEY = "edna-atelier-cart-v1";
const listeners = new Set<() => void>();
const EMPTY = "[]";

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
    const result = cartSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

const sameLine = (a: CartItem, b: Pick<CartItem, "productId" | "size" | "color">) =>
  a.productId === b.productId && a.size === b.size && a.color === b.color;

export const cartActions = {
  add(item: CartItem) {
    const validItem = cartItemSchema.safeParse(item);
    if (!validItem.success) return;
    const items = parse(read());
    const existing = items.find((i) => sameLine(i, validItem.data));
    if (existing) existing.quantity = Math.min(20, existing.quantity + validItem.data.quantity);
    else if (items.length < 40) items.push(validItem.data);
    write(items);
  },
  setQuantity(line: Pick<CartItem, "productId" | "size" | "color">, quantity: number) {
    if (!Number.isInteger(quantity)) return;
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
