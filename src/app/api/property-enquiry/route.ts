import { NextRequest, NextResponse } from "next/server";
import { propertyEnquirySchema } from "@/lib/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Validation & Anti-abuse
    const validation = propertyEnquirySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid input data." },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check honeypot
    if (data.honeypot && data.honeypot.trim() !== "") {
      return NextResponse.json(
        { error: "Spam verification triggered." },
        { status: 400 }
      );
    }

    const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const isProduction = process.env.NODE_ENV === "production";

    // 2. Persist to database
    const supabase = await createServerSupabaseClient();

    if (!supabase && (isProduction || isConfigured)) {
      console.error("[CRITICAL] Supabase client unavailable during property enquiry submission.");
      return NextResponse.json(
        { error: "Database service is currently unavailable. Please contact us directly at poabglobalconstruction@gmail.com." },
        { status: 503 }
      );
    }

    if (supabase) {
      const { error: insertError } = await supabase.from("property_enquiries").insert({
        property_id: data.property_id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        whatsapp: data.whatsapp || null,
        message: data.message,
        status: "New",
      });

      if (insertError) {
        console.error("[CRITICAL] Failed to insert property enquiry:", insertError.message);
        return NextResponse.json(
          { error: "Unable to record your property enquiry. Please try again or contact us directly." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Property enquiry recorded successfully.",
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Enquiry submission error:", errorMsg);
    return NextResponse.json(
      { error: "Internal server error processing enquiry. Please try again." },
      { status: 500 }
    );
  }
}
