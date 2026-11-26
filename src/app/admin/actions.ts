"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { adminAudit, orderItems, orders, products } from "@/db/schema";
import {
  checkPassword,
  clearAdminCookie,
  isAdminConfigured,
  requireAdmin,
  setAdminCookie,
} from "@/lib/admin-auth";
import { ORDER_STATUSES, ORDER_TRANSITIONS } from "@/lib/format";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit";

const statusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(ORDER_STATUSES),
});

const stockSchema = z.object({
  id: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().min(0).max(1_000_000),
});

type AuditEntry = {
  action: string;
  entityType: string;
  entityId: number;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
};

/** La auditoría es best-effort: una base anterior sin `admin_audit` no debe revertir el cambio. */
async function writeAdminAudit(entry: AuditEntry): Promise<void> {
  if (!db) return;
  try {
    await db.insert(adminAudit).values({ actor: "admin", ...entry });
  } catch (err) {
    console.error("admin audit write failed", err);
  }
}

export async function loginAction(formData: FormData) {
  if (!isAdminConfigured()) redirect("/admin/login?error=config");

  const hdrs = await headers();
  const ip = getClientIpFromHeaders(hdrs);
  if (!ip) redirect("/admin/login?error=proxy_ip");
  const rateLimit = await checkRateLimit(`admin-login:${ip}`, 8, 1000 * 60 * 10);
  if (rateLimit === "unavailable") redirect("/admin/login?error=rate_unavailable");
  if (rateLimit === "limited") {
    redirect("/admin/login?error=rate");
  }

  const raw = formData.get("password");
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 200) {
    redirect("/admin/login?error=1");
  }
  if (!checkPassword(raw)) redirect("/admin/login?error=1");

  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/admin/login");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  if (!db) return;

  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  try {
    let releasedStock = false;
    let audit: AuditEntry | null = null;
    await db.transaction(async (tx) => {
      const [current] = await tx
        .select({
          id: orders.id,
          status: orders.status,
          reservationExpiresAt: orders.reservationExpiresAt,
        })
        .from(orders)
        .where(eq(orders.id, parsed.data.id))
        .for("update");
      if (!current || current.status === parsed.data.status) return;

      const currentStatus = ORDER_STATUSES.find((status) => status === current.status);
      if (!currentStatus || !ORDER_TRANSITIONS[currentStatus].includes(parsed.data.status)) {
        throw new Error("Transición de estado no permitida");
      }

      // Pedidos históricos sin reserva no descontaron stock: no deben reponerlo.
      if (
        (parsed.data.status === "cancelado" || parsed.data.status === "devuelto") &&
        current.reservationExpiresAt
      ) {
        const lines = await tx
          .select({ productId: orderItems.productId, quantity: orderItems.quantity })
          .from(orderItems)
          .where(eq(orderItems.orderId, current.id));

        const unitsByProduct = new Map<number, number>();
        for (const line of lines) {
          if (line.productId === null) continue;
          unitsByProduct.set(
            line.productId,
            (unitsByProduct.get(line.productId) ?? 0) + line.quantity,
          );
        }

        const sortedUpdates = [...unitsByProduct.entries()].sort((a, b) => a[0] - b[0]);
        for (const [productId, quantity] of sortedUpdates) {
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${quantity}` })
            .where(eq(products.id, productId));
        }
        releasedStock = sortedUpdates.length > 0;
      }

      await tx.update(orders).set({ status: parsed.data.status }).where(eq(orders.id, current.id));
      audit = {
        action: "update_order_status",
        entityType: "order",
        entityId: current.id,
        before: {
          status: current.status,
          reserved: current.reservationExpiresAt !== null,
        },
        after: { status: parsed.data.status, stockReleased: releasedStock },
      };
    });

    if (audit) await writeAdminAudit(audit);
    revalidatePath("/admin");
    if (releasedStock) {
      revalidateTag("catalog", "max");
      revalidatePath("/tienda");
      revalidatePath("/");
    }
  } catch (err) {
    console.error("updateOrderStatus error", err);
  }
}

export async function updateProductStock(formData: FormData) {
  await requireAdmin();
  if (!db) return;

  const rawStock = formData.get("stock");
  if (typeof rawStock !== "string" || rawStock.trim() === "") return;

  const parsed = stockSchema.safeParse({
    id: formData.get("id"),
    stock: rawStock,
  });
  if (!parsed.success) return;

  try {
    let audit: AuditEntry | null = null;
    await db.transaction(async (tx) => {
      const [current] = await tx
        .select({ stock: products.stock })
        .from(products)
        .where(eq(products.id, parsed.data.id))
        .for("update");
      if (!current || current.stock === parsed.data.stock) return;

      await tx
        .update(products)
        .set({ stock: parsed.data.stock })
        .where(eq(products.id, parsed.data.id));
      audit = {
        action: "update_product_stock",
        entityType: "product",
        entityId: parsed.data.id,
        before: { stock: current.stock },
        after: { stock: parsed.data.stock },
      };
    });
    if (audit) await writeAdminAudit(audit);
    revalidateTag("catalog", "max");
    revalidatePath("/admin");
    revalidatePath("/tienda");
    revalidatePath("/");
  } catch (err) {
    console.error("updateProductStock error", err);
  }
}
