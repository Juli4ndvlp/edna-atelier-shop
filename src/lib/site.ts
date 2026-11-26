export const SITE_NAME = "EDNA ATELIER";
export const SITE_SHORT_NAME = "Edna Atelier";
export const SITE_TAGLINE = "Pijamas, Buzos y Chaquetas desde nuestro taller en Bogotá";
export const SITE_DESCRIPTION =
  "EDNA ATELIER · Taller de confección y venta de pijamas, buzos, hoodies y chaquetas en Bogotá y San Victorino. Remates de temporada, pedidos al detal y al por mayor por WhatsApp con envíos en Bogotá y toda Colombia.";

export const CONTACT_EMAIL = "contacto@ednaatelier.com";
export const STORE_CITY = "Bogotá, D.C.";
export const STORE_DISTRICT = "Sector San Victorino · Centro de Bogotá";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "https://ednaatelier.com";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}
