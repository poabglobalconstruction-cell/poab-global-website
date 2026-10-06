import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = contactFormSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }

    const data = validation.data;

    if (data.honeypot && data.honeypot.trim() !== "") {
      return NextResponse.json(
        { error: "Spam verification triggered." },
        { status: 400 }
      );
    }

    const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const isProduction = process.env.NODE_ENV === "production";

    const supabase = await createServerSupabaseClient();

    if (!supabase && (isProduction || isConfigured)) {
      console.error("[CRITICAL] Supabase client unavailable during contact message submission.");
      return NextResponse.json(
        { error: "Database service is currently unavailable. Please contact us directly at poabglobalconstruction@gmail.com." },
        { status: 503 }
      );
    }

    if (supabase) {
      const { error: insertError } = await supabase.from("contact_messages").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
        status: "New",
      });

      if (insertError) {
        console.error("[CRITICAL] Failed to insert contact message:", insertError.message);
        return NextResponse.json(
          { error: "Unable to send your message. Please try again or email us directly at poabglobalconstruction@gmail.com." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been received. Our team will respond shortly.",
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact API error:", errorMsg);
    return NextResponse.json(
      { error: "Internal error sending message. Please try again." },
      { status: 500 }
    );
  }
}
