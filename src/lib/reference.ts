import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generate concurrency-safe human readable reference codes.
 * Uses atomic PostgreSQL sequence function: generate_reference(prefix_param)
 * e.g., POAB-REQ-2026-0001, POAB-SELL-2026-0001, POAB-PROP-2026-0001
 */
export async function getNextReference(
  supabase: SupabaseClient | null,
  prefix: "POAB-REQ" | "POAB-SELL" | "POAB-PROP"
): Promise<string> {
  const currentYear = new Date().getFullYear();

  if (supabase) {
    const { data, error } = await supabase.rpc("generate_reference", {
      prefix_param: prefix,
    });

    if (error) {
      console.error(`[CRITICAL] Reference generator RPC failed for ${prefix}:`, error.message);
      throw new Error(`Reference sequence generation failed: ${error.message}`);
    }

    if (data && typeof data === "string") {
      return data;
    }
  }

  // Prevent false positive sequences in production or when Supabase is configured
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction || isConfigured) {
    throw new Error(
      "Database client is required to generate sequential references. Cannot proceed with unverified fallback."
    );
  }

  // Development-only fallback when running without any Supabase credentials
  const entropy = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${currentYear}-${entropy}`;
}
