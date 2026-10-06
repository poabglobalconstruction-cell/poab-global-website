import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function PUT(req: NextRequest) {
  try {
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

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    const { error } = await client
      .from("site_settings")
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
