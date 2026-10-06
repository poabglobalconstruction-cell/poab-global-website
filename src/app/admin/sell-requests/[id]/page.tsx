import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { SellPropertyRequest, SellPropertyAttachment } from "@/types/database";
import { SellRequestDetailClient } from "./SellRequestDetailClient";

interface SellRequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

async function getSellRequest(id: string): Promise<{
  request: SellPropertyRequest | null;
  attachments: SellPropertyAttachment[];
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return { request: null, attachments: [] };

    const { data: req, error } = await client
      .from("sell_property_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !req) return { request: null, attachments: [] };

    const { data: attachments } = await client
      .from("sell_property_attachments")
      .select("*")
      .eq("sell_request_id", id);

    return {
      request: req as SellPropertyRequest,
      attachments: (attachments as SellPropertyAttachment[]) || [],
    };
  } catch {
    return { request: null, attachments: [] };
  }
}

export default async function AdminSellRequestDetailPage({ params }: SellRequestDetailPageProps) {
  const resolvedParams = await params;
  const { request, attachments } = await getSellRequest(resolvedParams.id);

  if (!request) {
    notFound();
  }

  return <SellRequestDetailClient initialRequest={request} attachments={attachments} />;
}
