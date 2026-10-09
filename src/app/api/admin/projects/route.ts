import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/supabase/auth";

import { resolveUniqueSlug } from "@/lib/slug";

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

    // Resolve unique slug safely without manual collision errors
    const slug = await resolveUniqueSlug(
      client,
      "projects",
      body.slug || body.title
    );

    const { data, error } = await client
      .from("projects")
      .insert({
        title: body.title,
        slug,
        location: body.location,
        project_type: body.project_type || "Residential",
        status: body.status || "Ongoing",
        scope: body.scope || null,
        short_description: body.short_description,
        description: body.description || null,
        cover_image_path: body.cover_image_path || null,
        featured: Boolean(body.featured),
        published: Boolean(body.published),
        start_date: body.start_date || null,
        completion_date: body.completion_date || null,
      })
      .select("id, slug")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If an initial construction stage was provided during creation, insert it
    if (body.initial_stage_title && typeof body.initial_stage_title === "string") {
      const stageTitle = body.initial_stage_title.trim();
      if (stageTitle) {
        await client.from("project_stages").insert({
          id: crypto.randomUUID(),
          project_id: data.id,
          title: stageTitle,
          description: body.initial_stage_description || null,
          stage_date: body.initial_stage_date || null,
          sort_order: 0,
        });
      }
    }

    // If initial project images were uploaded during creation, insert them
    if (Array.isArray(body.images) && body.images.length > 0) {
      const imagesToInsert = body.images.map((img: any, idx: number) => ({
        id: img.id && img.id.length === 36 ? img.id : crypto.randomUUID(),
        project_id: data.id,
        project_stage_id: img.project_stage_id || null,
        storage_path: img.storage_path,
        alt_text: img.alt_text || body.title,
        caption: img.caption || null,
        sort_order: typeof img.sort_order === "number" ? img.sort_order : idx,
        is_cover: Boolean(img.is_cover),
      }));
      const { error: imgError } = await client.from("project_images").insert(imagesToInsert);
      if (imgError) {
        console.error("Error inserting initial project images:", imgError);
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/projects");
    } catch {
      // Revalidation warning in test environments
    }

    return NextResponse.json({ success: true, project: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating project";
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
    const { id, stages, images, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    // Critical fix: If publishing is enabled or requested, ensure archived_at is cleared
    if (updates.published) {
      updates.archived_at = null;
    }

    const { error } = await client
      .from("projects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Persist construction stages if provided (Safe Upsert & Deletion of removed stages)
    if (Array.isArray(stages)) {
      const incomingIds = stages
        .map((s) => s.id)
        .filter((id) => id && !id.startsWith("temp-") && id.length === 36);

      // 1. Delete only stages that were removed by the admin
      if (incomingIds.length > 0) {
        await client
          .from("project_stages")
          .delete()
          .eq("project_id", id)
          .not("id", "in", `(${incomingIds.join(",")})`);
      } else {
        await client.from("project_stages").delete().eq("project_id", id);
      }

      // 2. Upsert stages to maintain stability of existing stage IDs
      if (stages.length > 0) {
        const stagesToUpsert = stages.map((s, idx) => ({
          id: s.id && !s.id.startsWith("temp-") && s.id.length === 36 ? s.id : crypto.randomUUID(),
          project_id: id,
          title: s.title,
          description: s.description || null,
          stage_date: s.stage_date || null,
          sort_order: typeof s.sort_order === "number" ? s.sort_order : idx,
          updated_at: new Date().toISOString(),
        }));
        const { error: stageError } = await client.from("project_stages").upsert(stagesToUpsert);
        if (stageError) {
          console.error("Error upserting project stages:", stageError);
        }
      }
    }

    // Persist project gallery and stage-associated images if provided
    if (Array.isArray(images)) {
      await client.from("project_images").delete().eq("project_id", id);
      if (images.length > 0) {
        const imagesToInsert = images.map((img, idx) => ({
          id: img.id && img.id.length === 36 ? img.id : crypto.randomUUID(),
          project_id: id,
          project_stage_id: img.project_stage_id || null,
          storage_path: img.storage_path,
          alt_text: img.alt_text || "",
          caption: img.caption || null,
          sort_order: typeof img.sort_order === "number" ? img.sort_order : idx,
          is_cover: Boolean(img.is_cover),
        }));
        const { error: imgError } = await client.from("project_images").insert(imagesToInsert);
        if (imgError) {
          console.error("Error persisting project images:", imgError);
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/projects");
    if (updates.slug) {
      revalidatePath(`/projects/${updates.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating project";
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
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    // 1. Verify project existence and retrieve assets
    const { data: project, error: fetchErr } = await client
      .from("projects")
      .select("id, title, slug, cover_image_path")
      .eq("id", id)
      .single();

    if (fetchErr || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Identify all storage images owned by this project
    const { data: imageRows } = await client
      .from("project_images")
      .select("storage_path")
      .eq("project_id", id);

    const storagePaths: string[] = [];
    if (project.cover_image_path) {
      storagePaths.push(project.cover_image_path);
    }
    if (imageRows && imageRows.length > 0) {
      imageRows.forEach((r) => {
        if (r.storage_path && !storagePaths.includes(r.storage_path)) {
          storagePaths.push(r.storage_path);
        }
      });
    }

    // 3. Remove files from Supabase Storage bucket
    if (storagePaths.length > 0) {
      try {
        const { error: storageErr } = await client.storage
          .from("project-images")
          .remove(storagePaths);
        if (storageErr) {
          console.warn("Storage deletion warning for project:", storageErr.message);
        }
      } catch (storageCatch) {
        console.warn("Storage deletion error for project:", storageCatch);
      }
    }

    // 4. Permanently delete project record (cascades to project_stages and project_images)
    const { error: deleteErr } = await client
      .from("projects")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 400 });
    }

    // 5. Revalidate public cache
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/sitemap.xml");
    if (project.slug) {
      revalidatePath(`/projects/${project.slug}`);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting project";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
