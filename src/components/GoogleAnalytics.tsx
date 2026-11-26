"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const CONSENT_STORAGE_KEY = "edna-atelier-cookie-consent-v1";
const GOOGLE_SCRIPT_ID = "edna-ga4-script";

type Props = {
  measurementId: string;
  nonce: string | null;
};

type ConsentValue = {
  analytics: boolean;
};

function readConsent(): ConsentValue | null {
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? "null",
    );
    if (
      typeof value === "object" &&
      value !== null &&
      "analytics" in value &&
      typeof value.analytics === "boolean"
    ) {
      return { analytics: value.analytics };
    }
  } catch {
    // Storage may be disabled or contain malformed data. Treat it as no consent.
  }
  return null;
}

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

function removeGoogleCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));

  for (const name of cookieNames) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    if (window.location.protocol === "https:") {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
    }
  }
}

export function GoogleAnalytics({ measurementId, nonce }: Props) {
  const pathname = usePathname();
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const updateConsent = () => setAnalyticsAllowed(readConsent()?.analytics === true);
    updateConsent();

    const onStorage = (event: StorageEvent) => {
      if (event.key === CONSENT_STORAGE_KEY || event.key === null) updateConsent();
    };

    window.addEventListener("edna:consent-changed", updateConsent);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("edna:consent-changed", updateConsent);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

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
