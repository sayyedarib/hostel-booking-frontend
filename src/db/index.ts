import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.NEXT_PUBLIC_DATABASE_URL!, {
  prepare: false,
});
export const db = drizzle(client);
