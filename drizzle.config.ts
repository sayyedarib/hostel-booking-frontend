import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

// `NEXT_PUBLIC_DATABASE_URL` is the deprecated name kept for compatibility.
const url = process.env.DATABASE_URL ?? process.env.NEXT_PUBLIC_DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is not set — drizzle-kit cannot connect.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
