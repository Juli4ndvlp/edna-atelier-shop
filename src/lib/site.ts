export const SITE_NAME = "EDNA ATELIER";
export const SITE_SHORT_NAME = "Edna Atelier";
export const SITE_TAGLINE = "Pijamas, Buzos y Chaquetas desde nuestro taller en Bogotá";
export const SITE_DESCRIPTION =
  "EDNA ATELIER · Taller de confección y venta de pijamas, buzos, hoodies y chaquetas en Bogotá y San Victorino. Remates de temporada, pedidos al detal y al por mayor por WhatsApp con envíos en Bogotá y toda Colombia.";

export const CONTACT_EMAIL = "contacto@ednaatelier.com";
export const STORE_CITY = "Bogotá, D.C.";
export const STORE_DISTRICT = "Sector San Victorino · Centro de Bogotá";

const FALLBACK_SITE_URL = "https://edna-atelier-shop.netlify.app";

export function parseSiteUrl(raw?: string): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!parsed.host || parsed.username || parsed.password) return null;
    if (parsed.protocol === "https:") return parsed.origin;
    // http solo para desarrollo en loopback; nunca se genera una URL pública insegura.
    const isLoopback =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "[::1]";
    if (parsed.protocol === "http:" && isLoopback && process.env.NODE_ENV !== "production") {
      return parsed.origin;
    }
    return null;
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  return parseSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? FALLBACK_SITE_URL;
}
