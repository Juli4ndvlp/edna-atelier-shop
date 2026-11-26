"use client";

import { useEffect } from "react";
import { clearRedirectedOrderKey } from "@/lib/order-idempotency";

/** Confirma que la navegación al resumen del pedido terminó antes de descartar la clave. */
export function ClearRedirectedOrderKey({ orderCode }: { orderCode: string }) {
  useEffect(() => {
    clearRedirectedOrderKey(orderCode);
  }, [orderCode]);

  return null;
}
