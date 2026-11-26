"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
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

export async function loginAction(formData: FormData) {
  if (!isAdminConfigured()) redirect("/admin/login?error=config");

  const hdrs = await headers();
  const ip = getClientIpFromHeaders(hdrs);
  if (!(await checkRateLimit(`admin-login:${ip}`, 8, 1000 * 60 * 10))) {
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
    await db.transaction(async (tx) => {
      const [current] = await tx
        .select({ id: orders.id, status: orders.status })
        .from(orders)
        .where(eq(orders.id, parsed.data.id))
        .for("update");
      if (!current || current.status === parsed.data.status) return;

      const currentStatus = ORDER_STATUSES.find((status) => status === current.status);
      if (!currentStatus || !ORDER_TRANSITIONS[currentStatus].includes(parsed.data.status)) {
        throw new Error("Transición de estado no permitida");
      }

      if (parsed.data.status === "cancelado") {
        const lines = await tx
          .select({ productId: orderItems.productId, quantity: orderItems.quantity })
          .from(orderItems)
          .where(eq(orderItems.orderId, current.id));
        for (const line of lines) {
          if (line.productId === null) continue;
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${line.quantity}` })
            .where(eq(products.id, line.productId));
        }
      }

      await tx.update(orders).set({ status: parsed.data.status }).where(eq(orders.id, current.id));
    });
    revalidatePath("/admin");
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
    await db
      .update(products)
      .set({ stock: parsed.data.stock })
      .where(eq(products.id, parsed.data.id));
    revalidatePath("/admin");
    revalidatePath("/tienda");
  } catch (err) {
    console.error("updateProductStock error", err);
  }
}
