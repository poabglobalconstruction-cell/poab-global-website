import React from "react";
import type { Metadata } from "next";
import { ShieldCheck, HardHat } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import { MultiStepQuoteForm } from "@/components/quote/MultiStepQuoteForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Request a Construction Quote",
  description: "Submit your residential or commercial building project specifications for an honest quotation and site assessment by POAB Global Construction Company Ltd.",
};

interface RequestQuotePageProps {
  searchParams: Promise<{ type?: string; inspiration?: string }>;
}

export default async function RequestQuotePage({ searchParams }: RequestQuotePageProps) {
  const resolvedParams = await searchParams;

  // Fetch whatsapp number from settings if configured
  let whatsappNumber: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "contact_channels")
        .single();
      if (data && data.value && typeof data.value === "object") {
        whatsappNumber = (data.value as { whatsapp_number?: string }).whatsapp_number || null;
      }
    }
  } catch {
    // fallback gracefully
  }

  return (
    <div className="bg-poab-stone-light/50 min-h-screen py-12 sm:py-20">
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

        {/* Bottom Security Note */}
        <div className="mt-12 text-center text-xs text-poab-charcoal/60 max-w-md mx-auto flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-poab-gold flex-shrink-0" />
          <span>
            Your data and building plans are stored securely and never shared with unauthorized third parties.
          </span>
        </div>
      </div>
    </div>
  );
}
