import React from "react";
import Link from "next/link";
import { PlusCircle, Building, CheckCircle2 } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { Property } from "@/types/database";
import { formatPrice } from "@/lib/utils";

export const revalidate = 0;

async function getAdminProperties(): Promise<Property[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return [];

    const { data, error } = await client
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Property[];
  } catch {
    return [];
  }
}

interface AdminPropertiesPageProps {
  searchParams?: Promise<{ deleted?: string }>;
}

export default async function AdminPropertiesPage({ searchParams }: AdminPropertiesPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isDeleted = Boolean(resolvedParams.deleted);
  const properties = await getAdminProperties();

  return (
    <div className="space-y-6">
      {isDeleted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Property deleted successfully.</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-poab-grey-border">
        <div>
          <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
            Property Listings
          </h2>
          <p className="text-xs text-poab-charcoal/70 mt-1 font-light">
            Manage properties for sale, pricing display, and listing statuses.
          </p>
        </div>

        <Link
          href="/admin/properties/new"
          className="px-4 py-2.5 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold hover:bg-poab-navy-surface transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-poab-gold" />
          <span>Add New Property</span>
        </Link>
      </div>

      <div className="bg-white border border-poab-grey-border overflow-hidden shadow-xs">
        {properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-poab-stone-light border-b border-poab-grey-border text-poab-navy uppercase tracking-wider font-mono">
                  <th className="p-4">Reference &amp; Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Asking Price</th>
                  <th className="p-4">Listing Status</th>
                  <th className="p-4">Website Visibility</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-poab-grey-border">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-poab-stone-light/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-[10px] text-poab-gold font-bold block">
                        {prop.reference}
                      </span>
                      <span className="font-bold text-poab-navy text-sm">{prop.title}</span>
                    </td>
                    <td className="p-4 text-poab-charcoal">{prop.property_type}</td>
                    <td className="p-4 text-poab-charcoal">{prop.location}</td>
                    <td className="p-4 font-mono font-semibold text-poab-navy">
                      {prop.price_public ? formatPrice(prop.price) : "Hidden (On Request)"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                          prop.status === "Sold"
                            ? "bg-red-100 text-red-900"
                            : prop.status === "Under Offer"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {prop.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {prop.archived_at ? (
                        <span className="text-red-700 font-semibold text-[10px] uppercase">Archived</span>
                      ) : prop.published ? (
                        <span className="text-emerald-700 font-semibold text-[10px] uppercase flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Visible</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold text-[10px] uppercase">Hidden (Draft)</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/admin/properties/${prop.id}`}
                        className="px-2.5 py-1 bg-poab-stone text-poab-navy hover:bg-poab-stone-dark text-[11px] font-semibold uppercase tracking-wider inline-block"
                      >
                        Edit
                      </Link>
                      {prop.published && (
                        <Link
                          href={`/properties/${prop.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 text-poab-charcoal/70 hover:text-poab-navy text-[11px] inline-block"
                        >
                          ↗ View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-poab-charcoal/60 font-light">
            No properties found. Click &ldquo;Add New Property&rdquo; to create your first listing.
          </div>
        )}
      </div>
    </div>
  );
}
