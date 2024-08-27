import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://aligarhhostel.com/seo",
      lastModified: "2024-08-27",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://aligarhhostel.com",
      lastModified: "2024-08-27",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://aligarhhostel.com/rooms",
      lastModified: "2024-08-27",
      changeFrequency: "weekly",
      priority: 0,
    },
    {
      url: "https://aligarhhostel.com/cart",
      lastModified: "2024-08-27",
      changeFrequency: "weekly",
      priority: 0,
    },
    {
      url: "https://aligarhhostel.com/agreement-checkout",
      lastModified: "2024-08-27",
      changeFrequency: "weekly",
      priority: 0,
    },
    {
      url: "https://aligarhhostel.com/contact",
      lastModified: "2024-08-27",
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: "https://aligarhhostel.com/about",
      lastModified: "2024-08-27",
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
