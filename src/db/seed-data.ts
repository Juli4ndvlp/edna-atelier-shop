import type { ColorOption } from "./schema";

export const seedCategories = [
  {
    slug: "pijamas",
    name: "Pijamas",
    description: "Conjuntos en satén, algodón botánico y punto térmico directo de taller en Bogotá.",
    image: "/collections/pijama-botanica-azul-modelo.webp",
  },
  {
    slug: "buzos",
    name: "Buzos y Hoodies",
    description: "Conjuntos en algodón perchado de alto gramaje, capota doble y corte urbano.",
    image: "/collections/buzo-hoodie-verde-modelo.webp",
  },
  {
    slug: "chaquetas",
    name: "Chaquetas",
    description: "Chaquetas polares y capas térmicas diseñadas para las mañanas y noches de Bogotá.",
    image: "/collections/chaqueta-negra-urbana-modelo.webp",
  },
];

const C = {
  negro: { name: "Negro carbón", hex: "#141414" },
  blanco: { name: "Blanco puro", hex: "#F7F7F7" },
  gris: { name: "Gris jaspe", hex: "#6B7280" },
  azul: { name: "Azul noche", hex: "#1E2A44" },
  coral: { name: "Coral rayas", hex: "#D9482B" },
  lavanda: { name: "Lavanda floral", hex: "#B9A5D8" },
  verdeBosque: { name: "Verde bosque", hex: "#445E53" },
  salvia: { name: "Verde salvia", hex: "#A3B39F" },
  durazno: { name: "Durazno suave", hex: "#F6AA87" },
  rosa: { name: "Rosa empolvado", hex: "#E7BDC4" },
  champan: { name: "Champán marfil", hex: "#E5D8C5" },
} satisfies Record<string, ColorOption>;

const TALLAS = ["XS", "S", "M", "L", "XL"];
const TALLAS_H = ["S", "M", "L", "XL", "XXL"];

