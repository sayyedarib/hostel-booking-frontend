import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";

/**
 * Serverless-friendly pool settings.
 *
 * Every Vercel lambda instance opens its own pool, so a large `max` multiplies
 * quickly and exhausts the connection limit on Supabase's free tier. One
 * connection per instance with a short idle timeout keeps usage flat, and
 * `prepare: false` is required when talking to Supabase's transaction pooler.
 */
const client = postgres(env.DATABASE_URL, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
