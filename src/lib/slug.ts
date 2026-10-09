import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generates a URL-friendly slug from text.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ensures a slug is unique within a specified Supabase table.
 * If the base slug already exists, automatically generates suffixes:
 * 'my-slug', 'my-slug-2', 'my-slug-3', etc.
 * If an excludeId is provided (e.g. during an update), that record's own slug is permitted.
 */
export async function resolveUniqueSlug(
  client: SupabaseClient,
  table: "projects" | "properties",
  baseText: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(baseText) || "item";
  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    let query = client
      .from(table)
      .select("id")
      .eq("slug", candidateSlug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.maybeSingle();

    // If query fails or no record with candidate slug exists, candidate is safe to use
    if (error || !data) {
      return candidateSlug;
    }

    counter++;
    candidateSlug = `${baseSlug}-${counter}`;

    // Safety limit to prevent infinite loops in unexpected edge cases
    if (counter > 100) {
      return `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
    }
  }
}
