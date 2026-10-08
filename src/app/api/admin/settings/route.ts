import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/supabase/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Unauthorized: Active administrator privileges required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json({ error: "Missing setting key or value" }, { status: 400 });
    }

    // Company info & CAC are protected from accidental casual edits (Section 34)
    if (key === "company_info") {
      return NextResponse.json(
        { error: "Legal corporate identity settings are locked." },
        { status: 403 }
      );
    }

    // Server-side validation for contact_channels
    if (key === "contact_channels") {
      if (typeof value !== "object" || value === null) {
        return NextResponse.json({ error: "Invalid contact channels data" }, { status: 400 });
      }
      if (value.official_email) {
        const emailTrimmed = String(value.official_email).trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
          return NextResponse.json({ error: "Invalid email format for official_email" }, { status: 400 });
        }
      }
    }

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    // Preserve unrelated values by merging with existing record if present
    let finalValue = value;
    if (typeof value === "object" && value !== null) {
      const { data: existing } = await client
        .from("site_settings")
        .select("value")
        .eq("key", key)
        .single();

      if (existing && typeof existing.value === "object" && existing.value !== null) {
        finalValue = { ...existing.value, ...value };
      }
    }

    const { error } = await client
      .from("site_settings")
      .upsert({
        key,
        value: finalValue,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Revalidate caches so public pages reflect changes immediately
    try {
      revalidateTag("contact-channels");
      revalidateTag("site-settings");
      revalidatePath("/", "layout");
      revalidatePath("/contact", "page");
    } catch (revalErr) {
      console.warn("[SETTINGS] Cache revalidation warning:", revalErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
