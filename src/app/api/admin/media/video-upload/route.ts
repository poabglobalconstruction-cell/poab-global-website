import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  generateEntityVideoPath,
  MAX_VIDEO_FILE_SIZE_BYTES,
  isPathJailedToEntity,
} from "@/lib/video-upload";

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
    const { entityType, entityId, extension = "mp4", fileSizeBytes } = body;

    if (!entityType || !["project", "property"].includes(entityType)) {
      return NextResponse.json(
        { error: "Invalid entityType. Must be 'project' or 'property'." },
        { status: 400 }
      );
    }

    if (!entityId || typeof entityId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing entityId." },
        { status: 400 }
      );
    }

    if (typeof fileSizeBytes === "number" && fileSizeBytes > MAX_VIDEO_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds strict 50.0 MB limit (${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB).` },
        { status: 400 }
      );
    }

    const admin = createAdminSupabaseClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Database client unavailable on server." },
        { status: 500 }
      );
    }

    // Verify entity existence
    const table = entityType === "project" ? "projects" : "properties";
    const { data: entity, error: entityErr } = await admin
      .from(table)
      .select("id")
      .eq("id", entityId)
      .single();

    if (entityErr || !entity) {
      return NextResponse.json(
        { error: `Target ${entityType} record not found.` },
        { status: 404 }
      );
    }

    // Generate entity-jailed paths
    const { videoId, videoPath, posterPath } = generateEntityVideoPath(
      entityType,
      entityId,
      extension
    );

    if (
      !isPathJailedToEntity(entityType, entityId, videoPath) ||
      !isPathJailedToEntity(entityType, entityId, posterPath)
    ) {
      return NextResponse.json(
        { error: "Directory traversal rejected: path must be strictly jailed to entity folder." },
        { status: 403 }
      );
    }

    const bucketName = entityType === "project" ? "project-videos" : "property-videos";

    // Generate short-lived signed upload URLs (valid for 15 minutes)
    const { data: videoUpload, error: videoUploadErr } = await admin.storage
      .from(bucketName)
      .createSignedUploadUrl(videoPath);

    if (videoUploadErr || !videoUpload) {
      return NextResponse.json(
        { error: `Failed to create signed upload URL: ${videoUploadErr?.message || "Storage error"}` },
        { status: 500 }
      );
    }

    const { data: posterUpload, error: posterUploadErr } = await admin.storage
      .from(bucketName)
      .createSignedUploadUrl(posterPath);

    return NextResponse.json({
      success: true,
      videoId,
      bucketName,
      videoPath,
      posterPath,
      videoUploadUrl: videoUpload.signedUrl,
      videoToken: videoUpload.token,
      posterUploadUrl: posterUpload?.signedUrl || null,
      posterToken: posterUpload?.token || null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating video upload authorization";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
