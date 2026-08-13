DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('guest', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" "user_role" DEFAULT 'guest' NOT NULL;
--> statement-breakpoint
UPDATE "user" SET "role" = 'admin' WHERE "clerk_id" IN ('user_2sVvqEHglWzpu32MQycvhl14rYD', 'user_2sTm6Ig2B2WC7MYsc79Gf712Em8', 'user_2n9mnloqLf2QogRf5dXBc3kVvm4');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_clerk_id_idx" ON "user" ("clerk_id");
