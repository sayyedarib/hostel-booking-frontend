import { describe, expect, it } from "vitest";

import { faqs } from "@/config/faq";
import { publicRoutes, disallowedRoutes } from "@/config/routes";
import { siteConfig, absoluteUrl } from "@/config/site";
import {
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  websiteSchema,
} from "./structured-data";

describe("absoluteUrl", () => {
  it("builds an absolute URL from a root-relative path", () => {
    expect(absoluteUrl("/rooms")).toBe(`${siteConfig.url}/rooms`);
  });

  it("tolerates a missing leading slash", () => {
    expect(absoluteUrl("rooms")).toBe(`${siteConfig.url}/rooms`);
  });

  it("defaults to the site root", () => {
    expect(absoluteUrl()).toBe(`${siteConfig.url}/`);
  });

  it("never produces a double slash", () => {
    expect(absoluteUrl("/rooms")).not.toMatch(/[^:]\/\//);
  });
});

describe("organizationSchema", () => {
  const schema = organizationSchema() as Record<string, any>;

  it("declares a LodgingBusiness with a stable @id", () => {
    expect(schema["@type"]).toBe("LodgingBusiness");
    expect(schema["@id"]).toBe(`${siteConfig.url}/#organization`);
  });

  it("carries the address and geo coordinates Google needs for local results", () => {
    expect(schema.address.addressLocality).toBe("Aligarh");
    expect(schema.address.postalCode).toBe("202002");
    expect(schema.geo.latitude).toBeCloseTo(27.91, 1);
    expect(schema.geo.longitude).toBeCloseTo(78.07, 1);
  });
});

describe("websiteSchema", () => {
  it("links the publisher to the organization node", () => {
    const schema = websiteSchema() as Record<string, any>;
    expect(schema.publisher["@id"]).toBe(organizationSchema()["@id"]);
  });
});

describe("faqSchema", () => {
  it("maps every FAQ to a Question with an answer", () => {
    const schema = faqSchema(faqs) as Record<string, any>;
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(faqs.length);
    for (const entry of schema.mainEntity) {
      expect(entry["@type"]).toBe("Question");
      expect(entry.acceptedAnswer.text.length).toBeGreaterThan(0);
    }
  });
});

describe("breadcrumbSchema", () => {
  it("numbers positions from 1 and resolves absolute URLs", () => {
    const schema = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Rooms", path: "/rooms" },
    ]) as Record<string, any>;

    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[1].item).toBe(`${siteConfig.url}/rooms`);
  });
});

describe("route config", () => {
  it("never lists a route as both crawlable and disallowed", () => {
    for (const route of publicRoutes) {
      expect(disallowedRoutes).not.toContain(route.path);
    }
  });

  it("keeps sitemap priorities within the valid 0–1 range", () => {
    for (const route of publicRoutes) {
      expect(route.priority).toBeGreaterThanOrEqual(0);
      expect(route.priority).toBeLessThanOrEqual(1);
    }
  });

  it("has no duplicate paths", () => {
    const paths = publicRoutes.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("blocks every authenticated and transactional area from crawlers", () => {
    for (const path of ["/admin-dashboard", "/user", "/cart", "/api"]) {
      expect(disallowedRoutes).toContain(path);
    }
  });
});
