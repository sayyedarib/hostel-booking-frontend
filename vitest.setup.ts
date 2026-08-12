import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Env vars that server-only modules validate at import time.
process.env.DATABASE_URL ??= "postgresql://user:pass@localhost:5432/test";
process.env.CLERK_SECRET_KEY ??= "sk_test_dummy";
process.env.NEXT_PUBLIC_APP_URL ??= "https://www.aligarhhostel.com";

// `server-only` throws when imported outside a React Server Component; tests
// exercise those modules directly, so it is stubbed out.
vi.mock("server-only", () => ({}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
