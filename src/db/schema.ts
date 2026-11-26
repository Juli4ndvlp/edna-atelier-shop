import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export type ColorOption = { name: string; hex: string };

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    details: text("details").array().notNull().default([]),
    // Precios enteros en pesos colombianos (COP).
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    gender: text("gender").notNull().default("unisex"), // mujer | hombre | unisex
    images: text("images").array().notNull().default([]),
    sizes: text("sizes").array().notNull().default([]),
    colors: jsonb("colors").$type<ColorOption[]>().notNull().default([]),
    stock: integer("stock").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    idempotencyKey: text("idempotency_key").unique(),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    address: text("address").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    notes: text("notes").notNull().default(""),
    paymentMethod: text("payment_method").notNull().default("contrareembolso"),
    status: text("status").notNull().default("pendiente"), // pendiente | pagado | enviado | entregado | cancelado
    reservationExpiresAt: timestamp("reservation_expires_at"),
    subtotal: integer("subtotal").notNull(),
    shipping: integer("shipping").notNull().default(0),
    total: integer("total").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("orders_reservation_expiry_idx").on(t.status, t.reservationExpiresAt)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    image: text("image").notNull().default(""),
    size: text("size").notNull(),
    color: text("color").notNull(),
    price: integer("price").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const newsletter = pgTable("newsletter", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    resetAt: timestamp("reset_at").notNull(),
  },
  (t) => [index("rate_limit_buckets_reset_idx").on(t.resetAt)],
);

export const adminAudit = pgTable(
  "admin_audit",
  {
    id: serial("id").primaryKey(),
    actor: text("actor").notNull().default("admin"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("admin_audit_created_idx").on(t.createdAt)],
);
