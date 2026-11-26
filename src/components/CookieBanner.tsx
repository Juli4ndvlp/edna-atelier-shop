"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  persistConsent,
  readSavedConsent,
  useCookieBannerVisible,
} from "@/lib/consent";

export function CookieBanner() {
  const visible = useCookieBannerVisible();
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const firstPreferenceRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const save = useCallback((nextAnalytics: boolean, nextMarketing: boolean) => {
    persistConsent({
      necessary: true,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      updatedAt: new Date().toISOString(),
    });
    setConfiguring(false);
  }, []);

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

  useEffect(() => {
    if (!visible) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => {
      const previous = previousFocusRef.current;
      if (previous?.isConnected && previous !== document.body) previous.focus();
    };
  }, [visible]);

  useEffect(() => {
    if (visible && configuring) firstPreferenceRef.current?.focus();
  }, [visible, configuring]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (configuring) {
        setConfiguring(false);
        dialogRef.current?.focus();
        return;
      }
      save(false, false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible, configuring, save]);

  if (!visible) return null;

  return (
    <aside
      ref={dialogRef}
      role="dialog"
      aria-label="Preferencias de cookies"
      aria-describedby="cookie-banner-description"
      aria-modal="false"
      tabIndex={-1}
      data-cookie-banner
      className="glass-float fixed inset-x-3 bottom-3 z-50 rounded-xl p-4 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-lg font-bold text-ink">Tu privacidad en EDNA ATELIER</p>
        <span className="glass-pill rounded-md px-2.5 py-0.5 text-[11px] font-semibold text-clay-dark">
          Cookies
        </span>
      </div>

      <p id="cookie-banner-description" className="mt-2 text-sm leading-relaxed text-ink/85">
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
        <div className="mt-3 space-y-2 rounded-lg border border-ink/15 bg-white/75 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">Esenciales (carrito y seguridad)</span>
            <span className="text-xs font-semibold text-clay-dark">Siempre activas</span>
          </div>
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-2">
            <span className="text-ink/85">Analítica y rendimiento</span>
            <input
              ref={firstPreferenceRef}
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="h-5 w-5 accent-clay-dark"
            />
          </label>
          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-2">
            <span className="text-ink/85">Personalización y remates</span>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="h-5 w-5 accent-clay-dark"
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
              data-cookie-configure
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
