import { NextRequest, NextResponse } from "next/server";
import { quoteSubmissionSchema } from "@/lib/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getNextReference } from "@/lib/reference";
import { sendQuoteNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract fields
    const rawData = {
      project_type: formData.get("project_type") as string,
      location: formData.get("location") as string,
      land_size: (formData.get("land_size") as string) || undefined,
      floors: (formData.get("floors") as string) || undefined,
      bedrooms: (formData.get("bedrooms") as string) || undefined,
      current_stage: formData.get("current_stage") as string,
      description: formData.get("description") as string,
      budget_range: formData.get("budget_range") as string,
      timeline: formData.get("timeline") as string,
      has_building_plan: formData.get("has_building_plan") === "true",
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      whatsapp: (formData.get("whatsapp") as string) || undefined,
      email: formData.get("email") as string,
      preferred_contact: (formData.get("preferred_contact") as "phone" | "whatsapp" | "email") || "phone",
      privacy_acknowledged: formData.get("privacy_acknowledged") === "true",
      project_inspiration: (formData.get("project_inspiration") as string) || undefined,
      honeypot: (formData.get("honeypot") as string) || "",
    };

    // 1. Zod Validation
    const validation = quoteSubmissionSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 2. Anti-spam honeypot
    if (data.honeypot && data.honeypot.trim() !== "") {
      return NextResponse.json(
        { error: "Anti-spam verification triggered" },
        { status: 400 }
      );
    }

    const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const isProduction = process.env.NODE_ENV === "production";

    // 3. Concurrency-Safe Reference Generation
    const supabase = await createServerSupabaseClient();
    const adminSupabase = createAdminSupabaseClient();
    const activeClient = adminSupabase || supabase;

    if (!activeClient && (isProduction || isConfigured)) {
      console.error("[CRITICAL] Database client unavailable during quote submission in production/configured mode.");
      return NextResponse.json(
        { error: "Database service is currently unavailable. Please contact us directly at poabglobalconstruction@gmail.com." },
        { status: 503 }
      );
    }

    const reference = await getNextReference(activeClient, "POAB-REQ");

    // 4. Save Quote Request
    let quoteId: string = crypto.randomUUID();

    if (activeClient) {
      const { data: inserted, error: insertError } = await activeClient
        .from("quote_requests")
        .insert({
          id: quoteId,
          reference,
          project_type: data.project_type,
          location: data.location,
          land_size: data.land_size || null,
          floors: data.floors || null,
          bedrooms: data.bedrooms || null,
          current_stage: data.current_stage,
          description: data.description,
          budget_range: data.budget_range,
          timeline: data.timeline,
          has_building_plan: data.has_building_plan,
          name: data.name,
          phone: data.phone,
          whatsapp: data.whatsapp || null,
          email: data.email,
          preferred_contact: data.preferred_contact,
          privacy_acknowledged: data.privacy_acknowledged,
          status: "New",
          project_inspiration: data.project_inspiration || null,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[CRITICAL] Failed to insert quote request:", insertError.message);
        return NextResponse.json(
          { error: "Unable to record your quote request. Please try again or contact our team directly." },
          { status: 500 }
        );
      }

      if (inserted?.id) {
        quoteId = inserted.id;
      }
    }

    // 5. Secure File Upload Handling (Private Bucket)
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

        // File validation
        if (!allowedMimeTypes.includes(file.type)) {
          continue; // skip unsupported
        }

        if (file.size > 15 * 1024 * 1024) {
          continue; // skip > 15MB
        }

        const ext = file.name.split(".").pop() || "bin";
        const safeStoragePath = `quotes/${quoteId}/${crypto.randomUUID()}.${ext}`;

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await activeClient.storage
          .from("quote-attachments")
          .upload(safeStoragePath, fileBuffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("[WARNING] Quote file upload failed:", uploadError.message);
        } else {
          await activeClient.from("quote_attachments").insert({
            quote_id: quoteId,
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
      await sendQuoteNotification({
        quoteId,
        reference,
        name: data.name,
        phone: data.phone,
        email: data.email,
        whatsapp: data.whatsapp,
        preferred_contact: data.preferred_contact,
        project_type: data.project_type,
        location: data.location,
        land_size: data.land_size,
        floors: data.floors,
        bedrooms: data.bedrooms,
        current_stage: data.current_stage,
        budget_range: data.budget_range,
        timeline: data.timeline,
        has_building_plan: data.has_building_plan,
        description: data.description,
        project_inspiration: data.project_inspiration,
        filesCount: files?.filter((f) => f && f.size > 0).length || 0,
      });
    } catch (emailErr) {
      console.error(
        "[WARNING] Quote notification email delivery failed:",
        emailErr instanceof Error ? emailErr.message : "Unknown error"
      );
    }

    return NextResponse.json({
      success: true,
      reference,
      quoteId,
      message: "Quote request successfully recorded.",
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Quote submission error:", errorMsg);
    return NextResponse.json(
      { error: "Failed to process quote request. Please try again." },
      { status: 500 }
    );
  }
}
