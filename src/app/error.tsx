"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="glass-surface rounded-lg p-8 sm:p-10">
        <h1 className="font-display text-3xl font-bold text-ink">Algo no salió como esperábamos</h1>
        <p className="mt-3 text-sm text-ink/75">
          Ha ocurrido un error temporal al cargar esta sección. Puedes intentarlo de nuevo o volver a
          la tienda.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Reintentar
          </button>
          <Link href="/tienda" className="btn-outline">
            Ir a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
