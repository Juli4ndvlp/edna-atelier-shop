import Link from "next/link";
import type { Metadata } from "next";
import { asc, desc, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { ensureSeeded } from "@/lib/catalog";
import { ORDER_STATUSES, ORDER_TRANSITIONS, formatPrice } from "@/lib/format";
import { logoutAction, updateOrderStatus, updateProductStock } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

const badge: Record<string, string> = {
  pendiente: "border border-ink bg-volt text-ink",
  pagado: "border border-ink/40 bg-volt/45 text-ink",
  whatsapp: "border border-ink/40 bg-volt/30 text-ink",
  enviado: "border border-ink/25 bg-ink/10 text-ink",
  entregado: "border border-ink/25 bg-ink/10 text-ink",
  devuelto: "border border-clay-dark/40 bg-white text-clay-dark",
  cancelado: "border border-red-800/30 bg-red-100 text-red-900",
};

function getAvailableStatuses(status: string) {
  const current = ORDER_STATUSES.find((candidate) => candidate === status);
  return current ? [current, ...ORDER_TRANSITIONS[current]] : [];
}

export default async function AdminPage() {
  await requireAdmin();

  if (!db) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="glass-surface rounded-xl p-8">
          <h1 className="font-display text-3xl font-bold">EDNA ATELIER · Modo sin base de datos</h1>
          <p className="mt-3 text-ink/75">
            Configura <code>DATABASE_URL</code> en <code>.env.local</code> para gestionar pedidos e
            inventario en PostgreSQL.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="btn-primary">
              Volver a la tienda
            </Link>
            <form action={logoutAction}>
              <button className="btn-outline">Salir</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  await ensureSeeded();

  const [allOrders, allProducts, [stats]] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50),
    db.select().from(products).orderBy(asc(products.stock), asc(products.id)),
    db
      .select({
        revenue: sql<string>`coalesce(sum(${orders.total}) filter (where ${orders.status} in ('pagado', 'enviado', 'entregado')), 0)::bigint::text`,
        count: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where ${orders.status} in ('pendiente', 'whatsapp'))::int`,
      })
      .from(orders),
  ]);

  const orderIds = allOrders.map((o) => o.id);
  const items = orderIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
    : [];

  const itemsByOrder = new Map<number, typeof items>();
  for (const i of items) {
    const arr = itemsByOrder.get(i.orderId) ?? [];
    arr.push(i);
    itemsByOrder.set(i.orderId, arr);
  }

  const totalRevenue = Number(stats.revenue);

  return (
    <div className="min-h-screen">
      <header className="glass-surface border-b border-ink/15">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <p className="font-display text-2xl font-bold">
            EDNA <span className="text-clay-dark">ATELIER</span>{" "}
            <span className="text-sm font-normal text-ink/75">Taller</span>
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="inline-flex min-h-11 items-center underline underline-offset-4">
              Ver tienda
            </Link>
            <form action={logoutAction}>
              <button className="min-h-11 rounded-md border border-ink/30 bg-white/75 px-4 py-1.5 font-semibold hover:bg-ink hover:text-white">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["Ingresos cobrados", formatPrice(Number.isFinite(totalRevenue) ? totalRevenue : 0)],
            ["Pedidos", String(stats.count)],
            ["Pendientes", String(stats.pending)],
          ].map(([l, v]) => (
            <div key={l} className="glass-card rounded-xl p-5">
              <p className="text-sm text-ink/75">{l}</p>
              <p className="font-display mt-1 text-3xl font-bold">{v}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="font-display mb-3 text-xl font-bold">Pedidos recientes</h2>
          {allOrders.length === 0 ? (
            <p className="glass-card rounded-xl p-6 text-ink/75">Todavía no hay pedidos.</p>
          ) : (
            <div className="space-y-3">
              {allOrders.map((o) => (
                <details key={o.id} className="glass-card rounded-xl p-4">
                  <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-3 text-sm">
                    <span className="font-mono font-semibold">{o.code}</span>
                    <span>{o.customerName}</span>
                    <span className="text-ink/70">{o.createdAt.toLocaleString("es-CO")}</span>
                    <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${badge[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                    <span className="ml-auto font-semibold">{formatPrice(o.total)}</span>
                  </summary>
                  <div className="mt-4 grid gap-4 border-t border-ink/10 pt-4 text-sm md:grid-cols-2">
                    <div>
                      <p className="font-medium">Cliente</p>
                      <p>
                        {o.email} {o.phone && `· ${o.phone}`}
                      </p>
                      <p>
                        {o.address}, {o.postalCode} · {o.city}
                      </p>
                      {o.notes && <p className="mt-1 italic text-ink/70">“{o.notes}”</p>}
                      <p className="mt-1 text-ink/70">Pago: {o.paymentMethod}</p>
                      <form action={updateOrderStatus} className="mt-3 flex flex-wrap gap-2">
                        <input type="hidden" name="id" value={o.id} />
                        <select
                          name="status"
                          defaultValue={o.status}
                          aria-label={`Nuevo estado del pedido ${o.code}`}
                          className="input !w-auto !py-1.5"
                        >
                          {getAvailableStatuses(o.status).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button className="btn-primary !px-4 !py-1.5">Actualizar</button>
                      </form>
                    </div>
                    <ul className="space-y-1">
                      {(itemsByOrder.get(o.id) ?? []).map((i) => (
                        <li key={i.id} className="flex justify-between">
                          <span>
                            {i.quantity}× {i.name} ({i.size}, {i.color})
                          </span>
                          <span>{formatPrice(i.price * i.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display mb-3 text-xl font-bold">Inventario del taller</h2>
          <div className="glass-card overflow-x-auto rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/10 text-ink/75">
                <tr>
                  <th scope="col" className="p-3">
                    Prenda
                  </th>
                  <th scope="col" className="p-3">
                    Precio
                  </th>
                  <th scope="col" className="p-3">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((p) => (
                  <tr key={p.id} className="border-b border-ink/10">
                    <td className="p-3">
                      <Link
                        href={`/producto/${p.slug}`}
                        className="inline-flex min-h-11 items-center font-medium hover:text-clay-dark"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="p-3">{formatPrice(p.price)}</td>
                    <td className="p-3">
                      <form action={updateProductStock} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          name="stock"
                          type="number"
                          min={0}
                          max={1000000}
                          defaultValue={p.stock}
                          aria-label={`Stock de ${p.name}`}
                          className={`input !w-24 !py-1.5 ${
                            p.stock <= 10 ? "!border-clay-dark !bg-volt/25 font-semibold" : ""
                          }`}
                        />
                        <button
                          aria-label={`Guardar stock de ${p.name}`}
                          className="min-h-11 rounded-md border border-ink/30 bg-white/80 px-3 py-1 font-semibold hover:bg-ink hover:text-white"
                        >
                          Guardar
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
