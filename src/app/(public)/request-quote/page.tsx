import React from "react";
import type { Metadata } from "next";
import { ShieldCheck, HardHat } from "lucide-react";
import { COMPANY_INFO, DEPARTMENT_EMAILS } from "@/lib/constants";
import { MultiStepQuoteForm } from "@/components/quote/MultiStepQuoteForm";
import { getPublicContactSettings } from "@/lib/contact-settings";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: {
    absolute: "Request a Construction Quote | POAB Global",
  },
  description:
    "Submit your building project specifications for a transparent quotation and hands-on site assessment from POAB Global Construction Company Ltd.",
  alternates: {
    canonical: "/request-quote",
  },
  openGraph: {
    title: "Request a Construction Quote | POAB Global",
    description:
      "Submit your building project specifications for a transparent quotation and hands-on site assessment from POAB Global Construction Company Ltd.",
    url: "/request-quote",
    type: "website",
    images: [{ url: "/brand/poab-logo.svg", width: 800, height: 600, alt: "Request a Construction Quote | POAB Global" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Request a Construction Quote | POAB Global",
    description:
      "Submit your building project specifications for a transparent quotation and hands-on site assessment from POAB Global Construction Company Ltd.",
    images: ["/brand/poab-logo.svg"],
  },
};

interface RequestQuotePageProps {
  searchParams: Promise<{ type?: string; inspiration?: string }>;
}

export default async function RequestQuotePage({ searchParams }: RequestQuotePageProps) {
  const resolvedParams = await searchParams;

  // Fetch whatsapp number from shared contact settings
  const contact = await getPublicContactSettings();
  const whatsappNumber = contact.whatsapp_number || null;

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Request a Quote", path: "/request-quote" },
  ]);

  return (
    <div className="bg-poab-stone-light/50 min-h-screen py-12 sm:py-20">
      <JsonLd data={breadcrumbs} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white text-poab-navy text-xs uppercase tracking-wider mb-4 border border-poab-grey-border">
            <HardHat className="w-4 h-4 text-poab-gold" />
            <span>Structured Construction Intake</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-poab-navy mb-4">
            Request an Honest Construction Quotation
          </h1>

          <p className="text-sm sm:text-base text-poab-charcoal/80 font-light leading-relaxed max-w-2xl mx-auto">
            Tell us about your land, architectural drawings, or building concept. Every submission receives dedicated review by hands-on site supervisors with 11 years of hands-on site engineering experience.
          </p>
        </div>

        {/* 6-Step Multi-Step Form */}
        <MultiStepQuoteForm
          initialProjectType={resolvedParams.type}
          initialInspiration={resolvedParams.inspiration}
          whatsappNumber={whatsappNumber}
        />

        {/* Direct Projects Consultation Note */}
        <div className="mt-8 text-center text-xs text-poab-charcoal/70 max-w-lg mx-auto bg-white p-4 border border-poab-grey-border">
          <p>
            For project inquiries or general construction questions, reach our engineering desk at{" "}
            <a
              href={`mailto:${DEPARTMENT_EMAILS.projects}`}
              className="text-poab-navy font-semibold hover:text-poab-gold underline"
            >
              {DEPARTMENT_EMAILS.projects}
            </a>
            . Architectural drawings and building plans should be uploaded directly through the secure form above for protected storage and tracking.
          </p>
        </div>

        {/* Bottom Security Note */}
        <div className="mt-8 text-center text-xs text-poab-charcoal/60 max-w-md mx-auto flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-poab-gold flex-shrink-0" />
          <span>
            Your data and building plans are stored securely and never shared with unauthorized third parties.
          </span>
        </div>
      </div>
    </div>
  );
}
