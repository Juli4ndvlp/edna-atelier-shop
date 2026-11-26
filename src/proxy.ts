import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function extractHostname(hostHeader: string): string {
  const trimmed = hostHeader.split(",")[0]?.trim() ?? "";
  if (!trimmed) return "";
  try {
    return new URL(`http://${trimmed}`).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function buildCsp(nonce: string, isProd: boolean, upgradeInsecureRequests: boolean): string {
  const scriptPolicy = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline'`;
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    `script-src ${scriptPolicy} https://www.googletagmanager.com`,
    "script-src-attr 'none'",
    "connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://analytics.google.com https://*.google.com",
    "frame-src 'none'",
    "manifest-src 'self'",
    "media-src 'self'",
  ];
  if (upgradeInsecureRequests) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function proxy(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const reqHostHeader = (request.headers.get("host") ?? "").split(",")[0]?.trim() ?? "";
  const reqHostname = extractHostname(reqHostHeader);
  // En producción no se confía en un Host enviado por el cliente: localhost
  // desactivaría canonical, HSTS y upgrade-insecure-requests.
  const isLocal = isProd ? false : !reqHostname || LOCAL_HOSTS.has(reqHostname);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const isHttpsRequest = forwardedProto
    ? forwardedProto === "https"
    : request.nextUrl.protocol === "https:";
  const isHealthCheck = request.nextUrl.pathname === "/api/health";

  if (isProd && !isLocal && !isHealthCheck) {
    let canonicalUrl: URL;
    try {
      const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
      if (!rawSiteUrl) throw new Error("NEXT_PUBLIC_SITE_URL is required in production");
      canonicalUrl = new URL(rawSiteUrl);
      if (
        canonicalUrl.protocol !== "https:" ||
        !canonicalUrl.host ||
        canonicalUrl.username ||
        canonicalUrl.password
      ) {
        throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTPS origin");
      }
    } catch {
      return NextResponse.json({ error: "Production site URL is not configured" }, { status: 500 });
    }

    const hostMismatch = reqHostHeader.toLowerCase() !== canonicalUrl.host.toLowerCase();
    const needsHttps = forwardedProto === "http";
    if (hostMismatch || needsHttps) {
      const canonicalRequestUrl = request.nextUrl.clone();
      canonicalRequestUrl.protocol = "https:";
      canonicalRequestUrl.host = canonicalUrl.host;
      if (!canonicalUrl.port) canonicalRequestUrl.port = "";
      return NextResponse.redirect(canonicalRequestUrl, 308);
    }
  }

  const nonce = randomBytes(16).toString("base64");
  const csp = buildCsp(nonce, isProd, isProd && !isLocal);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);

  if (isProd && !isLocal && isHttpsRequest) {
    // Keep HSTS scoped to this host until production confirms every subdomain
    // supports HTTPS and the domain is ready for preload.
    response.headers.set("Strict-Transport-Security", "max-age=15552000");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:mp4|webm|avif|webp|png|jpg|jpeg|gif|svg|ico|woff2?)$).*)",
  ],
};
