import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Producto no encontrado</h1>
      <p className="mt-3 text-ink/60">Puede que ya no esté disponible.</p>
      <Link href="/tienda" className="btn-primary mt-8">Volver a la tienda</Link>
    </div>
  );
}