export const seedProducts: {
  slug: string;
  name: string;
  description: string;
  details: string[];
  price: number; // Pesos colombianos (COP)
  compareAtPrice?: number;
  category: string;
  gender: "mujer" | "hombre" | "unisex";
  images: string[];
  sizes: string[];
  colors: ColorOption[];
  stock: number;
  featured?: boolean;
  isNew?: boolean;
}[] = [
  // PIJAMAS
  {
    slug: "pijama-satin-botanica-azul",
    name: "Pijama Satén Botánica Azul",
    description:
      "Conjunto de camisa manga corta y pantalón largo en satén champán con estampado botánico azul noche y ribete artesanal. Confección EDNA ATELIER Bogotá.",
    details: [
      "Satén sedoso de caída ligera y tacto fresco",
      "Solapa y puños en contraste azul noche",
      "Pantalón recto con elástico suave en cintura",
      "Disponible al detal y por mayor en San Victorino",
    ],
    price: 84900,
    compareAtPrice: 109900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-botanica-azul-modelo.webp",
      "/collections/trio-pijamas-atelier.webp",
    ],
    sizes: TALLAS,
    colors: [C.azul, C.champan],
    stock: 42,
    featured: true,
  },
  {
    slug: "pijama-rayas-coral",
    name: "Pijama Satén Rayas Coral",
    description:
      "Pijama de dos piezas en satén coral intenso con rayas verticales blancas y acabado geométrico en bota. Ideal para descanso o regalo.",
    details: [
      "Satén liviano de brillo sutil y alta durabilidad",
      "Camisa manga corta con cuello camisero y ribete blanco",
      "Corte cómodo que estiliza sin ajustar",
    ],
    price: 79900,
    compareAtPrice: 104900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-botanica-coral-modelo.webp",
      "/collections/trio-pijamas-atelier.webp",
    ],
    sizes: TALLAS,
    colors: [C.coral, C.blanco],
    stock: 36,
    featured: true,
    isNew: true,
  },
  {
    slug: "pijama-satin-encaje",
    name: "Dúo Pijama Satén & Encaje",
    description:
      "Set de blusa de tiras y short en satén floral tono champán con detalle de encaje delicado en escote y ruedo.",
    details: [
      "Satén fluido estampado floral",
      "Aplicación de encaje suave que no pica",
      "Cargaderas graduables y short de pretina cómoda",
    ],
    price: 74900,
    compareAtPrice: 96900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-satin-encaje-modelo.webp",
      "/collections/duo-pijamas-atelier.webp",
    ],
    sizes: TALLAS,
    colors: [C.champan, C.blanco],
    stock: 48,
    featured: true,
    isNew: true,
  },
  {
    slug: "pijama-botanica-lavanda",
    name: "Pijama Camisera Lavanda",
    description:
      "Pijama manga larga en algodón suave con estampado botánico lavanda, cuello nerú y botonadura frontal confeccionada en nuestro taller.",
    details: [
      "Algodón peinado nacional transpirable",
      "Cuello nerú con botones frontales",
      "Pantalón largo tiro medio para noches bogotanas",
    ],
    price: 72900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-botanica-lavanda-modelo.webp",
      "/collections/pijama-bata-atelier.webp",
    ],
    sizes: TALLAS,
    colors: [C.lavanda, C.blanco],
    stock: 54,
    featured: true,
  },
  {
    slug: "bata-camisera-lavanda",
    name: "Bata Camisera Floral Lavanda",
    description:
      "Bata camisera holgada de manga corta con botones frontales y estampado de espigas lavanda. Fresca, práctica y pensada para máximo confort en casa.",
    details: [
      "Punto de algodón liviano de tacto suave",
      "Manga corta con presilla y botón",
      "Precio directo de taller EDNA ATELIER",
    ],
    price: 64900,
    compareAtPrice: 84900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-bata-atelier.webp",
      "/collections/pijama-botanica-lavanda-modelo.webp",
    ],
    sizes: TALLAS,
    colors: [C.lavanda, C.blanco],
    stock: 30,
  },
  {
    slug: "pijama-botanica-verde",
    name: "Pijama Algodón Botánica Verde",
    description:
      "Conjunto camisero manga larga con estampado de hojas verde salvia, cuello y puños blancos en contraste. Suavidad térmica para clima frío.",
    details: [
      "Algodón peinado con ribete blanco reforzado",
      "Botones al tono y bolsillos discretos",
      "No encoge ni pierde el estampado al lavar",
    ],
    price: 76900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-botanica-verde-modelo.webp",
      "/collections/duo-pijamas-atelier.webp",
    ],
    sizes: TALLAS,
    colors: [C.salvia, C.blanco],
    stock: 44,
    isNew: true,
  },
  {
    slug: "pijama-botanica-durazno",
    name: "Pijama Manga Larga Durazno",
    description:
      "Pijama camisera de cuerpo botánico combinado con mangas, cuello y bota en tono durazno sólido. Diseño exclusivo EDNA ATELIER.",
    details: [
      "Mezcla algodón suavizado de 190 g/m²",
      "Mangas y bota en contraste durazno",
      "Costuras planas para descanso sin marcas",
    ],
    price: 75900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-botanica-durazno-modelo.webp",
      "/collections/editorial-taller-01.webp",
    ],
    sizes: TALLAS,
    colors: [C.durazno, C.champan],
    stock: 38,
  },
  {
    slug: "pijama-escote-durazno",
    name: "Pijama Manga Corta Durazno",
    description:
      "Conjunto ligero con camiseta cuello en V en tono durazno, mangas y pantalón largo en estampado botánico suave.",
    details: [
      "Algodón fresco ideal para todo el año",
      "Cuello camisero abierto con detalle estampado",
      "Precio especial de remate directo de taller",
    ],
    price: 68900,
    compareAtPrice: 89900,
    category: "pijamas",
    gender: "mujer",
    images: [
      "/collections/pijama-durazno-botanica-modelo.webp",
      "/collections/editorial-taller-01.webp",
    ],
    sizes: TALLAS,
    colors: [C.durazno, C.champan],
    stock: 50,
    featured: true,
  },
  {
    slug: "pijama-hombre-gris",
    name: "Pijama Punto Hombre Gris Carbón",
    description:
      "Pijama masculina de camiseta manga larga en tejido jaspeado gris con cuello en V, bolsillo frontal negro y pantalón largo recto.",
    details: [
      "Punto texturizado cálido y respirable",
      "Cuello en V y bolsillo ribeteado en negro carbón",
      "Pantalón amplio con cintura elástica cubierta",
    ],
    price: 78900,
    compareAtPrice: 99900,
    category: "pijamas",
    gender: "hombre",
    images: [
      "/collections/editorial-taller-02.webp",
      "/collections/pijama-hombre-gris-atelier.webp",
    ],
    sizes: TALLAS_H,
    colors: [C.gris, C.negro],
    stock: 40,
    featured: true,
  },
  // BUZOS Y HOODIES
  {
    slug: "buzo-hoodie-verde-bosque",
    name: "Conjunto Hoodie Verde Bosque",
    description:
      "Buzo con capota doble y bolsillo canguro en algodón perchado verde bosque acompañado de pantalón oscuro relajado. Abrigo real para Bogotá.",
    details: [
      "Algodón perchado grueso de 380 g/m²",
      "Puños y pretina en rib acanalado firme",
      "No motea ni pierde cuerpo con los lavados",
    ],
    price: 94900,
    compareAtPrice: 124900,
    category: "buzos",
    gender: "hombre",
    images: ["/collections/buzo-hoodie-verde-modelo.webp"],
    sizes: TALLAS_H,
    colors: [C.verdeBosque, C.negro],
    stock: 62,
    featured: true,
    isNew: true,
  },
  {
    slug: "sudadera-rosa-mujer",
    name: "Conjunto Sudadera Rosa Mujer",
    description:
      "Sudadera completa femenina de hoodie hombro caído y pantalón bota recta en algodón perchado rosa empolvado. Comodidad urbana dentro y fuera de casa.",
    details: [
      "Algodón perchado suave de alto gramaje",
      "Bolsillos laterales funcionales",
      "Disponible al detal y curvas mayoristas en San Victorino",
    ],
    price: 98900,
    compareAtPrice: 129900,
    category: "buzos",
    gender: "mujer",
    images: [
      "/collections/sudadera-rosa-mujer-atelier.webp",
      "/collections/sudadera-completa-rosa-hombre-modelo.webp",
    ],
    sizes: TALLAS,
    colors: [C.rosa, C.blanco],
    stock: 34,
    featured: true,
  },
  {
    slug: "sudadera-rosa-hombre",
    name: "Sudadera Completa Rosa Hombre",
    description:
      "Conjunto masculino de hoodie ranglán y jogger con costuras decorativas en contraste blanco. Diseño contemporáneo hecho en nuestro taller de Bogotá.",
    details: [
      "Perchado Mónaco 380 g/m² interior térmico",
      "Pespunte deportivo en mangas ranglán y bolsillo",
      "Jogger con bota elástica de ajuste limpio",
    ],
    price: 98900,
    category: "buzos",
    gender: "hombre",
    images: [
      "/collections/sudadera-completa-rosa-hombre-modelo.webp",
      "/collections/sudadera-rosa-mujer-atelier.webp",
    ],
    sizes: TALLAS_H,
    colors: [C.rosa, C.gris],
    stock: 28,
  },
  // CHAQUETAS
  {
    slug: "chaqueta-negra-urbana",
    name: "Chaqueta Polar Negra Urbana",
    description:
      "Chaqueta térmica liviana en fleece polar negro carbón con cuello alto, cremallera completa y costuras ergonómicas frontales.",
    details: [
      "Fleece polar térmico antipilling",
      "Cierre frontal resistente y cuello cortavientos",
      "Bolsillos laterales ocultos de fácil acceso",
    ],
    price: 139900,
    compareAtPrice: 179900,
    category: "chaquetas",
    gender: "hombre",
    images: ["/collections/chaqueta-negra-urbana-modelo.webp"],
    sizes: TALLAS_H,
    colors: [C.negro],
    stock: 26,
    featured: true,
  },
];
