import type { MetadataRoute } from "next";

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

export interface PublicRoute {
  path: string;
  /** Label used in the header/footer navigation. */
  label: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

/**
 * Routes that should be crawlable and listed in the sitemap. Adding a public
 * marketing page here is all that is needed for it to appear in the sitemap and
 * stay allowed in robots.txt.
 */
export const publicRoutes: PublicRoute[] = [
  { path: "/", label: "Home", priority: 1, changeFrequency: "weekly" },
  { path: "/rooms", label: "Rooms", priority: 0.9, changeFrequency: "daily" },
  {
    path: "/room-facilities",
    label: "Facilities",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    path: "/seo",
    label: "Rent & Amenities",
    priority: 0.8,
    changeFrequency: "monthly",
  },
  { path: "/about", label: "About", priority: 0.7, changeFrequency: "monthly" },
  {
    path: "/contact",
    label: "Contact",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    path: "/privacy-policy",
    label: "Privacy Policy",
    priority: 0.3,
    changeFrequency: "yearly",
  },
  {
    path: "/terms-of-service",
    label: "Terms of Service",
    priority: 0.3,
    changeFrequency: "yearly",
  },
];

/**
 * Routes that must never be indexed: authenticated areas, transactional steps
 * and anything that would expose per-user state to a crawler.
 */
export const disallowedRoutes = [
  "/admin-dashboard",
  "/user",
  "/cart",
  "/agreement-checkout",
  "/payment-confirmed",
  "/thanks",
  "/coming-soon",
  "/invoice",
  "/hostel-id",
  "/sign-in",
  "/sign-up",
  "/login",
  "/signup",
  "/confirm",
  "/api",
];

/** Primary navigation shown in the header menu. */
export const primaryNav = publicRoutes.filter((route) =>
  ["/rooms", "/room-facilities", "/about", "/contact"].includes(route.path),
);

/** Legal links shown in the footer. */
export const legalNav = publicRoutes.filter((route) =>
  ["/privacy-policy", "/terms-of-service"].includes(route.path),
);
