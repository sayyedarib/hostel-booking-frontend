import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clientIp, escapeHtml, rateLimit } from "./rate-limit";

describe("escapeHtml", () => {
  // The contact form interpolated submitted text straight into email HTML.
  it("neutralises tags so submitted markup cannot render in the email", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
  });

  it("escapes the ampersand first so entities are not double-broken", () => {
    expect(escapeHtml("Tom & Jerry <b>")).toBe("Tom &amp; Jerry &lt;b&gt;");
  });

  it("escapes both quote styles", () => {
    expect(escapeHtml(`"quoted" and 'single'`)).toBe(
      "&quot;quoted&quot; and &#39;single&#39;",
    );
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeHtml("Room D2-105, 2 beds")).toBe("Room D2-105, 2 beds");
  });
});

describe("rateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const call = (key: string) => rateLimit({ key, limit: 3, windowMs: 60_000 });

  it("allows requests up to the limit", () => {
    const key = `test-${Math.random()}`;
    expect(call(key).allowed).toBe(true);
    expect(call(key).allowed).toBe(true);
    expect(call(key).allowed).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const key = `test-${Math.random()}`;
    call(key);
    call(key);
    call(key);
    const blocked = call(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks each key independently", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    call(a);
    call(a);
    call(a);
    expect(call(a).allowed).toBe(false);
    expect(call(b).allowed).toBe(true);
  });

  it("lets the caller through again once the window has passed", () => {
    const key = `test-${Math.random()}`;
    call(key);
    call(key);
    call(key);
    expect(call(key).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(call(key).allowed).toBe(true);
  });
});

describe("clientIp", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://example.com", { headers });

  it("takes the first address from x-forwarded-for", () => {
    expect(clientIp(req({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" }))).toBe(
      "203.0.113.5",
    );
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(req({ "x-real-ip": "198.51.100.7" }))).toBe("198.51.100.7");
  });

  it("returns 'unknown' when neither header is present", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });
});
