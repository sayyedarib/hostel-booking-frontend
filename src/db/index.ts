import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";

/**
 * Pool settings tuned for serverless on Supabase's free tier.
 *
 * Every Vercel instance opens its own pool, so an unbounded `max` multiplies
 * across instances and exhausts the connection limit. `idle_timeout` returns
 * connections promptly so idle instances stop holding them.
 *
 * `max` must stay above 1: with a single connection, concurrent queries — such
 * as the four aggregates the dashboard issues via `Promise.all` — deadlock
 * rather than queue, and the request hangs indefinitely.
 *
 * `prepare: false` is required when talking to Supabase's transaction pooler.
 */
const client = postgres(env.DATABASE_URL, {
  prepare: false,
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
