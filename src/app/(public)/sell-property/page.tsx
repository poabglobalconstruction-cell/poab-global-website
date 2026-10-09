import React from "react";
import type { Metadata } from "next";
import { Tag, ShieldCheck, CheckCircle } from "lucide-react";
import { SellPropertyForm } from "@/components/sell/SellPropertyForm";
import { DEPARTMENT_EMAILS } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Sell Property or Land Through POAB | POAB Global",
  },
  description:
    "Direct seller representation for verified properties and land parcels in Ibadan, Oyo State, and Nigeria by POAB Global Construction Company Ltd.",
  alternates: {
    canonical: "/sell-property",
  },
  openGraph: {
    title: "Sell Property or Land Through POAB | POAB Global",
    description:
      "Direct seller representation for verified properties and land parcels in Ibadan, Oyo State, and Nigeria by POAB Global Construction Company Ltd.",
    url: "/sell-property",
    type: "website",
    images: [{ url: "/brand/poab-logo.svg", width: 800, height: 600, alt: "Sell Property Through POAB Global" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell Property or Land Through POAB | POAB Global",
    description:
      "Direct seller representation for verified properties and land parcels in Ibadan, Oyo State, and Nigeria by POAB Global Construction Company Ltd.",
    images: ["/brand/poab-logo.svg"],
  },
};

export default function SellPropertyPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Sell Property", path: "/sell-property" },
  ]);

  return (
    <div className="bg-poab-stone-light/50 min-h-screen py-12 sm:py-20">
      <JsonLd data={breadcrumbs} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white text-poab-navy text-xs uppercase tracking-wider mb-4 border border-poab-grey-border">
            <Tag className="w-4 h-4 text-poab-gold" />
            <span>Direct Seller Representation</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-poab-navy mb-4">
            Sell With POAB Global Construction
          </h1>

          <p className="text-sm sm:text-base text-poab-charcoal/80 font-light leading-relaxed max-w-2xl mx-auto">
            We represent property owners with transparency, professional marketing, and careful document review.
          </p>
        </div>

        {/* Benefits bar */}
        <div className="max-w-2xl mx-auto mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-poab-charcoal font-medium">
          <div className="p-3 bg-white border border-poab-grey-border flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-poab-gold flex-shrink-0" />
            <span>Confidential Intake</span>
          </div>
          <div className="p-3 bg-white border border-poab-grey-border flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-poab-gold flex-shrink-0" />
            <span>Document &amp; Site Review</span>
          </div>
          <div className="p-3 bg-white border border-poab-grey-border flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-poab-gold flex-shrink-0" />
            <span>Serious Enquiries</span>
          </div>
        </div>

        {/* Seller Intake Form */}
        <SellPropertyForm />

        {/* Direct Properties Enquiries Note */}
        <div className="mt-10 text-center text-xs text-poab-charcoal/70 max-w-lg mx-auto bg-white p-4 border border-poab-grey-border">
          <p>
            For property representation questions or general seller enquiries, reach our acquisitions desk at{" "}
            <a
              href={`mailto:${DEPARTMENT_EMAILS.properties}`}
              className="text-poab-navy font-semibold hover:text-poab-gold underline"
            >
              {DEPARTMENT_EMAILS.properties}
            </a>
            . To safeguard sensitive ownership records, survey plans, and title documents, please submit them through the secure intake form above.
          </p>
        </div>
      </div>
    </div>
  );
}
