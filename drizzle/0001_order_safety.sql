-- Additive schema changes required for idempotent order creation and shared rate limiting.
-- Review the target database before applying. This file intentionally does not run automatically.

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "idempotency_key" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_idempotency_key_unique'
      AND conrelid = 'orders'::regclass
  ) THEN
    ALTER TABLE "orders"
      ADD CONSTRAINT "orders_idempotency_key_unique" UNIQUE ("idempotency_key");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
  "key" text PRIMARY KEY NOT NULL,
  "count" integer NOT NULL,
  "reset_at" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "rate_limit_buckets_reset_idx"
  ON "rate_limit_buckets" USING btree ("reset_at");
