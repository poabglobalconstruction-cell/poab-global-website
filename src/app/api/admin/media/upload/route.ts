import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/supabase/auth";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB bucket limit

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Unauthorized: Active administrator privileges required" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null; // "project-images" | "property-images"
    const folder = (formData.get("folder") as string | null) || "gallery";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!bucket || (bucket !== "project-images" && bucket !== "property-images")) {
      return NextResponse.json(
        { error: "Invalid storage bucket. Must be 'project-images' or 'property-images'." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported image format (${file.type}). Allowed: JPG, PNG, WEBP.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 15MB limit." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Storage service unavailable" }, { status: 500 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    const safeObjectPath = `${safeFolder}/${crypto.randomUUID()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(safeObjectPath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL for public bucket
    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(safeObjectPath);

    return NextResponse.json({
      success: true,
      storagePath: safeObjectPath,
      publicUrl: publicUrlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error processing image upload";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
