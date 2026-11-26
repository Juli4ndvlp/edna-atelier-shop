import { db, isDatabaseConfigured } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured || !db) {
    if (process.env.NODE_ENV === "production") {
      return Response.json({ ok: false, mode: "database-unconfigured" }, { status: 503 });
    }
    return Response.json({ ok: true, mode: "static-catalog" });
  }
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, mode: "database" });
  } catch {
    return Response.json({ ok: false, mode: "database-unavailable" }, { status: 503 });
  }
}
