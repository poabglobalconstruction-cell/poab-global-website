import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { QuoteRequest, QuoteAttachment } from "@/types/database";
import { QuoteDetailClient } from "./QuoteDetailClient";

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

async function getQuoteWithAttachments(id: string): Promise<{
  quote: QuoteRequest | null;
  attachments: QuoteAttachment[];
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return { quote: null, attachments: [] };

    const { data: quote, error: qError } = await client
      .from("quote_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (qError || !quote) return { quote: null, attachments: [] };

    const { data: attachments } = await client
      .from("quote_attachments")
      .select("*")
      .eq("quote_id", id);

    return {
      quote: quote as QuoteRequest,
      attachments: (attachments as QuoteAttachment[]) || [],
    };
  } catch {
    return { quote: null, attachments: [] };
  }
}

export default async function AdminQuoteDetailPage({ params }: QuoteDetailPageProps) {
  const resolvedParams = await params;
  const { quote, attachments } = await getQuoteWithAttachments(resolvedParams.id);

  if (!quote) {
    notFound();
  }

  return <QuoteDetailClient initialQuote={quote} attachments={attachments} />;
}
