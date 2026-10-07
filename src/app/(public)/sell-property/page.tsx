import React from "react";
import type { Metadata } from "next";
import { Tag, ShieldCheck, CheckCircle } from "lucide-react";
import { SellPropertyForm } from "@/components/sell/SellPropertyForm";

export const metadata: Metadata = {
  title: "Sell a Property Through POAB",
  description: "Direct seller representation by POAB Global Construction Company Ltd. Submit your land or building for review and listing consideration.",
  alternates: {
    canonical: "/sell-property",
  },
};

export default function SellPropertyPage() {
  return (
    <div className="bg-poab-stone-light/50 min-h-screen py-12 sm:py-20">
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
      </div>
    </div>
  );
}
