import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ClearRedirectedOrderKey } from "@/components/ClearRedirectedOrderKey";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { buildSafeWhatsAppUrl, formatCartWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

const ORDER_CODE_PATTERN = /^EA-[A-F0-9]{12}$/;

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  if (!db) notFound();
  const { code } = await params;
  if (!ORDER_CODE_PATTERN.test(code)) notFound();

  const [order] = await db
    .select({
      id: orders.id,
      code: orders.code,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      subtotal: orders.subtotal,
      shipping: orders.shipping,
      total: orders.total,
    })
    .from(orders)
    .where(eq(orders.code, code))
    .limit(1);

  if (!order) notFound();
  const items = await db
    .select({
      id: orderItems.id,
      name: orderItems.name,
      image: orderItems.image,
      size: orderItems.size,
      color: orderItems.color,
      price: orderItems.price,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  const whatsappUrl = buildSafeWhatsAppUrl(
    formatCartWhatsAppMessage({
      orderCode: order.code,
      items: items.map((i) => ({
        name: i.name,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        price: i.price,
      })),
      totals: {
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
      },
    }),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <ClearRedirectedOrderKey orderCode={order.code} />
      <div className="text-center">
        <p className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-ink bg-volt text-3xl font-black text-ink">
          ✓
        </p>
        <h1 className="font-display mt-4 text-3xl font-bold text-ink sm:text-4xl">
          ¡Gracias por tu pedido!
        </h1>
        <p className="mt-2 text-ink/75">
          Hemos registrado tu pedido <strong>{order.code}</strong>. Te contactaremos para confirmar el despacho.
        </p>
      </div>

      <div className="glass-surface mt-10 rounded-xl p-6">
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
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
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
        {whatsappUrl ? (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            Enviar resumen por WhatsApp
          </a>
        ) : (
          <p role="alert" className="rounded-lg border border-ink bg-volt/30 px-4 py-3 text-sm font-semibold text-ink">
            WhatsApp del taller no configurado en producción (`NEXT_PUBLIC_WHATSAPP_NUMBER`).
          </p>
        )}
        <Link href="/tienda" className="btn-primary">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
