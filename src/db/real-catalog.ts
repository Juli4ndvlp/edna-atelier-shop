import type { ColorOption } from "./schema";

/**
 * Catálogo real de EDNA ATELIER. Se carga con `npm run seed:real-catalog`.
 * Las fotos viven en `public/collections` y son las entregadas por el taller.
 */
export const realCategories = [
  {
    slug: "pijamas",
    name: "Pijamas",
    description: "Conjuntos en satén, algodón botánico y punto térmico confeccionados en Bogotá.",
    image: "/collections/pijama-botanica-azul-modelo.webp",
  },
  {
    slug: "buzos",
    name: "Buzos, Hoodies y Sudaderas",
    description: "Algodón perchado de alto gramaje, capota doble y cortes urbanos para Bogotá.",
    image: "/collections/buzo-hoodie-verde-modelo.webp",
  },
  {
    slug: "chaquetas",
    name: "Chaquetas",
    description: "Capas térmicas y polares livianas para las mañanas y noches bogotanas.",
    image: "/collections/chaqueta-negra-urbana-modelo.webp",
  },
] as const;

const C = {
  negro: { name: "Negro carbón", hex: "#141414" },
  blanco: { name: "Blanco puro", hex: "#F7F7F7" },
  gris: { name: "Gris jaspe", hex: "#6B7280" },
  azul: { name: "Azul noche", hex: "#1E2A44" },
  coral: { name: "Coral", hex: "#D9482B" },
  lavanda: { name: "Lavanda floral", hex: "#B9A5D8" },
  verdeBosque: { name: "Verde bosque", hex: "#445E53" },
  salvia: { name: "Verde salvia", hex: "#A3B39F" },
  rosa: { name: "Rosa empolvado", hex: "#E7BDC4" },
  champan: { name: "Champán marfil", hex: "#E5D8C5" },
} satisfies Record<string, ColorOption>;

const TALLAS = ["XS", "S", "M", "L", "XL"];
const TALLAS_H = ["S", "M", "L", "XL", "XXL"];

export type RealProduct = {
  slug: string;
  name: string;
  description: string;
  details: string[];
  price: number; // COP, entero
  category: (typeof realCategories)[number]["slug"];
  gender: "mujer" | "hombre" | "unisex";
  images: string[];
  sizes: string[];
  colors: ColorOption[];
  stock: number;
  featured?: boolean;
  isNew?: boolean;
};

