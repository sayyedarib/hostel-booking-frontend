/**
 * Applies pending Drizzle migrations from ./drizzle.
 *
 * Usage: pnpm db:migrate
 *
 * Reads DATABASE_URL (falling back to the deprecated NEXT_PUBLIC_DATABASE_URL)
 * from the environment or .env.
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const url = process.env.DATABASE_URL ?? process.env.NEXT_PUBLIC_DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
  process.exit(1);
}

// `max: 1` because migrations must run sequentially on a single connection.
const client = postgres(url, { max: 1, prepare: false });

try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("✓ Migrations applied.");
} catch (error) {
  console.error("✗ Migration failed:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
