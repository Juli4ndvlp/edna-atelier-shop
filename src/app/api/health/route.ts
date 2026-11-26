import { sql } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { parseSiteUrl } from "@/lib/site";
import { isDemoWhatsAppNumber } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET() {
  const isProd = process.env.NODE_ENV === "production";
  const siteUrlConfigured = Boolean(parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL));
  const whatsappConfigured = !isDemoWhatsAppNumber();

  if (!isDatabaseConfigured || !db) {
    if (isProd) {
      return Response.json(
        { ok: false, mode: "database-unconfigured", siteUrlConfigured, whatsappConfigured },
        { status: 503 },
      );
    }
    return Response.json({
      ok: true,
      mode: "static-catalog",
      siteUrlConfigured,
      whatsappConfigured,
    });
  }
  if (isProd && !whatsappConfigured) {
    return Response.json(
      { ok: false, mode: "whatsapp-unconfigured", siteUrlConfigured, whatsappConfigured },
      { status: 503 },
    );
  }

  try {
    await db.execute(sql`select 1`);
    return Response.json({
      ok: true,
      mode: "database",
      siteUrlConfigured,
      whatsappConfigured,
    });
  } catch {
    return Response.json(
      { ok: false, mode: "database-unavailable", siteUrlConfigured, whatsappConfigured },
      { status: 503 },
    );
  }
}
