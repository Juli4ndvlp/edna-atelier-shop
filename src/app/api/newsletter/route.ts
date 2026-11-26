import { z } from "zod";
import { db } from "@/db";
import { newsletter } from "@/db/schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-json";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email().max(160) });

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!ip) {
    return Response.json({ error: "La IP del cliente no está configurada en el proxy" }, { status: 503 });
  }
  if (!(await checkRateLimit(`newsletter:${ip}`, 10, 1000 * 60 * 10))) {
    return Response.json({ error: "Demasiados intentos. Intenta en unos minutos." }, { status: 429 });
  }

  const body = await readJsonBody(request, 4 * 1024);
  if (!body.ok && body.reason === "too_large") {
    return Response.json({ error: "La solicitud supera el tamaño permitido" }, { status: 413 });
  }
  if (!body.ok) {
    return Response.json({ error: "Email no válido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body.value);
  if (!parsed.success) {
    return Response.json({ error: "Email no válido" }, { status: 400 });
  }

  if (!db) {
    return Response.json(
      { error: "Suscripción temporalmente en modo demostración sin base de datos" },
      { status: 503 },
    );
  }

  try {
    await db
      .insert(newsletter)
      .values({ email: parsed.data.email.toLowerCase() })
      .onConflictDoNothing();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "No se pudo completar la suscripción" }, { status: 500 });
  }
}
