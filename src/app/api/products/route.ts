import { z } from "zod";
import { searchProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  categoria: z.string().trim().max(50).optional(),
  genero: z.enum(["mujer", "hombre", "unisex"]).optional(),
  q: z.string().trim().max(80).optional(),
  orden: z.enum(["novedades", "precio-asc", "precio-desc"]).optional(),
  ofertas: z.enum(["0", "1"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      categoria: searchParams.get("categoria") || undefined,
      genero: searchParams.get("genero") || undefined,
      q: searchParams.get("q") || undefined,
      orden: searchParams.get("orden") || undefined,
      ofertas: searchParams.get("ofertas") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    if (!parsed.success) {
      return Response.json({ error: "Parámetros de búsqueda no válidos" }, { status: 400 });
    }

    const items = await searchProducts({
      category: parsed.data.categoria,
      gender: parsed.data.genero,
      q: parsed.data.q,
      sort: parsed.data.orden,
      sale: parsed.data.ofertas === "1",
      limit: parsed.data.limit,
    });

    return Response.json({ items });
  } catch {
    return Response.json({ error: "No se pudieron cargar los productos" }, { status: 500 });
  }
}
