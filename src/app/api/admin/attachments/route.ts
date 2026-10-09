import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyAdminSession } from "@/lib/supabase/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Unauthorized: Active administrator privileges required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'quote' | 'sell'
    const recordId = searchParams.get("recordId");
    const attachmentId = searchParams.get("attachmentId");

    if (!type || !recordId || !attachmentId) {
      return NextResponse.json(
        { error: "Missing required parameters (type, recordId, attachmentId)" },
        { status: 400 }
      );
    }

    if (type !== "quote" && type !== "sell") {
      return NextResponse.json({ error: "Invalid attachment type" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) {
      return NextResponse.json({ error: "Database service unavailable" }, { status: 500 });
    }

    let bucketName: string;
    let storagePath: string;
    let fileName: string;

    if (type === "quote") {
      bucketName = "quote-attachments";
      const { data: att, error } = await client
        .from("quote_attachments")
        .select("id, quote_id, storage_path, file_name")
        .eq("id", attachmentId)
        .eq("quote_id", recordId)
        .single();

      if (error || !att) {
        return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
      }

      storagePath = att.storage_path;
      fileName = att.file_name;
    } else {
      bucketName = "sell-property-attachments";
      const { data: att, error } = await client
        .from("sell_property_attachments")
        .select("id, sell_request_id, storage_path, file_name")
        .eq("id", attachmentId)
        .eq("sell_request_id", recordId)
        .single();

      if (error || !att) {
        return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
      }

      storagePath = att.storage_path;
      fileName = att.file_name;
    }

    // Safety: ensure storage path does not attempt directory traversal
    if (storagePath.includes("..") || storagePath.startsWith("/")) {
      return NextResponse.json({ error: "Invalid attachment storage path" }, { status: 400 });
    }

    // Generate expiring signed URL (60 seconds)
    const { data: signedData, error: signError } = await client.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 60, {
        download: fileName,
      });

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json(
        { error: "Unable to generate secure download link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedData.signedUrl,
      fileName,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error generating download link";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
