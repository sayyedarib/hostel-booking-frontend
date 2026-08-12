import "server-only";

import { z } from "zod";

/**
 * Validated server-side environment.
 *
 * Several secrets were historically named with a `NEXT_PUBLIC_` prefix, which
 * tells Next.js to inline the value into the browser bundle the moment it is
 * referenced from client code — one stray import away from leaking the database
 * URL or SMTP password. The correct names are read first and the legacy names
 * are accepted as a fallback so an existing deployment keeps working; see
 * `.env.example` for the migration.
 */

const legacyAliases: Record<string, string> = {
  DATABASE_URL: "NEXT_PUBLIC_DATABASE_URL",
  EMAIL_USER: "NEXT_PUBLIC_EMAIL_USR",
  EMAIL_PASSWORD: "NEXT_PUBLIC_EMAIL_PWD",
  CLERK_WEBHOOK_SECRET: "NEXT_PUBLIC_CLERK_WEBHOOK_SECRET",
};

const deprecationsReported = new Set<string>();

function read(name: string): string | undefined {
  const direct = process.env[name];
  if (direct) return direct;

  const legacyName = legacyAliases[name];
  if (!legacyName) return undefined;

  const legacyValue = process.env[legacyName];
  if (legacyValue && !deprecationsReported.has(name)) {
    deprecationsReported.add(name);
    console.warn(
      `[env] "${legacyName}" is deprecated because the NEXT_PUBLIC_ prefix ` +
        `exposes secrets to the browser. Rename it to "${name}".`,
    );
  }
  return legacyValue;
}

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASSWORD: z.string().optional(),
});

const parsed = serverSchema.safeParse({
  DATABASE_URL: read("DATABASE_URL"),
  CLERK_SECRET_KEY: read("CLERK_SECRET_KEY"),
  CLERK_WEBHOOK_SECRET: read("CLERK_WEBHOOK_SECRET"),
  EMAIL_USER: read("EMAIL_USER"),
  EMAIL_PASSWORD: read("EMAIL_PASSWORD"),
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid server environment:\n${issues}`);
}

export const env = parsed.data;

/** True when SMTP credentials are configured; email sending is optional. */
export const isEmailConfigured = Boolean(env.EMAIL_USER && env.EMAIL_PASSWORD);
