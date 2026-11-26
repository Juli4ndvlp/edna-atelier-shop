export type MediaItem =
  | {
      kind: "image";
      src: string;
      alt?: string;
      role?: "model" | "garment" | "detail";
    }
  | {
      kind: "video";
      src: string;
      webmSrc?: string;
      poster: string;
      alt?: string;
      role?: "model" | "runway";
    };

export type LookbookVideo = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  src: string;
  poster: string;
  href: string;
  cta: string;
};

const PRODUCT_VIDEO_BY_SLUG: Record<string, { src: string; poster: string; alt: string }> = {
  "pijama-satin-botanica-azul": {
    src: "/videos/trio-pijamas-lookbook.mp4",
    poster: "/collections/trio-pijamas-atelier.webp",
    alt: "Lookbook en movimiento de la Pijama Satén Botánica Azul en EDNA ATELIER",
  },
  "pijama-rayas-coral": {
    src: "/videos/pijama-naranja-rayas.mp4",
    poster: "/collections/pijama-botanica-coral-modelo.webp",
    alt: "Video con modelo de la Pijama Satén Rayas Coral",
  },
  "pijama-satin-encaje": {
    src: "/videos/lookbook-atelier-edna.mp4",
    poster: "/collections/duo-pijamas-atelier.webp",
    alt: "Pasarela de Dúo Pijama Satén y Encaje EDNA ATELIER",
  },
  "pijama-botanica-lavanda": {
    src: "/videos/pijama-blanca-rosas.mp4",
    poster: "/collections/pijama-botanica-lavanda-modelo.webp",
    alt: "Video detalle de la Pijama Camisera Lavanda",
  },
  "pijama-botanica-verde": {
    src: "/videos/coleccion-completa-edna.mp4",
    poster: "/collections/pijama-botanica-verde-modelo.webp",
    alt: "Colección botánica en algodón de EDNA ATELIER",
  },
  "pijama-hombre-gris": {
    src: "/videos/pijama-hombre-gris.mp4",
    poster: "/collections/pijama-hombre-gris-atelier.webp",
    alt: "Video de la Pijama Punto Hombre Gris Carbón",
  },
  "buzo-hoodie-verde-bosque": {
    src: "/videos/buzo-sudadera-verde.mp4",
    poster: "/collections/buzo-hoodie-verde-modelo.webp",
    alt: "Video con modelo del Conjunto Hoodie Verde Bosque",
  },
  "sudadera-rosa-mujer": {
    src: "/videos/sudadera-rosa-mujer.mp4",
    poster: "/collections/sudadera-rosa-mujer-atelier.webp",
    alt: "Video urbano del Conjunto Sudadera Rosa Mujer",
  },
  "sudadera-rosa-hombre": {
    src: "/videos/sudadera-rosa-hombre.mp4",
    poster: "/collections/sudadera-completa-rosa-hombre-modelo.webp",
    alt: "Video con modelo de la Sudadera Completa Rosa Hombre",
  },
  "chaqueta-negra-urbana": {
    src: "/videos/chaqueta-negra-urbana.mp4",
    poster: "/collections/chaqueta-negra-urbana-modelo.webp",
    alt: "Video con modelo de la Chaqueta Polar Negra Urbana",
  },
  // Slugs del catálogo real cargado en producción.
  "pijama-camisera-lavanda": {
    src: "/videos/pijama-blanca-rosas.mp4",
    poster: "/collections/pijama-botanica-lavanda-modelo.webp",
    alt: "Video detalle de la Pijama Camisera Lavanda",
  },
  "pijama-algodon-botanica-verde": {
    src: "/videos/coleccion-completa-edna.mp4",
    poster: "/collections/pijama-botanica-verde-modelo.webp",
    alt: "Colección botánica en algodón de EDNA ATELIER",
  },
  "hoodie-perchado-verde-bosque": {
    src: "/videos/buzo-sudadera-verde.mp4",
    poster: "/collections/buzo-hoodie-verde-modelo.webp",
    alt: "Video con modelo del Hoodie Perchado Verde Bosque",
  },
  "chaqueta-bomber-urbana": {
    src: "/videos/chaqueta-negra-urbana.mp4",
    poster: "/collections/chaqueta-negra-urbana-modelo.webp",
    alt: "Video con modelo de la Chaqueta Bomber Urbana",
  },
  "sudadera-clasica-rosa": {
    src: "/videos/sudadera-rosa-mujer.mp4",
    poster: "/collections/sudadera-rosa-mujer-atelier.webp",
    alt: "Video urbano de la Sudadera Clásica Rosa",
  },
  "sudadera-cuello-alto-atelier": {
    src: "/videos/sudadera-rosa-hombre.mp4",
    poster: "/collections/sudadera-completa-rosa-hombre-modelo.webp",
    alt: "Video con modelo de la Sudadera Cuello Alto Atelier",
  },
};

