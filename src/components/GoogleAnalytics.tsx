"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAnalyticsConsent } from "@/lib/consent";

const GOOGLE_SCRIPT_ID = "edna-ga4-script";

type Props = {
  measurementId: string;
  nonce: string | null;
};

function isExcludedPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/pedido" ||
    pathname.startsWith("/pedido/")
  );
}

function expireCookie(name: string, domain?: string) {
  const attributes = [`${name}=`, "Max-Age=0", "Path=/", "SameSite=Lax"];
  if (window.location.protocol === "https:") attributes.push("Secure");
  if (domain) attributes.push(`Domain=${domain}`);
  document.cookie = attributes.join("; ");
}

function removeGoogleCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  if (cookieNames.length === 0) return;

  const labels = window.location.hostname.split(".").filter(Boolean);
  const domains = labels
    .slice(1)
    .map((_, index) => labels.slice(index + 1).join("."))
    .filter((domain) => domain.includes("."));

  for (const name of cookieNames) {
    // GA4 puede crear cookies con y sin Domain explícito; hay que expirar ambas.
    expireCookie(name);
    for (const domain of domains) expireCookie(name, domain);
  }
}

export function GoogleAnalytics({ measurementId, nonce }: Props) {
  const pathname = usePathname();
  const analyticsAllowed = useAnalyticsConsent();

  useEffect(() => {
    if (!analyticsAllowed) {
      window.__ednaAnalyticsEnabled = false;
      document.getElementById(GOOGLE_SCRIPT_ID)?.remove();
      window.dataLayer = [];
      removeGoogleCookies();
      return;
    }

    window.dataLayer ??= [];
    window.gtag ??= (...args) => window.dataLayer?.push(args);
    window.__ednaAnalyticsEnabled = true;
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: `SameSite=Lax${window.location.protocol === "https:" ? ";Secure" : ""}`,
    });

    if (!document.getElementById(GOOGLE_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = GOOGLE_SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      if (nonce) script.nonce = nonce;
      document.head.appendChild(script);
    }

    const onWhatsAppClick = (event: MouseEvent) => {
      if (isExcludedPath(window.location.pathname)) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || !/^https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(link.href)) {
        return;
      }
      window.gtag?.("event", "generate_lead");
    };

    document.addEventListener("click", onWhatsAppClick, true);
    return () => {
      window.__ednaAnalyticsEnabled = false;
      document.removeEventListener("click", onWhatsAppClick, true);
      document.getElementById(GOOGLE_SCRIPT_ID)?.remove();
      window.dataLayer = [];
      removeGoogleCookies();
    };
  }, [analyticsAllowed, measurementId, nonce]);

  useEffect(() => {
    if (!analyticsAllowed || isExcludedPath(pathname) || !window.__ednaAnalyticsEnabled) {
      return;
    }

    window.gtag?.("event", "page_view", {
      page_location: `${window.location.origin}${pathname}`,
      page_title: document.title,
    });
  }, [analyticsAllowed, pathname]);

  return null;
}
