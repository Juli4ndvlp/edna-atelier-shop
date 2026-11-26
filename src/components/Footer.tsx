"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buildWhatsAppUrl, formatSupportWhatsAppMessage } from "@/lib/whatsapp";

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error" | "demo">("idle");

  if (pathname.startsWith("/admin")) return null;

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

  function openCookieSettings() {
    window.dispatchEvent(new CustomEvent("edna:open-cookies"));
  }

  return (
    <footer className="mt-20 border-t border-white/15 bg-gradient-to-br from-ink via-[#171717] to-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl font-bold tracking-tight">
            EDNA <span className="text-volt">ATELIER</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-cream/85">
            Taller de confección en Bogotá (sector San Victorino). Pijamas, buzos perchados y
            chaquetas al detal y por mayor, con remates semanales y atención directa por WhatsApp.
          </p>

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
                className="input !border-white/30 !bg-white/12 !text-cream placeholder:text-cream/70 focus:!border-volt focus:!bg-white/15"
              />
              <button
                className="btn-primary shrink-0 !bg-volt hover:!bg-volt-light"
                disabled={state === "loading" || !acceptedPrivacy}
              >
                {state === "loading" ? "Enviando…" : "Unirme"}
              </button>
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 text-xs text-cream/85">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#d8ff3e]"
              />
              <span>
                Acepto la{" "}
                <Link href="/privacidad" className="underline underline-offset-4 hover:text-volt">
                  Política de Privacidad
                </Link>{" "}
                para recibir novedades y precios de remate.
              </span>
            </label>
          </form>
          <div aria-live="polite" aria-atomic="true">
            {state === "loading" && (
              <p className="mt-2 text-sm text-cream/85">Enviando la suscripción…</p>
            )}
            {state === "ok" && (
              <p className="mt-2 text-sm text-volt">¡Gracias por suscribirte!</p>
            )}
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
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cream/75">
            Colección Bogotá
          </p>
          <ul className="space-y-1 text-sm text-cream/90">
            <li>
              <Link href="/tienda?categoria=pijamas" className="inline-flex min-h-11 items-center hover:text-volt">
                Pijamas en Bogotá
              </Link>
            </li>
            <li>
              <Link href="/tienda?categoria=buzos" className="inline-flex min-h-11 items-center hover:text-volt">
                Buzos y Hoodies
              </Link>
            </li>
            <li>
              <Link href="/tienda?categoria=chaquetas" className="inline-flex min-h-11 items-center hover:text-volt">
                Chaquetas
              </Link>
            </li>
            <li>
              <Link href="/tienda?ofertas=1" className="inline-flex min-h-11 items-center hover:text-volt">
                Remates San Victorino
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cream/75">
            Taller y Legal
          </p>
          <ul className="space-y-1 text-sm text-cream/90">
            <li>
              <a
                href={buildWhatsAppUrl(formatSupportWhatsAppMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-volt"
              >
                WhatsApp Ventas y Mayoristas
              </a>
            </li>
            <li>
              <Link href="/privacidad" className="inline-flex min-h-11 items-center hover:text-volt">
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="inline-flex min-h-11 items-center hover:text-volt">
                Términos y Condiciones
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="inline-flex min-h-11 items-center hover:text-volt">
                Política de Cookies
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={openCookieSettings}
                className="inline-flex min-h-11 items-center text-left underline underline-offset-4 hover:text-volt"
              >
                Configurar cookies
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 px-4 py-5 text-center text-xs text-cream/80">
        © {new Date().getFullYear()} EDNA ATELIER · Taller de confección en Bogotá, Colombia · Sector
        San Victorino · Envíos a todo el país.
      </div>
    </footer>
  );
}
