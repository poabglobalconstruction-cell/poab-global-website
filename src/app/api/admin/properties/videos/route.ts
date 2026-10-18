import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    if (!admin) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    const { data: videos, error } = await admin
      .from("property_videos")
      .select("*")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ videos: [] });
    }

    // Attach short-lived preview signed URLs for admin portal inspection
    const enrichedVideos = await Promise.all(
      (videos || []).map(async (v) => {
        let signedPlaybackUrl: string | null = null;
        let signedThumbnailUrl: string | null = null;

        if (v.storage_path) {
          const { data } = await admin.storage
            .from("property-videos")
            .createSignedUrl(v.storage_path, 3600);
          signedPlaybackUrl = data?.signedUrl || null;
        }

        if (v.thumbnail_path) {
          const { data } = await admin.storage
            .from("property-videos")
            .createSignedUrl(v.thumbnail_path, 3600);
          signedThumbnailUrl = data?.signedUrl || null;
        }

        return {
          ...v,
          signed_playback_url: signedPlaybackUrl,
          signed_thumbnail_url: signedThumbnailUrl,
        };
      })
    );

    return NextResponse.json({ videos: enrichedVideos });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching property videos";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      property_id,
      storage_path,
      thumbnail_path,
      title,
      caption,
      duration_seconds,
      file_size_bytes,
      mime_type = "video/mp4",
      sort_order = 0,
      is_published = true,
    } = body;

    if (!property_id || !storage_path || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    if (!admin) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    const newVideo = {
      property_id,
      storage_path,
      thumbnail_path: thumbnail_path || null,
      title: title.trim(),
      caption: caption ? caption.trim() : null,
      duration_seconds: duration_seconds ? Math.round(duration_seconds) : null,
      file_size_bytes: file_size_bytes || 0,
      mime_type,
      sort_order,
      is_published: Boolean(is_published),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from("property_videos")
      .insert(newVideo)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/properties");
    return NextResponse.json({ success: true, video: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error attaching property video";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, videos } = body;

    const admin = createAdminSupabaseClient();
    if (!admin) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    // Bulk reorder or update
    if (Array.isArray(videos)) {
      for (const v of videos) {
        if (v.id) {
          await admin
            .from("property_videos")
            .update({
              sort_order: v.sort_order,
              is_published: v.is_published,
              title: v.title,
              caption: v.caption,
              updated_at: new Date().toISOString(),
            })
            .eq("id", v.id);
        }
      }
      revalidatePath("/properties");
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    const { error } = await admin
      .from("property_videos")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath("/properties");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating property video";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const bulkAll = searchParams.get("bulkAll") === "true";
    const propertyId = searchParams.get("propertyId");

    const admin = createAdminSupabaseClient();
    if (!admin) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    // Bulk removal: Remove all videos for a given property (NEVER deletes the property itself)
    if (bulkAll && propertyId) {
      const { data: allVideos } = await admin
        .from("property_videos")
        .select("id, storage_path, thumbnail_path")
        .eq("property_id", propertyId);

      if (allVideos && allVideos.length > 0) {
        const filesToPurge: string[] = [];
        allVideos.forEach((v) => {
          if (v.storage_path) filesToPurge.push(v.storage_path);
          if (v.thumbnail_path) filesToPurge.push(v.thumbnail_path);
        });

        if (filesToPurge.length > 0) {
          try {
            await admin.storage.from("property-videos").remove(filesToPurge);
          } catch (storageErr) {
            console.warn("Storage bulk purge error:", storageErr);
          }
        }

        await admin.from("property_videos").delete().eq("property_id", propertyId);
      }

      revalidatePath("/properties");
      return NextResponse.json({ success: true, count: allVideos?.length || 0 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    // 1. Fetch single video record
    const { data: video, error: fetchErr } = await admin
      .from("property_videos")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !video) {
      return NextResponse.json({ error: "Video record not found" }, { status: 404 });
    }

    // 2. Storage Purge
    const pathsToRemove: string[] = [];
    if (video.storage_path) pathsToRemove.push(video.storage_path);
    if (video.thumbnail_path) pathsToRemove.push(video.thumbnail_path);

    let storagePurgeFailed = false;
    let storageErrorMsg: string | null = null;

    if (pathsToRemove.length > 0) {
      try {
        const { error: storageErr } = await admin.storage
          .from("property-videos")
          .remove(pathsToRemove);

        if (storageErr) {
          storagePurgeFailed = true;
          storageErrorMsg = storageErr.message;
        }
      } catch (err: unknown) {
        storagePurgeFailed = true;
        storageErrorMsg = err instanceof Error ? err.message : "Network error during storage purge";
      }
    }

    // 3. Deletion Reconciliation:
    if (storagePurgeFailed) {
      await admin
        .from("property_videos")
        .update({
          purge_failed: true,
          purge_error: storageErrorMsg,
          is_published: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return NextResponse.json(
        {
          success: false,
          purge_failed: true,
          error: `Storage cleanup encountered an error: ${storageErrorMsg}. Flagged for retry.`,
        },
        { status: 502 }
      );
    }

    // 4. Permanent DB record removal
    const { error: dbDeleteErr } = await admin
      .from("property_videos")
      .delete()
      .eq("id", id);

    if (dbDeleteErr) {
      return NextResponse.json({ error: dbDeleteErr.message }, { status: 400 });
    }

    revalidatePath("/properties");
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting property video";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
