import React from "react";
import Link from "next/link";
import { ArrowRight, HardHat, Mail } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export function ProjectCtaSection() {
  return (
    <section className="py-20 bg-poab-navy text-white relative overflow-hidden border-b border-poab-navy-surface">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-poab-navy-surface border border-poab-navy-muted text-xs uppercase tracking-wider text-poab-gold font-medium mb-6">
          <HardHat className="w-4 h-4 text-poab-gold" />
          <span>Turnkey Construction Partner</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
          Planning To Build? <br className="hidden sm:inline" />
          Start Your Project With POAB.
        </h2>

        <p className="text-base sm:text-lg text-poab-stone/85 max-w-2xl mx-auto font-light leading-relaxed mb-10">
          Whether you have ready architectural drawings or require site consultation on a virgin plot in Lagos, Ibadan, or elsewhere in Nigeria, our team provides honest quotations and hands-on supervision.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/request-quote"
            className="w-full sm:w-auto px-8 py-4 bg-poab-gold text-poab-navy font-semibold text-xs uppercase tracking-wider hover:bg-poab-gold-light active:bg-poab-gold-dark transition-colors border border-poab-gold-dark flex items-center justify-center space-x-2"
          >
            <span>Request a Construction Quote</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-4 bg-poab-navy-surface text-poab-stone hover:text-white hover:bg-poab-navy-muted text-xs uppercase tracking-wider transition-colors border border-poab-navy-muted flex items-center justify-center space-x-2"
          >
            <Mail className="w-4 h-4 text-poab-gold" />
            <span>Contact Our Office</span>
          </Link>
        </div>

        <div className="mt-12 text-xs text-poab-stone/60">
          Official Email:{" "}
          <a
            href={`mailto:${COMPANY_INFO.officialEmail}`}
            className="text-poab-gold hover:underline"
          >
            {COMPANY_INFO.officialEmail}
          </a>
        </div>
      </div>
    </section>
  );
}
