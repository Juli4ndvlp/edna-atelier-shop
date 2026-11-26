import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Carrito de compras",
  description: "Revisa tus prendas seleccionadas y envía tu pedido por WhatsApp o checkout.",
  robots: { index: false, follow: false },
};

export default function CarritoLayout({ children }: { children: ReactNode }) {
  return children;
}
