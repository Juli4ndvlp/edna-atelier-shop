import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"], quiet: true });

// Las migraciones deben usar la conexión directa (o pooler de sesión), no el pooler
// transaccional de la aplicación.
const url = process.env.MIGRATION_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
if (!url) {
  throw new Error("DATABASE_URL is required before running any drizzle-kit command");
}

let parsedUrl: URL;
try {
  parsedUrl = new URL(url);
} catch {
  throw new Error("DATABASE_URL must be a valid PostgreSQL connection string");
}
if (parsedUrl.protocol !== "postgres:" && parsedUrl.protocol !== "postgresql:") {
  throw new Error("DATABASE_URL must use the postgres or postgresql scheme");
}
if (parsedUrl.port === "6543") {
  throw new Error(
    "drizzle-kit cannot use the Supabase transaction pooler (:6543). Set MIGRATION_DATABASE_URL to the direct connection (:5432) or the session pooler.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
