import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getNextReference } from "@/lib/reference";
import { verifyAdminSession } from "@/lib/supabase/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Unauthorized: Active administrator privileges required" },
        { status: 401 }
      );
    }

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
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Unauthorized: Active administrator privileges required" },
        { status: 401 }
      );
    }

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
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Unauthorized: Active administrator privileges required" },
        { status: 401 }
      );
    }

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

    // 1. Verify property existence and retrieve identity data
    const { data: propRow, error: fetchErr } = await client
      .from("properties")
      .select("id, title, reference, slug")
      .eq("id", id)
      .single();

    if (fetchErr || !propRow) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // 2. Protect customer property enquiries: check for linked leads
    const { data: linkedEnquiries, error: enqErr } = await client
      .from("property_enquiries")
      .select("id, internal_notes")
      .eq("property_id", id);

    if (enqErr) {
      return NextResponse.json({ error: enqErr.message }, { status: 400 });
    }

    if (linkedEnquiries && linkedEnquiries.length > 0) {
      // Attempt safe decoupling so customer leads are NOT destroyed
      const unlinkRes = await client
        .from("property_enquiries")
        .update({
          property_id: null,
          property_reference: propRow.reference,
          property_title: propRow.title,
        })
        .eq("property_id", id);

      if (unlinkRes.error) {
        // If DB schema constraint still enforces NOT NULL, DO NOT proceed with destructive cascade!
        // Return 409 Conflict with helpful guidance to protect customer lead history.
        return NextResponse.json(
          {
            error: `Cannot delete property: This listing is associated with ${linkedEnquiries.length} customer enquiry lead(s). To preserve customer history, please Archive this property instead, or apply database migration 20261007000001_safe_property_deletion.sql to decouple enquiries.`,
            enquiriesCount: linkedEnquiries.length,
          },
          { status: 409 }
        );
      }
    }

    // 3. Identify all storage images owned by this property
    const { data: imageRows } = await client
      .from("property_images")
      .select("storage_path")
      .eq("property_id", id);

    const storagePaths: string[] = [];
    if (imageRows && imageRows.length > 0) {
      imageRows.forEach((r) => {
        if (r.storage_path && !storagePaths.includes(r.storage_path)) {
          storagePaths.push(r.storage_path);
        }
      });
    }

    // 4. Remove files from Supabase Storage bucket
    if (storagePaths.length > 0) {
      try {
        const { error: storageErr } = await client.storage
          .from("property-images")
          .remove(storagePaths);
        if (storageErr) {
          console.warn("Storage deletion warning for property:", storageErr.message);
        }
      } catch (storageCatch) {
        console.warn("Storage deletion error for property:", storageCatch);
      }
    }

    // 5. Permanently delete property record from database
    const { error: deleteErr } = await client
      .from("properties")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 400 });
    }

    // 6. Revalidate public cache
    revalidatePath("/");
    revalidatePath("/properties");
    revalidatePath("/sitemap.xml");
    if (propRow.slug) {
      revalidatePath(`/properties/${propRow.slug}`);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting property";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
