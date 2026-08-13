import type { MetadataRoute } from "next";

import { disallowedRoutes, publicRoutes } from "@/config/routes";
import { absoluteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: publicRoutes.map((route) => route.path),
      // A bare prefix already covers the route and everything nested under it.
      disallow: [...disallowedRoutes],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
