import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { Property, PropertyImage } from "@/types/database";
import { EditPropertyClient } from "./EditPropertyClient";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

async function getPropertyWithImages(id: string): Promise<{
  property: Property | null;
  images: PropertyImage[];
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return { property: null, images: [] };

    const { data: prop, error: pError } = await client
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (pError || !prop) return { property: null, images: [] };

    const { data: images } = await client
      .from("property_images")
      .select("*")
      .eq("property_id", id)
      .order("sort_order", { ascending: true });

    return {
      property: prop as Property,
      images: (images as PropertyImage[]) || [],
    };
  } catch {
    return { property: null, images: [] };
  }
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const resolvedParams = await params;
  const { property, images } = await getPropertyWithImages(resolvedParams.id);

  if (!property) {
    notFound();
  }

  return <EditPropertyClient initialProperty={property} initialImages={images} />;
}
