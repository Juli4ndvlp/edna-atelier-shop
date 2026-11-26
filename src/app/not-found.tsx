import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="glass-surface rounded-xl p-8 sm:p-12">
        <p className="glass-pill inline-block rounded-md px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-clay-dark">
          Error 404 · EDNA ATELIER
        </p>
        <h1 className="font-display mt-4 text-4xl font-bold text-ink sm:text-5xl">
          Esta prenda no está disponible
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink/80">
          Es posible que este lote o remate se haya agotado en nuestro taller de Bogotá. Revisa
          nuestras líneas vigentes de pijamas, buzos y chaquetas.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/tienda" className="btn-primary">
            Ver catálogo completo
          </Link>
          <Link href="/" className="btn-outline">
            Ir al inicio
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2 border-t border-ink/10 pt-6 text-sm">
          <Link href="/tienda?categoria=pijamas" className="glass-pill inline-flex min-h-11 items-center rounded-md px-4 py-2 font-medium text-ink">
            Pijamas
          </Link>
          <Link href="/tienda?categoria=buzos" className="glass-pill inline-flex min-h-11 items-center rounded-md px-4 py-2 font-medium text-ink">
            Buzos y Hoodies
          </Link>
          <Link href="/tienda?categoria=chaquetas" className="glass-pill inline-flex min-h-11 items-center rounded-md px-4 py-2 font-medium text-ink">
            Chaquetas
          </Link>
          <Link href="/tienda?ofertas=1" className="glass-pill inline-flex min-h-11 items-center rounded-md px-4 py-2 font-medium text-clay-dark">
            Remates San Victorino
          </Link>
        </div>
      </div>
    </div>
  );
}
