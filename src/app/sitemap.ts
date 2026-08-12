import type { MetadataRoute } from "next";

import { publicRoutes } from "@/config/routes";
import { absoluteUrl } from "@/config/site";

/**
 * Only crawlable marketing pages belong here. Authenticated and transactional
 * routes are excluded via `publicRoutes` and blocked in robots.txt, so they no
 * longer appear with a priority of 0 as they previously did.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
