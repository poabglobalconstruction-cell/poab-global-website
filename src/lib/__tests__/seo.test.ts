import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOrganizationSchema, getWebsiteSchema, getBreadcrumbSchema } from "@/lib/seo/schema";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { metadata as rootMetadata } from "@/app/layout";
import { metadata as aboutMetadata } from "@/app/(public)/about/page";
import { metadata as servicesMetadata } from "@/app/(public)/services/page";
import { metadata as projectsMetadata } from "@/app/(public)/projects/page";
import { metadata as contactMetadata } from "@/app/(public)/contact/page";
import { metadata as quoteMetadata } from "@/app/(public)/request-quote/page";
import { metadata as sellMetadata } from "@/app/(public)/sell-property/page";
import { metadata as propertiesMetadata } from "@/app/(public)/properties/page";
import { metadata as privacyMetadata } from "@/app/(public)/privacy/page";
import { SITE_URL, COMPANY_INFO } from "@/lib/constants";

describe("SEO Suite - Technical, Structured Data & Metadata Integrity", () => {
  describe("1. Structured Data JSON-LD Schemas", () => {
    it("generates valid Organization and GeneralContractor schema with accurate verified details", () => {
      const org = getOrganizationSchema();
      expect(org["@context"]).toBe("https://schema.org");
      expect(org["@type"]).toContain("GeneralContractor");
      expect(org["@type"]).toContain("Organization");
      expect(org.name).toBe(COMPANY_INFO.name);
      expect(org.taxID).toBe(COMPANY_INFO.rcNumber);
      expect(org.email).toBe(COMPANY_INFO.officialEmail);
      expect(org.url).toBe(SITE_URL);

      // Address must be verified Ibadan HQ
      expect(org.address).toEqual({
        "@type": "PostalAddress",
        addressLocality: "Ibadan",
        addressRegion: "Oyo State",
        addressCountry: "NG",
      });

      // Founder must be Oriowo Abiola Idris
      expect(org.founder).toEqual({
        "@type": "Person",
        name: "Oriowo Abiola Idris",
        jobTitle: "Founder & CEO",
        description: expect.stringContaining("11 years"),
      });

      // Area served must cover key Nigerian locations
      const areas = (org.areaServed as Array<{ name: string }>).map((a) => a.name);
      expect(areas).toContain("Ibadan");
      expect(areas).toContain("Oyo State");
      expect(areas).toContain("Lagos");
      expect(areas).toContain("Nigeria");

      // Must not contain fabricated review aggregates or ratings
      expect((org as Record<string, unknown>).aggregateRating).toBeUndefined();
      expect((org as Record<string, unknown>).review).toBeUndefined();

      // Must not contain em dashes
      const jsonString = JSON.stringify(org);
      expect(jsonString).not.toContain("—");
    });

    it("generates valid WebSite schema", () => {
      const site = getWebsiteSchema();
      expect(site["@context"]).toBe("https://schema.org");
      expect(site["@type"]).toBe("WebSite");
      expect(site.url).toBe(SITE_URL);
      expect(site.name).toBe(COMPANY_INFO.name);
      expect(site.publisher).toEqual({
        "@id": `${SITE_URL}/#organization`,
      });
    });

    it("generates correct BreadcrumbList schema", () => {
      const crumbs = getBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
      ]);
      expect(crumbs["@context"]).toBe("https://schema.org");
      expect(crumbs["@type"]).toBe("BreadcrumbList");
      expect(crumbs.itemListElement).toHaveLength(2);
      expect(crumbs.itemListElement[0]).toEqual({
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      });
      expect(crumbs.itemListElement[1]).toEqual({
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${SITE_URL}/services`,
      });
    });
  });

  describe("2. Robots.txt Directives", () => {
    it("allows public crawling while disallowing admin and api paths", () => {
      const robotsConfig = robots();
      const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;
      expect(rules).toBeDefined();
      expect(rules?.allow).toBe("/");
      expect(rules?.disallow).toContain("/admin/");
      expect(rules?.disallow).toContain("/api/");
      expect(robotsConfig.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    });
  });

  describe("3. XML Sitemap Generation", () => {
    it("includes all essential static routes with valid priorities and timestamps", async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      expect(urls).toContain(`${SITE_URL}`);
      expect(urls).toContain(`${SITE_URL}/about`);
      expect(urls).toContain(`${SITE_URL}/services`);
      expect(urls).toContain(`${SITE_URL}/projects`);
      expect(urls).toContain(`${SITE_URL}/properties`);
      expect(urls).toContain(`${SITE_URL}/request-quote`);
      expect(urls).toContain(`${SITE_URL}/sell-property`);
      expect(urls).toContain(`${SITE_URL}/contact`);
      expect(urls).toContain(`${SITE_URL}/privacy`);

      // Verify every entry has valid properties
      for (const entry of entries) {
        expect(entry.url).toMatch(/^https:\/\/www\.poabglobalconstruction\.com/);
        expect(entry.lastModified).toBeInstanceOf(Date);
        expect(entry.priority).toBeGreaterThanOrEqual(0.1);
        expect(entry.priority).toBeLessThanOrEqual(1.0);
      }
    });
  });

  describe("4. Page Metadata & OpenGraph Consistency", () => {
    it("verifies root metadata defines canonical, openGraph, twitter and search bot directives", () => {
      expect(rootMetadata.alternates?.canonical).toBe("/");
      const og = rootMetadata.openGraph as Record<string, unknown> | undefined;
      expect(og?.type).toBe("website");
      expect(og?.locale).toBe("en_NG");
      const tw = rootMetadata.twitter as Record<string, unknown> | undefined;
      expect(tw?.card).toBe("summary_large_image");
      expect(rootMetadata.robots).toMatchObject({
        index: true,
        follow: true,
      });
    });

    it("verifies specific public routes have approved absolute titles and descriptions", () => {
      // About Page
      expect((aboutMetadata.title as { absolute: string }).absolute).toBe(
        "About POAB Global Construction | Building Expertise in Nigeria"
      );
      expect(aboutMetadata.description).toContain("Oriowo Abiola Idris");
      expect(aboutMetadata.alternates?.canonical).toBe("/about");

      // Services Page
      expect((servicesMetadata.title as { absolute: string }).absolute).toBe(
        "Building Construction & Renovation Services | POAB Global"
      );
      expect(servicesMetadata.alternates?.canonical).toBe("/services");

      // Projects Page
      expect((projectsMetadata.title as { absolute: string }).absolute).toBe(
        "Construction Projects in Nigeria | POAB Global"
      );
      expect(projectsMetadata.alternates?.canonical).toBe("/projects");

      // Contact Page
      expect((contactMetadata.title as { absolute: string }).absolute).toBe(
        "Contact POAB Global Construction | Request a Building Quote"
      );
      expect(contactMetadata.alternates?.canonical).toBe("/contact");

      // Quote Page
      expect((quoteMetadata.title as { absolute: string }).absolute).toBe(
        "Request a Construction Quote | POAB Global"
      );
      expect(quoteMetadata.alternates?.canonical).toBe("/request-quote");

      // Sell Property Page
      expect((sellMetadata.title as { absolute: string }).absolute).toBe(
        "Sell Property or Land Through POAB | POAB Global"
      );
      expect(sellMetadata.alternates?.canonical).toBe("/sell-property");

      // Properties Page
      expect((propertiesMetadata.title as { absolute: string }).absolute).toBe(
        "Properties & Land for Sale in Nigeria | POAB Global"
      );
      expect(propertiesMetadata.alternates?.canonical).toBe("/properties");

      // Privacy Page
      expect((privacyMetadata.title as { absolute: string }).absolute).toBe(
        "Privacy Policy | POAB Global Construction"
      );
      expect(privacyMetadata.alternates?.canonical).toBe("/privacy");
    });

    it("ensures no metadata description contains em dashes", () => {
      const descriptions = [
        aboutMetadata.description,
        servicesMetadata.description,
        projectsMetadata.description,
        contactMetadata.description,
        quoteMetadata.description,
        sellMetadata.description,
        propertiesMetadata.description,
        privacyMetadata.description,
      ];

      for (const desc of descriptions) {
        expect(desc).toBeDefined();
        expect(desc).not.toContain("—");
      }
    });
  });
});
