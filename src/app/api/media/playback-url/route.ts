import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityType, videoId } = body;

    if (!entityType || !["project", "property"].includes(entityType)) {
      return NextResponse.json({ error: "Invalid entityType" }, { status: 400 });
    }

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json({ error: "Invalid videoId" }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    if (!admin) {
      return NextResponse.json({ error: "Database client unavailable" }, { status: 500 });
    }

    const session = await verifyAdminSession();
    const isAdmin = Boolean(session && ["admin", "super_admin"].includes(session.role));

    const videoTable = entityType === "project" ? "project_videos" : "property_videos";
    const bucketName = entityType === "project" ? "project-videos" : "property-videos";
    const parentTable = entityType === "project" ? "projects" : "properties";
    const foreignKey = entityType === "project" ? "project_id" : "property_id";

    // 1. Fetch video record
    const { data: videoRecord, error: vidErr } = await admin
      .from(videoTable)
      .select("*")
      .eq("id", videoId)
      .single();

    if (vidErr || !videoRecord) {
      return NextResponse.json({ error: "Video record not found" }, { status: 404 });
    }

    // 2. Security Check: If not an active admin, enforce strict public visibility rules
    if (!isAdmin) {
      if (!videoRecord.is_published) {
        return NextResponse.json(
          { error: "Access denied: This video is hidden from public display." },
          { status: 403 }
        );
      }

      // Check parent entity publication status
      const parentId = videoRecord[foreignKey];
      const { data: parentEntity, error: parentErr } = await admin
        .from(parentTable)
        .select("id, published, archived_at")
        .eq("id", parentId)
        .single();

      if (parentErr || !parentEntity || !parentEntity.published || parentEntity.archived_at) {
        return NextResponse.json(
          { error: "Access denied: The associated project or property is unpublished or archived." },
          { status: 403 }
        );
      }
    }

    // 3. Generate short-lived signed playback URL (valid for 60 minutes = 3600 seconds)
    const { data: signedData, error: signErr } = await admin.storage
      .from(bucketName)
      .createSignedUrl(videoRecord.storage_path, 3600);

    if (signErr || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: `Failed to generate playback stream: ${signErr?.message || "Storage error"}` },
        { status: 500 }
      );
    }

    let signedPosterUrl: string | null = null;
    if (videoRecord.thumbnail_path) {
      const { data: posterData } = await admin.storage
        .from(bucketName)
        .createSignedUrl(videoRecord.thumbnail_path, 3600);
      signedPosterUrl = posterData?.signedUrl || null;
    }

    return NextResponse.json({
      success: true,
      signedUrl: signedData.signedUrl,
      posterUrl: signedPosterUrl,
      title: videoRecord.title,
      caption: videoRecord.caption,
      duration_seconds: videoRecord.duration_seconds,
      file_size_bytes: videoRecord.file_size_bytes,
      mime_type: videoRecord.mime_type,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error generating playback authorization";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
