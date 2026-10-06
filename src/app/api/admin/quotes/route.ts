import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, internal_notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing quote ID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    const { error } = await client
      .from("quote_requests")
      .update({
        status,
        internal_notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating quote";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
