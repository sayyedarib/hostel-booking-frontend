import { absoluteUrl, siteConfig, siteUrl } from "@/config/site";

/**
 * schema.org builders. Each returns a plain object so it can be rendered by
 * `<JsonLd />` or unit-tested without a DOM.
 */

const postalAddress = () => ({
  "@type": "PostalAddress",
  streetAddress: siteConfig.contact.address.street,
  addressLocality: siteConfig.contact.address.locality,
  addressRegion: siteConfig.contact.address.region,
  postalCode: siteConfig.contact.address.postalCode,
  addressCountry: siteConfig.contact.address.country,
});

/**
 * The business itself. `LodgingBusiness` is the closest schema.org type for a
 * hostel/PG and unlocks rich results for local accommodation searches.
 */
export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": `${siteUrl}/#organization`,
  name: siteConfig.legalName,
  alternateName: siteConfig.name,
  url: siteUrl,
  description: siteConfig.description,
  email: siteConfig.contact.email,
  telephone: siteConfig.contact.phone,
  address: postalAddress(),
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.contact.geo.latitude,
    longitude: siteConfig.contact.geo.longitude,
  },
  priceRange: `${siteConfig.pricing.currency} ${siteConfig.pricing.monthlyFrom}+ / month`,
  areaServed: "Aligarh, Uttar Pradesh, India",
  amenityFeature: [
    "Free Wi-Fi",
    "24/7 Electricity Backup",
    "CCTV Surveillance",
    "In-house Meals",
    "Purified Drinking Water",
    "Laundry Service",
    "Dedicated Study Space",
    "Parking",
  ].map((name) => ({
    "@type": "LocationFeatureSpecification",
    name,
    value: true,
  })),
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: siteConfig.name,
  description: siteConfig.description,
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: "en-IN",
});

export const breadcrumbSchema = (
  trail: ReadonlyArray<{ name: string; path: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

export const faqSchema = (
  faqs: ReadonlyArray<{ question: string; answer: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});
