import { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL;

  // Stable semantic modification date for core static pages
  const staticLastModified = new Date("2026-10-09T18:00:00.000Z");

  const staticRouteConfigs: { route: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
    { route: "", priority: 1.0, changeFrequency: "weekly" },
    { route: "/services", priority: 0.9, changeFrequency: "weekly" },
    { route: "/projects", priority: 0.9, changeFrequency: "weekly" },
    { route: "/request-quote", priority: 0.9, changeFrequency: "monthly" },
    { route: "/about", priority: 0.8, changeFrequency: "monthly" },
    { route: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { route: "/properties", priority: 0.8, changeFrequency: "weekly" },
    { route: "/sell-property", priority: 0.7, changeFrequency: "monthly" },
    { route: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticRouteConfigs.map((cfg) => ({
    url: `${siteUrl}${cfg.route}`,
    lastModified: staticLastModified,
    changeFrequency: cfg.changeFrequency,
    priority: cfg.priority,
  }));

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return staticRoutes;

    const [projectsRes, propertiesRes] = await Promise.all([
      supabase.from("projects").select("slug, updated_at").eq("published", true).is("archived_at", null),
      supabase.from("properties").select("slug, updated_at").eq("published", true).is("archived_at", null),
    ]);

    const projectUrls: MetadataRoute.Sitemap = (projectsRes.data || []).map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const propertyUrls: MetadataRoute.Sitemap = (propertiesRes.data || []).map((p) => ({
      url: `${siteUrl}/properties/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...projectUrls, ...propertyUrls];
  } catch {
    return staticRoutes;
  }
}
