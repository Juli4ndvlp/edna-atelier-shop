import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const isProd = process.env.NODE_ENV === "production";
const COOKIE = isProd ? "__Host-edna_atelier_admin" : "edna_atelier_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const REJECTED_PRODUCTION_PASSWORDS = new Set(["CambiaEstaClaveSeguraEdna2026!"]);

function adminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD?.trim();
  if (
    pw &&
    (!isProd || (pw.length >= 16 && !REJECTED_PRODUCTION_PASSWORDS.has(pw)))
  ) {
    return pw;
  }
  if (!isProd) return "edna-dev-local";
  return null;
}

function sessionSecret(): string | null {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (isProd) return explicit && explicit.length >= 32 ? explicit : null;
  if (explicit && explicit.length >= 16) return explicit;
  const pw = adminPassword();
  if (!pw) return null;
  return createHash("sha256").update(`edna-atelier-session:${pw}`).digest("hex");
}

function signPayload(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

function createSessionToken(): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = JSON.stringify({
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    nonce: randomBytes(12).toString("hex"),
  });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const sig = signPayload(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export function isAdminConfigured(): boolean {
  return adminPassword() !== null && sessionSecret() !== null;
}

export function checkPassword(input: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function setAdminCookie() {
  const token = createSessionToken();
  if (!token) throw new Error("Credenciales de admin no configuradas correctamente");
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 0,
  });
}

export async function isAdmin(): Promise<boolean> {
  const secret = sessionSecret();
  if (!secret) return false;
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return false;

  const expectedSig = signPayload(payloadB64, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
