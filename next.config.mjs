/**
 * Derives the Supabase storage hostname from the environment rather than
 * hard-coding one project ref, so a different Supabase project (a staging one,
 * or a fork) does not silently break every room image.
 */
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

/**
 * Sent on every response. `frame-ancestors` is set instead of X-Frame-Options
 * because the app embeds a Google Maps iframe of its own, which a blanket
 * DENY would not affect but which makes the intent worth stating explicitly.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // AVIF first, WebP as the fallback: both are far smaller than the source
    // JPEGs these rooms are photographed in.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https", hostname: supabaseHost, pathname: "/**" }]
        : []),
      { protocol: "https", hostname: "img.clerk.com", pathname: "/**" },
    ],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
