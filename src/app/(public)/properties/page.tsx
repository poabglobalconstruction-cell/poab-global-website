import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Building, Tag, ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Property } from "@/types/database";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Properties & Land for Sale in Nigeria | POAB Global",
  },
  description:
    "Browse verified land parcels and residential properties represented by POAB Global Construction Company Ltd in Ibadan and across Nigeria.",
  alternates: {
    canonical: "/properties",
  },
  openGraph: {
    title: "Properties & Land for Sale in Nigeria | POAB Global",
    description:
      "Browse verified land parcels and residential properties represented by POAB Global Construction Company Ltd in Ibadan and across Nigeria.",
    url: "/properties",
    type: "website",
    images: [{ url: "/brand/poab-logo.svg", width: 800, height: 600, alt: "POAB Global Properties" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Properties & Land for Sale in Nigeria | POAB Global",
    description:
      "Browse verified land parcels and residential properties represented by POAB Global Construction Company Ltd in Ibadan and across Nigeria.",
    images: ["/brand/poab-logo.svg"],
  },
};

export const revalidate = 60;

interface PropertiesPageProps {
  searchParams: Promise<{ type?: string; status?: string }>;
}

async function getPublishedProperties(typeFilter?: string, statusFilter?: string): Promise<Property[]> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return [];

    let query = supabase
      .from("properties")
      .select("*, property_images(*)")
      .eq("published", true)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (typeFilter && typeFilter !== "All") {
      query = query.eq("property_type", typeFilter);
    }

    if (statusFilter && statusFilter !== "All") {
      query = query.eq("status", statusFilter);
    } else {
      // By default, exclude withdrawn listings from public browsing
      query = query.neq("status", "Withdrawn");
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Property[];
  } catch {
    return [];
  }
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedParams = await searchParams;
  const currentType = resolvedParams.type || "All";
  const currentStatus = resolvedParams.status || "All";
  const properties = await getPublishedProperties(currentType, currentStatus);
  const hasProperties = properties.length > 0;
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
  ]);

  return (
    <div className="bg-white min-h-screen">
      <JsonLd data={breadcrumbs} />
      {/* Header */}
      <section className="bg-poab-navy text-white py-16 sm:py-24 border-b border-poab-navy-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block px-2.5 py-1 bg-poab-navy-surface text-poab-gold text-xs uppercase tracking-wider mb-4 border border-poab-navy-muted">
              Property Services
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Properties &amp; Land Opportunities
            </h1>
            <p className="text-base sm:text-lg text-poab-stone/85 font-light leading-relaxed">
              POAB also assists clients with property buying and selling opportunities. Property information is reviewed before publication, with further verification carried out according to the requirements of each transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Sell Property Banner / Secondary Service Highlight */}
        <div className="bg-poab-stone-light border border-poab-grey-border p-6 sm:p-8 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-poab-gold">
              Own Property in Nigeria?
            </span>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-poab-navy">
              Sell Your Land or Building Directly Through POAB
            </h2>
            <p className="text-xs sm:text-sm text-poab-charcoal/80 font-light max-w-2xl">
              We assist genuine property owners in presenting their parcels and completed buildings to prospective buyers with clear documentation and professional discretion.
            </p>
          </div>
          <Link
            href="/sell-property"
            className="flex-shrink-0 px-6 py-3 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold hover:bg-poab-navy-surface transition-colors flex items-center space-x-2"
          >
            <Tag className="w-4 h-4 text-poab-gold" />
            <span>Sell With POAB</span>
          </Link>
        </div>

        {/* Properties Grid or Empty State */}
        {hasProperties ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-poab-stone-light border border-dashed border-poab-grey-border max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-poab-stone text-poab-navy mx-auto flex items-center justify-center mb-4">
              <Building className="w-7 h-7 text-poab-navy/60" />
            </div>
            <h2 className="font-heading text-lg font-bold text-poab-navy">
              No Properties Currently Listed
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-poab-charcoal/70 font-light leading-relaxed">
              New property opportunities will appear here when they are available.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link
                href="/sell-property"
                className="px-5 py-2.5 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold hover:bg-poab-navy-surface transition-colors"
              >
                Sell With POAB
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-white border border-poab-grey-border text-xs uppercase tracking-wider font-semibold text-poab-navy hover:bg-poab-stone transition-colors"
              >
                Contact POAB
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
