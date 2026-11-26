"use client";

import Link from "next/link";
import "./globals.css";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es-CO">
      <body className="flex min-h-screen items-center justify-center bg-ivory p-4 text-ink">
        <div className="glass-surface max-w-lg rounded-xl p-8 text-center">
          <h1 className="font-display text-3xl font-bold">Error de configuración o servicio</h1>
          <p className="mt-3 text-sm text-ink/80">
            No pudimos cargar esta vista correctamente. Verifica la configuración del entorno o
            inténtalo de nuevo.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="btn-primary">
              Reintentar
            </button>
            <Link href="/tienda" className="btn-outline">
              Ir al catálogo
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
