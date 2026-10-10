import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize2, ShieldCheck, ChevronRight, MessageCircle } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Property, PropertyImage } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, buildWhatsAppLink } from "@/lib/utils";
import { PropertyEnquiryForm } from "@/components/properties/PropertyEnquiryForm";
import { getPublicContactSettings } from "@/lib/contact-settings";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

async function getPropertyBySlug(slug: string): Promise<{
  property: Property | null;
  images: PropertyImage[];
  whatsappNumber: string | null;
}> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return { property: null, images: [], whatsappNumber: null };

    const { data: propData, error: propError } = await supabase
      .from("properties")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .is("archived_at", null)
      .single();

    if (propError || !propData) {
      return { property: null, images: [], whatsappNumber: null };
    }

    const property = propData as Property;

    // Fetch images
    const { data: imagesData } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", property.id)
      .order("sort_order", { ascending: true });

    // Sort images so primary cover is first, then ordered by sort_order
    const sortedImages = ((imagesData as PropertyImage[]) || []).sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    // Fetch whatsapp from shared contact settings
    const contact = await getPublicContactSettings();
    const whatsappNumber = contact.whatsapp_number || null;

    return {
      property,
      images: sortedImages,
      whatsappNumber,
    };
  } catch {
    return { property: null, images: [], whatsappNumber: null };
  }
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { property, images } = await getPropertyBySlug(resolvedParams.slug);

  if (!property) {
    return {
      title: "Property Not Found",
    };
  }

  const primaryImage =
    images.length > 0
      ? images.find((i) => i.is_primary)?.storage_path || images[0].storage_path
      : "/brand/poab-logo.svg";

  return {
    title: {
      absolute: `${property.title} | POAB Global Properties`,
    },
    description: property.description.slice(0, 160),
    alternates: {
      canonical: `/properties/${property.slug}`,
    },
    openGraph: {
      title: `${property.title} | POAB Global Properties`,
      description: property.description.slice(0, 160),
      url: `/properties/${property.slug}`,
      type: "website",
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.title} | POAB Global Properties`,
      description: property.description.slice(0, 160),
      images: [primaryImage],
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const resolvedParams = await params;
  const { property, images, whatsappNumber } = await getPropertyBySlug(resolvedParams.slug);

  if (!property) {
    notFound();
  }

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
    { name: property.title, path: `/properties/${property.slug}` },
  ]);

  const isSold = property.status === "Sold";
  const isWithdrawn = property.status === "Withdrawn";
  const primaryImage =
    images.length > 0
      ? images.find((i) => i.is_primary)?.storage_path || images[0].storage_path
      : null;

  const whatsappMessage = `Hello POAB Global Construction, I am interested in property "${property.title}" located at ${property.location}. Please share inspection availability.`;
  const whatsappUrl = buildWhatsAppLink(whatsappNumber, whatsappMessage);

  return (
    <div className="bg-white min-h-screen">
      <JsonLd data={breadcrumbs} />
      {/* Breadcrumb Bar */}
      <div className="bg-poab-stone-light border-b border-poab-grey-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-poab-charcoal/70 flex items-center space-x-2">
          <Link href="/" className="hover:text-poab-navy">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/properties" className="hover:text-poab-navy">Properties</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-poab-navy font-semibold truncate max-w-xs">{property.title}</span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-poab-navy text-white py-12 border-b border-poab-navy-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 bg-poab-navy-surface text-poab-gold text-xs font-semibold uppercase tracking-wider border border-poab-navy-muted">
                {property.property_type}
              </span>
            </div>

            <div>
              {isSold ? (
                <Badge variant="sold">SOLD</Badge>
              ) : isWithdrawn ? (
                <Badge variant="withdrawn">WITHDRAWN</Badge>
              ) : property.status === "Under Offer" ? (
                <Badge variant="warning">UNDER OFFER</Badge>
              ) : (
                <Badge variant="success">AVAILABLE FOR PURCHASE</Badge>
              )}
            </div>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            {property.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-poab-stone/80">
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-poab-gold flex-shrink-0" />
              <span>{property.location}</span>
            </div>
            <div className="font-bold text-lg text-white">
              {property.price_public ? formatPrice(property.price) : "Price on Request"}
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Imagery & Details */}
          <div className="lg:col-span-8 space-y-12">
            {/* Primary Image Slot */}
            <div className="relative aspect-[16/10] bg-poab-stone border border-poab-grey-border overflow-hidden">
              {primaryImage ? (
                <Image
                  src={primaryImage}
                  alt={property.title}
                  fill
                  priority
                  className={`object-cover ${isSold ? "grayscale" : ""}`}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-poab-stone-light text-poab-navy/40 p-8 text-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-poab-charcoal/60">
                    Property Gallery Pending
                  </span>
                </div>
              )}

              {isSold && (
                <div className="absolute inset-0 bg-poab-navy/70 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-white border-2 border-white p-6 max-w-xs">
                    <span className="font-heading text-2xl font-bold tracking-widest block">
                      SOLD
                    </span>
                    <span className="text-xs text-poab-stone/80 uppercase tracking-wider mt-1 block">
                      This listing is no longer available
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-[4/3] bg-poab-stone border border-poab-grey-border overflow-hidden"
                  >
                    <Image
                      src={img.storage_path}
                      alt={img.alt_text || property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Specifications Strip */}
            <div className="p-6 bg-poab-stone-light border border-poab-grey-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {property.bedrooms !== null && (
                <div className="p-2">
                  <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block">Bedrooms</span>
                  <span className="font-heading text-lg font-bold text-poab-navy">{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms !== null && (
                <div className="p-2">
                  <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block">Bathrooms</span>
                  <span className="font-heading text-lg font-bold text-poab-navy">{property.bathrooms}</span>
                </div>
              )}
              {property.size && (
                <div className="p-2">
                  <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block">Land / Unit Size</span>
                  <span className="font-heading text-lg font-bold text-poab-navy">{property.size}</span>
                </div>
              )}
              <div className="p-2">
                <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block">Category</span>
                <span className="font-heading text-lg font-bold text-poab-navy">{property.property_type}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-bold text-poab-navy">
                Property Overview
              </h2>
              <div className="prose max-w-none text-poab-charcoal/85 leading-relaxed text-sm sm:text-base font-light whitespace-pre-line">
                {property.description}
              </div>
            </div>

            {/* Features List */}
            {property.features && property.features.length > 0 && (
              <div className="pt-6 border-t border-poab-grey-border">
                <h3 className="font-heading text-lg font-bold text-poab-navy mb-4">
                  Confirmed Highlights &amp; Inclusions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs sm:text-sm text-poab-charcoal/85">
                      <ShieldCheck className="w-4 h-4 text-poab-gold flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contextual Action Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-poab-stone-light p-6 sm:p-8 border border-poab-grey-border">
              {isSold ? (
                /* Sold State Requirement: Clear notice and disabled enquiry */
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-red-100 text-red-900 border border-red-200">
                    <span className="font-heading font-bold text-base block uppercase tracking-wider">
                      Property Sold
                    </span>
                    <p className="mt-2 text-xs text-red-900 font-medium">
                      This property has been sold.
                    </p>
                    <p className="mt-1 text-xs text-red-800 font-light">
                      Normal purchase enquiries are no longer being accepted for this listing.
                    </p>
                  </div>
                  <p className="text-xs text-poab-charcoal/80 font-light leading-relaxed">
                    Looking for a similar parcel or building in this location? You can submit your requirements or request our team to build on your existing plot.
                  </p>
                  <Link
                    href="/request-quote"
                    className="w-full py-3 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold text-center block hover:bg-poab-navy-surface transition-colors"
                  >
                    Start Your Project
                  </Link>
                </div>
              ) : isWithdrawn ? (
                /* Withdrawn State Notice */
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-slate-100 text-slate-800 border border-slate-300">
                    <span className="font-heading font-bold text-base block uppercase tracking-wider">
                      Listing Withdrawn
                    </span>
                    <p className="mt-2 text-xs text-slate-700 font-medium">
                      This property listing has been withdrawn.
                    </p>
                    <p className="mt-1 text-xs text-slate-600 font-light">
                      It is currently not available for purchase or inspection.
                    </p>
                  </div>
                  <p className="text-xs text-poab-charcoal/80 font-light leading-relaxed">
                    Explore our active listings or get in touch with our team for upcoming development opportunities.
                  </p>
                  <Link
                    href="/properties"
                    className="w-full py-3 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold text-center block hover:bg-poab-navy-surface transition-colors"
                  >
                    Browse Available Properties
                  </Link>
                </div>
              ) : (
                /* Available / Under Offer Enquiry Form */
                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-poab-gold font-bold block mb-1">
                      Property Enquiry
                    </span>
                    <h3 className="font-heading text-lg font-bold text-poab-navy">
                      Schedule Inspection / Enquire
                    </h3>
                    <p className="text-xs text-poab-charcoal/70 mt-1 font-light">
                      Connect directly with our property team for details and inspection scheduling.
                    </p>
                  </div>

                  {/* Contextual WhatsApp Button if URL available */}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold text-center flex items-center justify-center space-x-2 hover:bg-emerald-800 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Enquire via WhatsApp</span>
                    </a>
                  )}

                  {/* Dedicated Property Enquiry Form */}
                  <PropertyEnquiryForm
                    propertyId={property.id}
                    propertyTitle={property.title}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
