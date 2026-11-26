import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <div className="glass-surface rounded-xl p-8 sm:p-10">
        <p className="glass-pill inline-block rounded-md px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-clay-dark">
          Error 404 · Prenda
        </p>
        <h1 className="font-display mt-4 text-3xl font-bold text-ink sm:text-4xl">
          Producto no encontrado
        </h1>
        <p className="mt-3 text-ink/80">
          Puede que este lote ya se haya agotado en nuestro taller. Explora el catálogo disponible.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/tienda" className="btn-primary">
            Volver a la tienda
          </Link>
          <Link href="/tienda?ofertas=1" className="btn-outline">
            Ver remates
          </Link>
        </div>
      </div>
    </div>
  );
}