export const realProducts: RealProduct[] = [
  // 5 PIJAMAS
  {
    slug: "pijama-satin-botanica-azul",
    name: "Pijama Satén Botánica Azul",
    description:
      "Conjunto de camisa manga corta y pantalón largo en satén champán con estampado botánico azul noche y ribete confeccionado en nuestro taller de Bogotá.",
    details: [
      "Satén de caída ligera y tacto fresco",
      "Solapa y puños en contraste azul noche",
      "Pantalón recto con elástico suave en cintura",
    ],
    price: 84900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-botanica-azul-modelo.webp",
      "/collections/trio-pijamas-atelier.webp",
    ],
    sizes: TALLAS,
    colors: [C.azul, C.champan],
    stock: 14,
    featured: true,
  },
  {
    slug: "pijama-rayas-coral",
    name: "Pijama Satén Rayas Coral",
    description:
      "Pijama de dos piezas en satén coral con rayas verticales blancas y acabado geométrico en bota. Ideal para descanso o regalo.",
    details: [
      "Satén liviano de brillo sutil",
      "Camisa manga corta con cuello camisero y ribete blanco",
      "Corte cómodo que estiliza sin ajustar",
    ],
    price: 79900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-botanica-coral-modelo.webp",
      "/collections/trio-pijamas-atelier.webp",
    ],
    sizes: TALLAS,
    colors: [C.coral, C.blanco],
    stock: 12,
    featured: true,
    isNew: true,
  },
  {
    slug: "pijama-satin-encaje",
    name: "Pijama Satén y Encaje",
    description:
      "Set de blusa de tiras y short en satén floral champán con detalle de encaje delicado en escote y ruedo.",
    details: [
      "Satén fluido estampado floral",
      "Encaje suave que no pica",
      "Cargaderas graduables y pretina cómoda",
    ],
    price: 79900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-satin-encaje-modelo.webp",
      "/collections/duo-pijamas-atelier.webp",
    ],
    sizes: TALLAS,
    colors: [C.champan, C.blanco],
    stock: 10,
    isNew: true,
  },
  {
    slug: "pijama-camisera-lavanda",
    name: "Pijama Camisera Lavanda",
    description:
      "Pijama manga larga en algodón suave con estampado botánico lavanda, cuello nerú y botonadura frontal confeccionada en el taller.",
    details: [
      "Algodón peinado nacional transpirable",
      "Cuello nerú con botones frontales",
      "Pantalón largo tiro medio para noches bogotanas",
    ],
    price: 84900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-botanica-lavanda-modelo.webp",
      "/collections/pijama-bata-atelier.webp",
    ],
    sizes: TALLAS,
    colors: [C.lavanda, C.blanco],
    stock: 16,
    featured: true,
  },
  {
    slug: "pijama-algodon-botanica-verde",
    name: "Pijama Algodón Botánica Verde",
    description:
      "Conjunto camisero manga larga con estampado de hojas verde salvia, cuello y puños blancos en contraste. Suavidad térmica para clima frío.",
    details: [
      "Algodón peinado con ribete blanco reforzado",
      "Botones al tono y bolsillos discretos",
      "No encoge ni pierde el estampado al lavar",
    ],
    price: 89900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-botanica-verde-modelo.webp",
      "/collections/editorial-taller-01.webp",
    ],
    sizes: TALLAS,
    colors: [C.salvia, C.blanco],
    stock: 18,
  },

  // 3 HOODIES (categoría Buzos)
  {
    slug: "hoodie-perchado-verde-bosque",
    name: "Hoodie Perchado Verde Bosque",
    description:
      "Buzo con capota doble y bolsillo canguro en algodón perchado verde bosque, acompañado de pantalón oscuro relajado. Abrigo real para Bogotá.",
    details: [
      "Algodón perchado grueso de 380 g/m²",
      "Puños y pretina en rib acanalado firme",
      "No motea ni pierde cuerpo con los lavados",
    ],
    price: 119900,
    category: "buzos",
    gender: "hombre",
    images: [
      "/collections/buzo-hoodie-verde-modelo.webp",
      "/collections/editorial-taller-02.webp",
    ],
    sizes: TALLAS_H,
    colors: [C.verdeBosque, C.negro],
    stock: 9,
    featured: true,
    isNew: true,
  },
  {
    slug: "hoodie-oversize-sombra",
    name: "Hoodie Oversize Sombra",
    description:
      "Hoodie de corte amplio en algodón perchado tono negro carbón, pensado para capas sobre camiseta en clima frío.",
    details: [
      "Corte oversize con hombro caído",
      "Capota doble y bolsillo canguro reforzado",
      "Referencia visual pendiente de foto propia del taller",
    ],
    price: 129900,
    category: "buzos",
    gender: "unisex",
    images: ["/collections/chaqueta-negra-urbana-modelo.webp"],
    sizes: TALLAS_H,
    colors: [C.negro, C.gris],
    stock: 11,
  },
  {
    slug: "hoodie-doble-capa-noche",
    name: "Hoodie Doble Capa Noche",
    description:
      "Hoodie térmico de doble capa en azul noche, con interior suave y acabado urbano para uso diario.",
    details: [
      "Doble capa con interior perchado",
      "Rib resistente en puños y pretina",
      "Referencia visual pendiente de foto propia del taller",
    ],
    price: 139900,
    category: "buzos",
    gender: "unisex",
    images: ["/collections/buzo-hoodie-verde-modelo.webp"],
    sizes: TALLAS_H,
    colors: [C.azul, C.negro],
    stock: 8,
  },

  // 2 CHAQUETAS
  {
    slug: "chaqueta-bomber-urbana",
    name: "Chaqueta Bomber Urbana",
    description:
      "Chaqueta térmica liviana en fleece polar negro carbón con cuello alto, cremallera completa y costuras ergonómicas frontales.",
    details: [
      "Fleece polar térmico antipilling",
      "Cierre frontal resistente y cuello cortavientos",
      "Bolsillos laterales ocultos de fácil acceso",
    ],
    price: 169900,
    category: "chaquetas",
    gender: "hombre",
    images: ["/collections/chaqueta-negra-urbana-modelo.webp"],
    sizes: TALLAS,
    colors: [C.negro],
    stock: 7,
    featured: true,
  },
  {
    slug: "chaqueta-termica-andina",
    name: "Chaqueta Térmica Andina",
    description:
      "Capa térmica de alto gramaje para mañanas frías de Bogotá, con corte recto y bolsillos profundos.",
    details: [
      "Relleno térmico liviano",
      "Corte recto compatible con capas intermedias",
      "Referencia visual pendiente de foto propia del taller",
    ],
    price: 189900,
    category: "chaquetas",
    gender: "unisex",
    images: ["/collections/chaqueta-negra-urbana-modelo.webp"],
    sizes: TALLAS,
    colors: [C.negro, C.gris],
    stock: 6,
  },

  // 2 SUDADERAS (categoría Buzos)
  {
    slug: "sudadera-clasica-rosa",
    name: "Sudadera Clásica Rosa",
    description:
      "Sudadera completa femenina de hoodie hombro caído y pantalón bota recta en algodón perchado rosa empolvado.",
    details: [
      "Algodón perchado suave de alto gramaje",
      "Bolsillos laterales funcionales",
      "Disponible al detal y por mayor en San Victorino",
    ],
    price: 99900,
    category: "buzos",
    gender: "mujer",
    images: [
      "/collections/sudadera-rosa-mujer-atelier.webp",
      "/collections/sudadera-completa-rosa-hombre-modelo.webp",
    ],
    sizes: TALLAS,
    colors: [C.rosa, C.blanco],
    stock: 13,
    featured: true,
  },
  {
    slug: "sudadera-cuello-alto-atelier",
    name: "Sudadera Cuello Alto Atelier",
    description:
      "Conjunto masculino de hoodie ranglán y jogger con costuras decorativas en contraste blanco, confeccionado en Bogotá.",
    details: [
      "Perchado de 380 g/m² con interior térmico",
      "Pespunte deportivo en mangas ranglán y bolsillo",
      "Jogger con bota elástica de ajuste limpio",
    ],
    price: 109900,
    category: "buzos",
    gender: "hombre",
    images: [
      "/collections/sudadera-completa-rosa-hombre-modelo.webp",
      "/collections/sudadera-rosa-mujer-atelier.webp",
    ],
    sizes: TALLAS_H,
    colors: [C.rosa, C.gris],
    stock: 10,
  },
];
