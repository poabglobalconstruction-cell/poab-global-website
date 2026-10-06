import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, Bed, Bath, Maximize2, Building } from "lucide-react";
import { Property } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const isSold = property.status === "Sold";
  const primaryImage =
    property.images && property.images.length > 0
      ? property.images.find((img) => img.is_primary)?.storage_path || property.images[0].storage_path
      : null;

  return (
    <article className="bg-white border border-poab-grey-border flex flex-col justify-between hover:border-poab-navy/50 transition-all group overflow-hidden">
      <div>
        {/* Image Slot */}
        <div className="relative aspect-[16/10] bg-poab-navy/10 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              className={`object-cover group-hover:scale-102 transition-transform duration-300 ${
                isSold ? "grayscale" : ""
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-poab-stone text-poab-navy/40 p-4 text-center">
              <Building className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-[11px] uppercase tracking-wider font-medium text-poab-charcoal/60">
                Property Photography
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {isSold ? (
              <Badge variant="sold">SOLD</Badge>
            ) : property.status === "Under Offer" ? (
              <Badge variant="warning">UNDER OFFER</Badge>
            ) : (
              <Badge variant="success">AVAILABLE</Badge>
            )}
          </div>

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 bg-poab-navy/90 text-white text-[10px] font-semibold uppercase tracking-wider">
              {property.property_type}
            </span>
          </div>

          {/* Sold Overlay banner */}
          {isSold && (
            <div className="absolute inset-0 bg-poab-navy/60 flex items-center justify-center pointer-events-none">
              <span className="text-white font-heading text-xl font-bold tracking-widest border-2 border-white px-4 py-1">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between text-xs text-poab-charcoal/70 mb-2">
            <div className="flex items-center space-x-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-poab-gold flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>
            <span className="font-mono text-[10px] text-poab-charcoal/50 flex-shrink-0">
              {property.reference}
            </span>
          </div>

          <h3 className="font-heading text-lg font-bold text-poab-navy group-hover:text-poab-gold transition-colors leading-snug">
            <Link href={`/properties/${property.slug}`}>
              {property.title}
            </Link>
          </h3>

          {/* Price display */}
          <div className="mt-3 font-semibold text-base text-poab-navy">
            {property.price_public ? formatPrice(property.price) : "Price on Request"}
          </div>

          {/* Key specs */}
          <div className="mt-4 pt-4 border-t border-poab-grey-border flex items-center space-x-4 text-xs text-poab-charcoal/80">
            {property.bedrooms !== null && (
              <div className="flex items-center space-x-1">
                <Bed className="w-3.5 h-3.5 text-poab-gold" />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms !== null && (
              <div className="flex items-center space-x-1">
                <Bath className="w-3.5 h-3.5 text-poab-gold" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
            {property.size && (
              <div className="flex items-center space-x-1">
                <Maximize2 className="w-3.5 h-3.5 text-poab-gold" />
                <span>{property.size}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="px-6 py-4 border-t border-poab-grey-border bg-poab-stone-light/50 flex items-center justify-between">
        <span className="text-[11px] text-poab-charcoal/60 uppercase tracking-wider font-medium">
          {isSold ? "Sold Listing" : property.status === "Under Offer" ? "Under Offer" : "Property Listing"}
        </span>
        <Link
          href={`/properties/${property.slug}`}
          className="text-xs font-semibold uppercase tracking-wider text-poab-navy group-hover:text-poab-gold flex items-center space-x-1 transition-colors"
        >
          <span>{isSold ? "View Details" : "View Property"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
