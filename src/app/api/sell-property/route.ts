import { NextRequest, NextResponse } from "next/server";
import { sellPropertySubmissionSchema } from "@/lib/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getNextReference } from "@/lib/reference";
import { sendSellPropertyNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const rawData = {
      seller_name: formData.get("seller_name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      whatsapp: (formData.get("whatsapp") as string) || undefined,
      property_location: formData.get("property_location") as string,
      property_type: formData.get("property_type") as string,
      description: formData.get("description") as string,
      expected_price: (formData.get("expected_price") as string) || undefined,
      honeypot: (formData.get("honeypot") as string) || "",
    };

    // 1. Zod Validation
    const validation = sellPropertySubmissionSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 2. Anti-spam honeypot
    if (data.honeypot && data.honeypot.trim() !== "") {
      return NextResponse.json(
        { error: "Spam verification triggered." },
        { status: 400 }
      );
    }

    const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const isProduction = process.env.NODE_ENV === "production";

    // 3. Concurrency-Safe Reference
    const supabase = await createServerSupabaseClient();
    const adminSupabase = createAdminSupabaseClient();
    const activeClient = adminSupabase || supabase;

    if (!activeClient && (isProduction || isConfigured)) {
      console.error("[CRITICAL] Database client unavailable during sell-property submission.");
      return NextResponse.json(
        { error: "Database service is currently unavailable. Please contact us directly at properties@poabglobalconstruction.com." },
        { status: 503 }
      );
    }

    const reference = await getNextReference(activeClient, "POAB-SELL");

    // 4. Save Request (Status = 'New', Never auto-published)
    let requestId = crypto.randomUUID();

    if (activeClient) {
      const { data: inserted, error: insertError } = await activeClient
        .from("sell_property_requests")
        .insert({
          id: requestId,
          reference,
          seller_name: data.seller_name,
          phone: data.phone,
          email: data.email,
          whatsapp: data.whatsapp || null,
          property_location: data.property_location,
          property_type: data.property_type,
          description: data.description,
          expected_price: data.expected_price || null,
          status: "New",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[CRITICAL] Failed to insert sell property request:", insertError.message);
        return NextResponse.json(
          { error: "Unable to record property submission. Please try again or contact us directly." },
          { status: 500 }
        );
      }

      if (inserted?.id) {
        requestId = inserted.id;
      }
    }

    // 5. Handle optional files (Private Bucket: sell-property-attachments)
    const files = formData.getAll("files") as File[];
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (activeClient && files && files.length > 0) {
      for (const file of files) {
        if (!file || typeof file.size !== "number" || file.size === 0) continue;
        if (!allowedMimeTypes.includes(file.type)) continue;
        if (file.size > 15 * 1024 * 1024) continue;

        const ext = file.name.split(".").pop() || "bin";
        const safeStoragePath = `seller-docs/${requestId}/${crypto.randomUUID()}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await activeClient.storage
          .from("sell-property-attachments")
          .upload(safeStoragePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("[WARNING] Sell property file upload failed:", uploadError.message);
        } else {
          await activeClient.from("sell_property_attachments").insert({
            sell_request_id: requestId,
            file_name: file.name,
            storage_path: safeStoragePath,
            file_type: file.type,
            file_size: file.size,
          });
        }
      }
    }

    // 6. Non-blocking Email Notification (Resend)
    // Supabase persistence is already complete; failure to send email must never fail the submission.
    try {
      await sendSellPropertyNotification({
        requestId,
        reference,
        seller_name: data.seller_name,
        phone: data.phone,
        email: data.email,
        whatsapp: data.whatsapp,
        property_location: data.property_location,
        property_type: data.property_type,
        expected_price: data.expected_price,
        description: data.description,
        filesCount: files?.filter((f) => f && f.size > 0).length || 0,
      });
    } catch (emailErr) {
      console.error(
        "[WARNING] Sell property notification email delivery failed:",
        emailErr instanceof Error ? emailErr.message : "Unknown error"
      );
    }

    return NextResponse.json({
      success: true,
      reference,
      message: "Property listing request logged successfully for manual admin review.",
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Seller submission error:", errorMsg);
    return NextResponse.json(
      { error: "Failed to process property submission. Please try again." },
      { status: 500 }
    );
  }
}
