"use client";

import { useSyncExternalStore } from "react";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const CONSENT_STORAGE_KEY = "edna-atelier-cookie-consent-v1";

const listeners = new Set<() => void>();
let forceOpen = false;
let cachedRaw: string | null | undefined;
let cachedParsed: ConsentState | null = null;

function notifyAll() {
  listeners.forEach((listener) => listener());
}

export function readSavedConsent(): ConsentState | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === cachedRaw) return cachedParsed;
    cachedRaw = raw;
    if (!raw) {
      cachedParsed = null;
      return null;
    }
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "analytics" in value &&
      typeof value.analytics === "boolean" &&
      "marketing" in value &&
      typeof value.marketing === "boolean"
    ) {
      cachedParsed = {
        necessary: true,
        analytics: value.analytics,
        marketing: value.marketing,
        updatedAt: "updatedAt" in value && typeof value.updatedAt === "string" ? value.updatedAt : "",
      };
      return cachedParsed;
    }
  } catch {
    /* almacenamiento no disponible o corrupto */
  }
  cachedParsed = null;
  return null;
}

function subscribeConsent(callback: () => void) {
  listeners.add(callback);
  const onOpen = () => {
    forceOpen = true;
    callback();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      callback();
    }
  };
  const onChanged = () => callback();

  window.addEventListener("edna:open-cookies", onOpen);
  window.addEventListener("edna:consent-changed", onChanged);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("edna:open-cookies", onOpen);
    window.removeEventListener("edna:consent-changed", onChanged);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCookieBannerVisible(): boolean {
  return useSyncExternalStore(
    subscribeConsent,
    () => (forceOpen ? true : readSavedConsent() === null),
    () => false,
  );
}

export function useAnalyticsConsent(): boolean {
  return useSyncExternalStore(
    subscribeConsent,
    () => readSavedConsent()?.analytics === true,
    () => false,
  );
}

export function persistConsent(consent: ConsentState) {
  try {
    const serialized = JSON.stringify(consent);
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
    cachedRaw = serialized;
    cachedParsed = consent;
    const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `edna_consent=${encodeURIComponent(
      consent.analytics || consent.marketing ? "accepted" : "necessary",
    )}; Path=/; Max-Age=15552000; SameSite=Lax${secureFlag}`;
  } catch {
    /* almacenamiento no disponible */
  }
  forceOpen = false;
  window.dispatchEvent(new CustomEvent("edna:consent-changed"));
  notifyAll();
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent("edna:open-cookies"));
}
