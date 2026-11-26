import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { CookieBanner } from "@/components/CookieBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d8ff3e",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} · Pijamas, Buzos y Remates en Bogotá (San Victorino)`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "EDNA ATELIER",
    "pijamas Bogotá",
    "buzos San Victorino",
    "remates San Victorino",
    "pijamas al por mayor Bogotá",
    "buzos perchados Bogotá",
    "chaquetas Bogotá",
    "taller de confección San Victorino",
    "pijamas en satén Colombia",
    "ropa cómoda Bogotá",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: SITE_NAME,
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Nonce CSP requires request-time rendering so Next can nonce its inline bootstrap scripts.
  const requestHeaders = await headers();
  const nonce = requestHeaders.get("x-nonce");
  const isAdminRoute = requestHeaders.get("x-pathname")?.startsWith("/admin") ?? false;
  const rawMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
  const measurementId = /^G-[A-Z0-9]+$/.test(rawMeasurementId) ? rawMeasurementId : "";

  return (
    <html lang="es-CO">
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenido"
          className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-volt px-4 py-3 font-semibold text-ink focus:not-sr-only"
        >
          Saltar al contenido
        </a>
        {!isAdminRoute && <Header />}
        <main id="contenido" className={isAdminRoute ? "flex-1" : "flex-1 pt-20 sm:pt-24"}>
          {children}
        </main>
        {!isAdminRoute && (
          <>
            <Footer />
            <WhatsAppButton />
            <CookieBanner />
            {measurementId ? (
              <GoogleAnalytics measurementId={measurementId} nonce={nonce} />
            ) : null}
          </>
        )}
      </body>
    </html>
  );
}
