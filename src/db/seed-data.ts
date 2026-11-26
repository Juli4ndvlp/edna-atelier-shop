import type { ColorOption } from "./schema";

const img = (id: number, w = 800, h = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=${h}&w=${w}`;

export const seedCategories = [
  {
    slug: "pijamas",
    name: "Pijamas",
    description: "Conjuntos en satén, algodón peinado y franela térmica directo de taller en Bogotá.",
    image: img(9499298),
  },
  {
    slug: "buzos",
    name: "Buzos y Hoodies",
    description: "Buzos en algodón perchado de alto gramaje, corte oversize y básicos San Victorino.",
    image: img(16982942),
  },
  {
    slug: "chaquetas",
    name: "Chaquetas",
    description: "Chaquetas térmicas, bombers y abrigos pensados para el clima de Bogotá.",
    image: img(6791641),
  },
];

const C = {
  borgona: { name: "Borgoña", hex: "#6B1D2F" },
  oliva: { name: "Verde oliva", hex: "#4B5836" },
  negro: { name: "Negro carbón", hex: "#1C1718" },
  marfil: { name: "Marfil", hex: "#EFE8DC" },
  azul: { name: "Azul noche", hex: "#1E2A44" },
  gris: { name: "Gris jaspe", hex: "#8F8A86" },
  mostaza: { name: "Ocre dorado", hex: "#C28B2A" },
  caqui: { name: "Arena oliva", hex: "#7A7355" },
  blanco: { name: "Blanco lino", hex: "#F7F3EC" },
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
    slug: "pijama-satin-luna",
    name: "Pijama Satén Borgoña Atelier",
    description:
      "Conjunto de camisa y pantalón largo en satén ligero con ribete artesanal en contraste. Confección Edna Atelier en Bogotá, tacto sedoso ideal para descanso o regalo.",
    details: [
      "Satén seda piel de durazno 95% poliéster, 5% elastano",
      "Botones nacarados y costura reforzada de taller",
      "Cintura elástica cómoda",
      "Disponible al detal y por mayor",
    ],
    price: 79900,
    compareAtPrice: 109900,
    category: "pijamas",
    gender: "mujer",
    images: [img(6976713), img(6976714)],
    sizes: TALLAS,
    colors: [C.borgona, C.oliva, C.negro],
    stock: 42,
    featured: true,
  },
  {
    slug: "pijama-algodon-nube",
    name: "Pijama Algodón Pima Nube",
    description:
      "Pijama de dos piezas en algodón peinado suave y transpirable. Diseñada en nuestro taller de Bogotá para el uso diario y noches frescas.",
    details: [
      "100% algodón peinado nacional",
      "Pantalón con bolsillos laterales profundos",
      "Costuras planas suaves al contacto",
    ],
    price: 68900,
    category: "pijamas",
    gender: "mujer",
    images: [img(9499298), img(7507083)],
    sizes: TALLAS,
    colors: [C.marfil, C.oliva, C.borgona],
    stock: 60,
    isNew: true,
    featured: true,
  },
  {
    slug: "pijama-franela-cabana",
    name: "Pijama Térmica Franela Sabana",
    description:
      "Pijama en franela cepillada térmica pensada para el frío de las noches bogotanas. Abriga sin resultar pesada.",
    details: [
      "Franela térmica 210 g/m² de alta durabilidad",
      "Cuello camisero clásico",
      "Pantalón con cordón ajustable",
    ],
    price: 74900,
    compareAtPrice: 94900,
    category: "pijamas",
    gender: "hombre",
    images: [img(7507083), img(6976714)],
    sizes: TALLAS_H,
    colors: [C.azul, C.borgona, C.oliva],
    stock: 35,
  },
  {
    slug: "conjunto-lounge-sosiego",
    name: "Set Pijama & Lounge Remate Taller",
    description:
      "Set de camiseta y pantalón en punto suave, precio especial de remate directo de taller en San Victorino.",
    details: [
      "Mezcla modal y algodón elástico",
      "Corte relajado unisex",
      "Precio remate por últimas curvas de lote",
    ],
    price: 49900,
    compareAtPrice: 74900,
    category: "pijamas",
    gender: "unisex",
    images: [img(6976714), img(9499298)],
    sizes: TALLAS,
    colors: [C.gris, C.marfil, C.oliva],
    stock: 50,
  },
  // BUZOS Y HOODIES
  {
    slug: "sudadera-capucha-esencial",
    name: "Buzo Hoodie Perchado Esencial",
    description:
      "Buzo con capucha en algodón perchado grueso de 380 g/m², bolsillo canguro y capota doble. El favorito para el clima de Bogotá.",
    details: [
      "Algodón perchado Mónaco 380 g/m²",
      "Capota doble forrada sin deformación",
      "No motea ni encoge al lavar",
    ],
    price: 84900,
    category: "buzos",
    gender: "unisex",
    images: [img(16982942), img(30283404)],
    sizes: TALLAS,
    colors: [C.oliva, C.borgona, C.negro, C.marfil],
    stock: 80,
    featured: true,
    isNew: true,
  },
  {
    slug: "sudadera-cuello-redondo-clasica",
    name: "Buzo Cuello Redondo Atelier",
    description:
      "Buzo clásico cuello redondo en algodón nacional con ribete acanalado firme. Ideal para uso diario, estampado o mayoristas.",
    details: [
      "Algodón perchado premium",
      "Puños y pretina en rib de alta recuperación",
      "Corte regular cómodo",
    ],
    price: 69900,
    compareAtPrice: 89900,
    category: "buzos",
    gender: "hombre",
    images: [img(7207120), img(31052880)],
    sizes: TALLAS_H,
    colors: [C.azul, C.oliva, C.gris],
    stock: 65,
  },
  {
    slug: "hoodie-oversize-solana",
    name: "Hoodie Oversize Borgoña & Oliva",
    description:
      "Buzo oversize de hombros caídos confeccionado en el taller Edna Atelier. Silueta urbana con caída estructurada para hombre y mujer.",
    details: [
      "85% algodón perchado pesado, 15% poliéster",
      "Hombros caídos y capucha amplia",
      "Acabado suave interior térmico",
    ],
    price: 92900,
    compareAtPrice: 119900,
    category: "buzos",
    gender: "mujer",
    images: [img(10971305), img(30283404)],
    sizes: TALLAS,
    colors: [C.borgona, C.oliva, C.mostaza],
    stock: 28,
    featured: true,
  },
  {
    slug: "sudadera-media-cremallera-trail",
    name: "Buzo Medio Cierre Urbano",
    description:
      "Buzo con cuello alto y cremallera metálica, versátil para las mañanas frías en Bogotá o salidas de fin de semana.",
    details: [
      "Algodón perchado térmico",
      "Cremallera metálica resistente",
      "Bolsillo canguro frontal",
    ],
    price: 89900,
    category: "buzos",
    gender: "unisex",
    images: [img(31052880), img(7207120)],
    sizes: TALLAS_H,
    colors: [C.negro, C.oliva, C.caqui],
    stock: 40,
    isNew: true,
  },
  // CHAQUETAS
  {
    slug: "chaqueta-cuero-vegano-rebel",
    name: "Chaqueta Biker Mate Atelier",
    description:
      "Chaqueta corte biker en cuero sintético de acabado mate con cremalleras metálicas y forro satinado interior.",
    details: [
      "Cuerina PU mate de alta resistencia",
      "Forro interior acolchado liviano",
      "Bolsillos funcionales con cremallera",
    ],
    price: 149900,
    compareAtPrice: 189900,
    category: "chaquetas",
    gender: "mujer",
    images: [img(6791641), img(35970489)],
    sizes: TALLAS,
    colors: [C.negro, C.borgona],
    stock: 22,
    featured: true,
  },
  {
    slug: "bomber-verde-urban",
    name: "Chaqueta Bomber Verde Oliva",
    description:
      "Bomber impermeable ligera en verde oliva, cortavientos ideal para lluvia suave y clima variable en Bogotá.",
    details: [
      "Exterior antifluido cortavientos",
      "Forro interior transpirable",
      "Bolsillos laterales y bolsillo interno",
    ],
    price: 129900,
    category: "chaquetas",
    gender: "hombre",
    images: [img(13973137), img(15963563)],
    sizes: TALLAS_H,
    colors: [C.oliva, C.negro, C.azul],
    stock: 30,
    isNew: true,
  },
  {
    slug: "abrigo-gabardina-otono",
    name: "Gabardina Clásica Bogotá",
    description:
      "Gabardina de corte recto con cinturón desmontable y tela repelente al agua. Elegancia práctica para la ciudad.",
    details: [
      "Gabardina antifluido repelente al agua",
      "Cinturón ajustable",
      "Botonadura doble de taller",
    ],
    price: 179900,
    category: "chaquetas",
    gender: "mujer",
    images: [img(8454520), img(35970489)],
    sizes: TALLAS,
    colors: [C.caqui, C.marfil, C.borgona],
    stock: 18,
    featured: true,
  },
  {
    slug: "chaqueta-acolchada-cumbre",
    name: "Chaqueta Acolchada Térmica Remate",
    description:
      "Chaqueta puffer liviana térmica en remate de temporada. Mantiene el calor en madrugadas frías sin abultar.",
    details: [
      "Relleno térmico guata siliconada",
      "Capucha ajustable",
      "Bolsillos con cremallera",
    ],
    price: 119900,
    compareAtPrice: 159900,
    category: "chaquetas",
    gender: "unisex",
    images: [img(15963563), img(13973137)],
    sizes: TALLAS_H,
    colors: [C.blanco, C.negro, C.oliva],
    stock: 33,
  },
];
