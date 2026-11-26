"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "edna-atelier-cookie-consent-v1";
const listeners = new Set<() => void>();
let forceOpen = false;

function subscribeConsent(cb: () => void) {
  listeners.add(cb);
  const onOpen = () => {
    forceOpen = true;
    cb();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("edna:open-cookies", onOpen);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("edna:open-cookies", onOpen);
    window.removeEventListener("storage", onStorage);
  };
}

function getBannerSnapshot(): boolean {
  if (forceOpen) return true;
  return readSavedConsent() === null;
}

export function useCookieBannerVisible(): boolean {
  return useSyncExternalStore(subscribeConsent, getBannerSnapshot, () => false);
}

function persistConsent(consent: ConsentState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `edna_consent=${encodeURIComponent(
      consent.analytics || consent.marketing ? "accepted" : "necessary",
    )}; Path=/; Max-Age=15552000; SameSite=Lax${secureFlag}`;
  } catch {
    /* almacenamiento no disponible */
  }
  window.dispatchEvent(new CustomEvent("edna:consent-changed"));
  forceOpen = false;
  listeners.forEach((l) => l());
}

function readSavedConsent(): ConsentState | null {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (
      typeof value === "object" &&
      value !== null &&
      "analytics" in value &&
      typeof value.analytics === "boolean" &&
      "marketing" in value &&
      typeof value.marketing === "boolean"
    ) {
      return {
        necessary: true,
        analytics: value.analytics,
        marketing: value.marketing,
        updatedAt: "updatedAt" in value && typeof value.updatedAt === "string" ? value.updatedAt : "",
      };
    }
  } catch {
    /* almacenamiento no disponible o corrupto */
  }
  return null;
}

export function CookieBanner() {
  const visible = useCookieBannerVisible();
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    function restorePreferences() {
      const saved = readSavedConsent();
      setAnalytics(saved?.analytics ?? false);
      setMarketing(saved?.marketing ?? false);
      setConfiguring(true);
    }

    window.addEventListener("edna:open-cookies", restorePreferences);
    return () => window.removeEventListener("edna:open-cookies", restorePreferences);
  }, []);

  if (!visible) return null;

  function save(nextAnalytics: boolean, nextMarketing: boolean) {
    persistConsent({
      necessary: true,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      updatedAt: new Date().toISOString(),
    });
    setConfiguring(false);
  }

  return (
    <aside
      role="dialog"
      aria-label="Preferencias de cookies"
      className="glass-float fixed inset-x-3 bottom-3 z-50 rounded-3xl p-4 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-lg font-bold text-ink">Tu privacidad en EDNA ATELIER</p>
        <span className="glass-pill rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-clay-dark">
          Cookies
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink/85">
        Usamos almacenamiento técnico esencial para tu carrito de compras. Puedes aceptar todas o
        quedarte solo con las necesarias. Consulta nuestra{" "}
        <Link href="/cookies" className="font-semibold underline underline-offset-4 hover:text-clay-dark">
          Política de Cookies
        </Link>{" "}
        y{" "}
        <Link href="/privacidad" className="font-semibold underline underline-offset-4 hover:text-clay-dark">
          Privacidad
        </Link>
        .
      </p>

      {configuring && (
        <div className="mt-3 space-y-2 rounded-2xl border border-white/70 bg-white/60 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">Esenciales (carrito y seguridad)</span>
            <span className="text-xs font-semibold text-clay-dark">Siempre activas</span>
          </div>
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-2">
            <span className="text-ink/85">Analítica y rendimiento</span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="h-5 w-5 accent-[#d8ff3e]"
            />
          </label>
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-2">
            <span className="text-ink/85">Personalización y remates</span>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="h-5 w-5 accent-[#d8ff3e]"
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => save(true, true)}
          className="btn-primary flex-1 !px-4 !py-2 text-sm"
        >
          Aceptar todas
        </button>
        {configuring ? (
          <button
            type="button"
            onClick={() => save(analytics, marketing)}
            className="btn-outline flex-1 !px-4 !py-2 text-sm"
          >
            Guardar selección
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => save(false, false)}
              className="btn-outline !px-4 !py-2 text-sm"
            >
              Solo necesarias
            </button>
            <button
              type="button"
              onClick={() => setConfiguring(true)}
              className="min-h-11 px-3 text-sm font-semibold text-ink underline underline-offset-4 hover:text-clay-dark"
            >
              Configurar
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
