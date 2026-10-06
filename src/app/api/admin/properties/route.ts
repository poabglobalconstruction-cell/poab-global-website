import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getNextReference } from "@/lib/reference";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    const reference = await getNextReference(client, "POAB-PROP");

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const { data, error } = await client
      .from("properties")
      .insert({
        reference,
        title: body.title,
        slug,
        property_type: body.property_type || "Land",
        location: body.location,
        price: body.price ? Number(body.price) : null,
        price_public: Boolean(body.price_public),
        bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
        size: body.size || null,
        description: body.description,
        features: Array.isArray(body.features) ? body.features : [],
        status: body.status || "Available",
        featured: Boolean(body.featured),
        published: Boolean(body.published),
      })
      .select("id, slug")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/");
    revalidatePath("/properties");

    return NextResponse.json({ success: true, property: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating property";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing property ID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    // Critical fix: If publishing is enabled, ensure archived_at is cleared
    if (updates.published) {
      updates.archived_at = null;
    }

    const { error } = await client
      .from("properties")
      .update({
        ...updates,
        price: updates.price ? Number(updates.price) : null,
        bedrooms: updates.bedrooms ? Number(updates.bedrooms) : null,
        bathrooms: updates.bathrooms ? Number(updates.bathrooms) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/");
    revalidatePath("/properties");
    if (updates.slug) {
      revalidatePath(`/properties/${updates.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating property";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing property ID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    // Soft archive (Section 63)
    const { data: archivedProperty, error } = await client
      .from("properties")
      .update({
        archived_at: new Date().toISOString(),
        published: false,
      })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/");
    revalidatePath("/properties");
    if (archivedProperty?.slug) {
      revalidatePath(`/properties/${archivedProperty.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error archiving property";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
