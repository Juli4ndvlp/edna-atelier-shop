-- Add a 24-hour stock reservation deadline to new and existing open orders.
-- Existing open orders get at least 24 hours from migration time before expiration.
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "reservation_expires_at" timestamp;

UPDATE "orders"
SET "reservation_expires_at" = GREATEST("created_at" + interval '24 hours', now())
WHERE "status" IN ('pendiente', 'whatsapp')
  AND "reservation_expires_at" IS NULL;

CREATE INDEX IF NOT EXISTS "orders_reservation_expiry_idx"
  ON "orders" USING btree ("status", "reservation_expires_at");