export const LOOKBOOK_VIDEOS: LookbookVideo[] = [
  {
    id: "coleccion-completa",
    tag: "Colección Atelier",
    title: "Cápsula Completa Bogotá",
    subtitle: "Pijamas botánicas, satén y conjuntos perchados hechos en nuestro taller.",
    src: "/videos/coleccion-completa-edna.mp4",
    poster: "/collections/duo-pijamas-atelier.webp",
    href: "/tienda",
    cta: "Ver colección",
  },
  {
    id: "trio-pijamas",
    tag: "Línea Pijamas",
    title: "Satén & Botánica en Movimiento",
    subtitle: "Caída ligera y acabados de taller listos para pedido por WhatsApp.",
    src: "/videos/trio-pijamas-lookbook.mp4",
    poster: "/collections/trio-pijamas-atelier.webp",
    href: "/tienda?categoria=pijamas",
    cta: "Explorar pijamas",
  },
  {
    id: "hoodie-verde",
    tag: "Buzos Perchados",
    title: "Conjunto Hoodie Verde Bosque",
    subtitle: "Algodón perchado grueso para el frío bogotano, corte relajado.",
    src: "/videos/buzo-sudadera-verde.mp4",
    poster: "/collections/buzo-hoodie-verde-modelo.webp",
    href: "/producto/buzo-hoodie-verde-bosque",
    cta: "Ver prenda",
  },
  {
    id: "chaqueta-negra",
    tag: "Edición Urbana",
    title: "Chaqueta Polar Negra",
    subtitle: "Abrigo liviano cuello alto con cierre completo y bolsillos frontales.",
    src: "/videos/chaqueta-negra-urbana.mp4",
    poster: "/collections/chaqueta-negra-urbana-modelo.webp",
    href: "/producto/chaqueta-negra-urbana",
    cta: "Ver chaqueta",
  },
];

export function resolveProductMedia(
  product: { slug?: string; name: string; images: string[]; media?: MediaItem[] },
): MediaItem[] {
  if (product.media && product.media.length > 0) return product.media;
  const imageItems: MediaItem[] = product.images.map((src, index) => ({
    kind: "image" as const,
    src,
    alt: index === 0 ? `${product.name} · EDNA ATELIER` : `${product.name} detalle ${index + 1}`,
    role: index === 0 ? "model" : "garment",
  }));

  const video = product.slug ? PRODUCT_VIDEO_BY_SLUG[product.slug] : undefined;
  if (!video) return imageItems;

  const videoItem: MediaItem = {
    kind: "video",
    src: video.src,
    poster: video.poster || product.images[0] || "",
    alt: video.alt,
    role: "model",
  };

  if (imageItems.length === 0) return [videoItem];
  return [imageItems[0], videoItem, ...imageItems.slice(1)];
}

export function getPrimaryImage(product: { images: string[]; media?: MediaItem[] }): string {
  const firstMedia = product.media?.[0];
  if (firstMedia) {
    return firstMedia.kind === "video" ? firstMedia.poster : firstMedia.src;
  }
  return product.images[0] ?? "";
}
