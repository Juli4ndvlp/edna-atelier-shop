"use client";

import Link from "next/link";
import { useState } from "react";

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error" | "demo">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedPrivacy) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setState("ok");
        setEmail("");
      } else if (res.status === 503) {
        setState("demo");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <form
        onSubmit={subscribe}
        aria-busy={state === "loading"}
        className="mt-6 max-w-md space-y-3"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo para remates y catálogos"
            aria-label="Correo para recibir ofertas y remates"
            className="input !border-white/30 !bg-white/12 !text-white placeholder:text-white/75 focus:!border-volt focus:!bg-white/15"
          />
          <button
            className="btn-primary shrink-0 !bg-volt hover:!bg-volt-light"
            disabled={state === "loading" || !acceptedPrivacy}
          >
            {state === "loading" ? "Enviando…" : "Unirme"}
          </button>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-white/85">
          <input
            id="footer-privacy-consent"
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-volt"
          />
          <span className="leading-relaxed">
            <label htmlFor="footer-privacy-consent" className="cursor-pointer">
              Acepto la{" "}
            </label>
            <Link
              href="/privacidad"
              className="inline-block py-1 font-semibold underline underline-offset-4 hover:text-volt"
            >
              Política de Privacidad
            </Link>{" "}
            <label htmlFor="footer-privacy-consent" className="cursor-pointer">
              para recibir novedades y precios de remate.
            </label>
          </span>
        </div>
      </form>

      <div aria-live="polite" aria-atomic="true">
        {state === "loading" && (
          <p className="mt-2 text-sm text-white/85">Enviando la suscripción…</p>
        )}
        {state === "ok" && <p className="mt-2 text-sm text-volt">¡Gracias por suscribirte!</p>}
        {state === "demo" && (
          <p className="mt-2 text-sm text-volt">
            Suscripción disponible al conectar la base de datos.
          </p>
        )}
        {state === "error" && (
          <p role="alert" className="mt-2 text-sm text-red-200">
            Revisa tu correo e inténtalo otra vez.
          </p>
        )}
      </div>
    </>
  );
}
