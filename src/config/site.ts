/**
 * Single source of truth for site-wide identity, contact details and SEO
 * defaults. Anything that appears in metadata, structured data, the sitemap or
 * the footer should be read from here rather than hard-coded at the call site.
 */

const DEFAULT_SITE_URL = "https://www.aligarhhostel.com";

/**
 * Public base URL of the deployment. Falls back to the production domain so
 * that metadata, canonicals and the sitemap stay correct even when the env var
 * is missing (e.g. in CI or a preview build).
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.NEXT_PUBLIC_FRONTEND_URL ??
  DEFAULT_SITE_URL
).replace(/\/$/, "");

export const siteConfig = {
  name: "Khan Group of PG",
  shortName: "Khan Group of PG",
  legalName: "Khan Group of PG and Hostels (Boys & Girls)",
  url: siteUrl,
  description:
    "Affordable hostel and PG accommodation in Aligarh for students and professionals. Furnished rooms, in-house meals, 24/7 power and security, and a study-focused environment near AMU.",
  tagline: "A home away from home for students in Aligarh",
  locale: "en_IN",
  contact: {
    email: "support@aligarhhostel.com",
    phone: "+91 879147673",
    address: {
      street:
        "Campus View Apartment, Near Sultan Jahan Coaching Center, beside Wings Academy, Shamshad Market",
      locality: "Aligarh",
      region: "Uttar Pradesh",
      postalCode: "202002",
      country: "IN",
    },
    geo: { latitude: 27.9116922, longitude: 78.0676126 },
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3525.6832432481247!2d78.06761257621882!3d27.911692216447786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974a541ade61277%3A0xfce35e0d6df25523!2sKHAN%20GROUP%20OF%20PG%20(Boys%20%26%20Girls)!5e0!3m2!1sen!2sin!4v1721985887604!5m2!1sen!2sin",
  },
  /** Indicative pricing used for structured data and marketing copy. */
  pricing: { currency: "INR", monthlyFrom: 4500, dailyFrom: 300 },
  keywords: [
    "hostel in Aligarh",
    "PG in Aligarh",
    "AMU hostel",
    "boys hostel Aligarh",
    "girls hostel Aligarh",
    "student accommodation Aligarh",
    "guest house in Aligarh",
    "cheap hostel Aligarh",
  ],
} as const;

/** Builds an absolute URL from a root-relative path. */
export const absoluteUrl = (path = "/") =>
  `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

export type SiteConfig = typeof siteConfig;
