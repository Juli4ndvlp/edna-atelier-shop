import { timingSafeEqual } from "node:crypto";
import { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RESERVATION_STATUSES = ["pendiente", "whatsapp"] as const;
const BATCH_SIZE = 100;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || secret.length < 32 || !authorization?.startsWith("Bearer ")) return false;

  const provided = Buffer.from(authorization.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!db) {
    return Response.json({ error: "Base de datos no disponible" }, { status: 503 });
  }

  try {
    const result = await db.transaction(async (tx) => {
      const now = new Date();
      const expiredOrders = await tx
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            inArray(orders.status, [...RESERVATION_STATUSES]),
            lte(orders.reservationExpiresAt, now),
          ),
        )
        .orderBy(asc(orders.reservationExpiresAt), asc(orders.id))
        .limit(BATCH_SIZE)
        .for("update", { skipLocked: true });

      if (expiredOrders.length === 0) return { expired: 0, releasedUnits: 0 };

      const ids = expiredOrders.map((order) => order.id);
      const lines = await tx
        .select({ productId: orderItems.productId, quantity: orderItems.quantity })
        .from(orderItems)
        .where(inArray(orderItems.orderId, ids));

      const unitsByProduct = new Map<number, number>();
      for (const line of lines) {
        if (line.productId === null) continue;
        unitsByProduct.set(
          line.productId,
          (unitsByProduct.get(line.productId) ?? 0) + line.quantity,
        );
      }

      for (const [productId, quantity] of unitsByProduct) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} + ${quantity}` })
          .where(eq(products.id, productId));
      }

      await tx
        .update(orders)
        .set({ status: "cancelado" })
        .where(
          and(
            inArray(orders.id, ids),
            inArray(orders.status, [...RESERVATION_STATUSES]),
            lte(orders.reservationExpiresAt, now),
          ),
        );

      return {
        expired: expiredOrders.length,
        releasedUnits: [...unitsByProduct.values()].reduce((total, quantity) => total + quantity, 0),
      };
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("expire orders cron failed", error);
    return Response.json({ error: "No se pudieron liberar las reservas" }, { status: 500 });
  }
}
