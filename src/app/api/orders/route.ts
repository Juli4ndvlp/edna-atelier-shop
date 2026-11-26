import { randomBytes } from "crypto";
import { asc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { calcShipping } from "@/lib/format";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-json";

export const dynamic = "force-dynamic";

const orderSchema = z.object({
  expectedTotal: z.number().int().nonnegative().optional(),
  customerName: z.string().trim().min(2, "Indica tu nombre").max(120),
  email: z.string().trim().email("Correo no válido").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s()-]{0,25}$/, "Teléfono no válido")
    .optional()
    .default(""),
  address: z.string().trim().min(5, "Indica tu dirección").max(200),
  city: z.string().trim().min(2, "Indica tu ciudad").max(100),
  postalCode: z.string().trim().min(2, "Indica tu barrio o localidad").max(80),
  notes: z.string().trim().max(500).optional().default(""),
  paymentMethod: z.enum(["whatsapp", "tarjeta", "transferencia", "contrareembolso"]),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        size: z.string().min(1).max(10),
        color: z.string().min(1).max(40),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "El carrito está vacío")
    .max(40),
});

class OrderError extends Error {
  constructor(
    message: string,
    readonly quote?: {
      subtotal: number;
      shipping: number;
      total: number;
      items: { productId: number; price: number }[];
    },
  ) {
    super(message);
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!ip) {
    return Response.json({ error: "La IP del cliente no está configurada en el proxy" }, { status: 503 });
  }
  const rateLimit = await checkRateLimit(`orders:${ip}`, 15, 1000 * 60 * 10);
  if (rateLimit === "unavailable") {
    return Response.json({ error: "El servicio no está disponible temporalmente" }, { status: 503 });
  }
  if (rateLimit === "limited") {
    return Response.json(
      { error: "Has realizado demasiados intentos. Espera unos minutos." },
      { status: 429 },
    );
  }

  const body = await readJsonBody(request, 64 * 1024);
  if (!body.ok && body.reason === "too_large") {
    return Response.json({ error: "La solicitud supera el tamaño permitido" }, { status: 413 });
  }
  if (!body.ok) {
    return Response.json({ error: "Solicitud no válida" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body.value);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (
    !idempotencyKey ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      idempotencyKey,
    )
  ) {
    return Response.json({ error: "Clave de pedido no válida. Vuelve a intentarlo." }, { status: 400 });
  }

  if (!db) {
    return Response.json(
      { error: "No podemos registrar el pedido en este momento. Inténtalo más tarde." },
      { status: 503 },
    );
  }

  const database = db;

  try {
    const [replayed] = await database
      .select({ code: orders.code })
      .from(orders)
      .where(eq(orders.idempotencyKey, idempotencyKey))
      .limit(1);
    if (replayed) return Response.json({ ok: true, code: replayed.code, replayed: true });

    let code = "";
    let orderId: number | undefined;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      code = `EA-${randomBytes(6).toString("hex").toUpperCase()}`;
      try {
        orderId = await database.transaction(async (tx) => {
      const ids = [...new Set(data.items.map((i) => i.productId))];
      const rows = await tx
        .select()
        .from(products)
        .where(inArray(products.id, ids))
        .orderBy(asc(products.id))
        .for("update");
      const byId = new Map(rows.map((p) => [p.id, p]));

      const qtyByProduct = new Map<number, number>();
      for (const item of data.items) {
        const nextQty = (qtyByProduct.get(item.productId) ?? 0) + item.quantity;
        if (nextQty > 40) {
          throw new OrderError("Para más de 40 unidades por prenda cotiza por WhatsApp mayorista");
        }
        qtyByProduct.set(item.productId, nextQty);
      }

      const lines = data.items.map((item) => {
        const p = byId.get(item.productId);
        if (!p) throw new OrderError("Un producto del carrito ya no está disponible");
        if (!p.sizes.includes(item.size)) throw new OrderError(`Talla no válida para ${p.name}`);
        if (!p.colors.some((c) => c.name === item.color)) {
          throw new OrderError(`Color no válido para ${p.name}`);
        }
        return { p, item };
      });

      for (const [pid, qty] of qtyByProduct) {
        const p = byId.get(pid)!;
        if (p.stock < qty) {
          throw new OrderError(
            p.stock === 0
              ? `${p.name} está agotado`
              : `Solo quedan ${p.stock} unidades de ${p.name}`,
          );
        }
      }

      const subtotal = lines.reduce((n, { p, item }) => n + p.price * item.quantity, 0);
      const shipping = calcShipping(subtotal);
      const total = subtotal + shipping;
      if (data.expectedTotal !== undefined && data.expectedTotal !== total) {
        throw new OrderError(
          "El precio o el envío cambió. Revisa el nuevo total y confirma otra vez.",
          {
            subtotal,
            shipping,
            total,
            items: lines.map(({ p }) => ({ productId: p.id, price: p.price })),
          },
        );
      }

      const [order] = await tx
        .insert(orders)
        .values({
          code,
          idempotencyKey,
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          notes: data.notes,
          paymentMethod: data.paymentMethod,
          status: data.paymentMethod === "whatsapp" ? "whatsapp" : "pendiente",
          reservationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          subtotal,
          shipping,
          total,
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        lines.map(({ p, item }) => ({
          orderId: order.id,
          productId: p.id,
          name: p.name,
          image: p.images[0] ?? "",
          size: item.size,
          color: item.color,
          price: p.price,
          quantity: item.quantity,
        })),
      );

      for (const [pid, qty] of qtyByProduct) {
        const res = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${qty}` })
          .where(sql`${products.id} = ${pid} and ${products.stock} >= ${qty}`)
          .returning({ id: products.id });
        if (res.length === 0) throw new OrderError("El stock cambió, inténtalo de nuevo");
      }

          return order.id;
        });
        break;
      } catch (error) {
        if ((error as { code?: string })?.code === "23505") {
          const [replayed] = await database
            .select({ code: orders.code })
            .from(orders)
            .where(eq(orders.idempotencyKey, idempotencyKey))
            .limit(1);
          if (replayed) return Response.json({ ok: true, code: replayed.code, replayed: true });
          if (attempt < 2) continue;
        }
        throw error;
      }
    }
    if (orderId === undefined) throw new Error("Could not allocate an order ID");

    const [created] = await database
      .select({ code: orders.code })
      .from(orders)
      .where(eq(orders.id, orderId));
    return Response.json({ ok: true, code: created.code }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      if (err.quote) return Response.json({ error: err.message, quote: err.quote }, { status: 409 });
      return Response.json({ error: err.message }, { status: 409 });
    }
    if ((err as { code?: string })?.code === "23505") {
      try {
        const [replayed] = await database
          .select({ code: orders.code })
          .from(orders)
          .where(eq(orders.idempotencyKey, idempotencyKey))
          .limit(1);
        if (replayed) return Response.json({ ok: true, code: replayed.code, replayed: true });
      } catch {
        // La excepción original aporta el diagnóstico si no era una repetición idempotente.
      }
    }
    console.error("order error", err);
    return Response.json({ error: "No se pudo crear el pedido" }, { status: 500 });
  }
}
