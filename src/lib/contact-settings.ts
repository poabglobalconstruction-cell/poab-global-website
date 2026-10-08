import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { COMPANY_INFO } from "@/lib/constants";

export interface PublicContactSettings {
  official_email: string;
  public_phone: string;
  whatsapp_number: string;
  office_address: string;
  business_hours: string;
}

export const DEFAULT_CONTACT_SETTINGS: PublicContactSettings = {
  official_email: "info@poabglobalconstruction.com",
  public_phone: "",
  whatsapp_number: "",
  office_address: COMPANY_INFO.headOffice, // "Ibadan, Oyo State, Nigeria"
  business_hours: "",
};

/**
 * Validates and sanitizes raw database settings against expected schema.
 * Replaces missing, corrupted, or invalid fields with safe code-level fallbacks.
 * Preserves intentionally empty optional fields without producing broken links.
 */
export function sanitizeContactSettings(raw: unknown): PublicContactSettings {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_CONTACT_SETTINGS };
  }

  const val = raw as Record<string, unknown>;

  // Email: must be non-empty valid email; fallback to safe default otherwise
  let officialEmail = DEFAULT_CONTACT_SETTINGS.official_email;
  if (typeof val.official_email === "string" && val.official_email.trim()) {
    const trimmed = val.official_email.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      officialEmail = trimmed;
    }
  }

  // Office Address: fallback to corporate head office if blank or invalid
  let officeAddress = DEFAULT_CONTACT_SETTINGS.office_address;
  if (typeof val.office_address === "string" && val.office_address.trim()) {
    officeAddress = val.office_address.trim();
  }

  // Optional phone: trim or empty string
  const publicPhone =
    typeof val.public_phone === "string" ? val.public_phone.trim() : "";

  // Optional WhatsApp: trim or empty string
  const whatsappNumber =
    typeof val.whatsapp_number === "string" ? val.whatsapp_number.trim() : "";

  // Optional operating hours: trim or empty string
  const businessHours =
    typeof val.business_hours === "string" ? val.business_hours.trim() : "";

  return {
    official_email: officialEmail,
    public_phone: publicPhone,
    whatsapp_number: whatsappNumber,
    office_address: officeAddress,
    business_hours: businessHours,
  };
}

/**
 * Server-only raw fetcher that reads site_settings.contact_channels from Supabase.
 * Uses public anonymous credentials (no service-role or cookies).
 * Returns safe fallback defaults on missing env, missing row, or transient error.
 */
export async function fetchRawContactSettings(
  customClient?: any
): Promise<PublicContactSettings> {
  try {
    let client = customClient;
    if (!client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anonKey) {
        return { ...DEFAULT_CONTACT_SETTINGS };
      }
      client = createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    const { data, error } = await client
      .from("site_settings")
      .select("value")
      .eq("key", "contact_channels")
      .single();

    if (error || !data) {
      return { ...DEFAULT_CONTACT_SETTINGS };
    }

    return sanitizeContactSettings(data.value);
  } catch (err) {
    console.warn("[SETTINGS] Failed to read contact channels from database:", err);
    return { ...DEFAULT_CONTACT_SETTINGS };
  }
}

// Next.js incremental cache wrapper with tags for on-demand revalidation
const cachedContactSettings = unstable_cache(
  async () => fetchRawContactSettings(),
  ["public-contact-settings"],
  {
    tags: ["contact-channels", "site-settings"],
    revalidate: 3600, // 1 hour background revalidation
  }
);

/**
 * Shared entry point for public components to retrieve authoritative contact settings.
 * Transparently falls back to direct raw fetch in non-Next environments (e.g. tests).
 */
export async function getPublicContactSettings(): Promise<PublicContactSettings> {
  if (process.env.NODE_ENV === "test") {
    return fetchRawContactSettings();
  }

  try {
    return await cachedContactSettings();
  } catch (err: any) {
    // Fall back to direct fetch if outside Next.js incrementalCache context
    return fetchRawContactSettings();
  }
}
