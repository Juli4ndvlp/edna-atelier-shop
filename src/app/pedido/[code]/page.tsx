import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppUrl, formatCartWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  if (!db) notFound();
  const { code } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  const whatsappUrl = buildWhatsAppUrl(
    formatCartWhatsAppMessage({
      orderCode: order.code,
      items: items.map((i) => ({
        name: i.name,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: i.price,
      })),
    }),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-clay text-3xl font-black text-ink">
          ✓
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl">
          ¡Gracias por tu pedido!
        </h1>
        <p className="mt-2 text-ink/75">
          Hemos registrado tu pedido <strong>{order.code}</strong>. Te contactaremos para confirmar el despacho.
        </p>
      </div>

      <div className="glass-surface mt-10 rounded-lg p-6">
        <div className="flex flex-wrap justify-between gap-2 text-sm text-ink">
          <span>
            Estado: <strong className="capitalize">{order.status}</strong>
          </span>
          <span>
            Método: <strong className="capitalize">{order.paymentMethod}</strong>
          </span>
        </div>

        <ul className="mt-5 divide-y divide-ink/10">
          {items.map((i) => (
            <li key={i.id} className="flex gap-3 py-3 text-sm">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                {i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink">{i.name}</p>
                <p className="text-ink/75">
                  {i.size} · {i.color} · x{i.quantity}
                </p>
              </div>
              <p className="font-medium text-ink">{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-3 space-y-1 border-t border-ink/10 pt-4 text-sm text-ink">
          <div className="flex justify-between">
            <dt className="text-ink/80">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/80">Envío</dt>
            <dd>{order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>

      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          Enviar resumen por WhatsApp
        </a>
        <Link href="/tienda" className="btn-primary">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
