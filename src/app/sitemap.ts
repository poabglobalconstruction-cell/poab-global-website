import { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/services",
    "/projects",
    "/properties",
    "/request-quote",
    "/sell-property",
    "/contact",
    "/privacy",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route === "/request-quote" ? 0.9 : 0.8,
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
