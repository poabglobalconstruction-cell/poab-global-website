import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { PropertyEnquiry } from "@/types/database";
import { EnquiryDetailClient } from "./EnquiryDetailClient";

interface EnquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

async function getEnquiryById(id: string): Promise<PropertyEnquiry | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return null;

    const { data, error } = await client
      .from("property_enquiries")
      .select("*, properties(*)")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    const raw = data as Record<string, unknown>;
    const property = raw.properties || raw.property || null;
    return {
      ...raw,
      property,
    } as unknown as PropertyEnquiry;
  } catch {
    return null;
  }
}

export default async function AdminEnquiryDetailPage({ params }: EnquiryDetailPageProps) {
  const resolvedParams = await params;
  const enquiry = await getEnquiryById(resolvedParams.id);

  if (!enquiry) {
    notFound();
  }

  return <EnquiryDetailClient enquiry={enquiry} />;
}
