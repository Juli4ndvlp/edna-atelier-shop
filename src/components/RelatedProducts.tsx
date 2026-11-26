import { ProductCard } from "@/components/ProductCard";
import { getRelatedProducts } from "@/lib/catalog";

export async function RelatedProducts({
  categoryId,
  excludeId,
}: {
  categoryId: number;
  excludeId: number;
}) {
  const related = await getRelatedProducts(categoryId, excludeId);
  if (related.length === 0) return null;

  return (
    <section className="mt-20">
      <h2 className="font-display text-3xl font-bold text-ink">Combínalo con otras prendas</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
