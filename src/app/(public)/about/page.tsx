import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, HardHat, CheckCircle2, ArrowRight, MapPin, Building } from "lucide-react";
import { COMPANY_INFO, CONSTRUCTION_PRINCIPLES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about POAB Global Construction Company Ltd (RC ${COMPANY_INFO.cacNumber}). 11 years of hands-on site engineering experience delivering foundation-to-finish projects across Nigeria.`,
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-poab-navy text-white py-16 sm:py-24 border-b border-poab-navy-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-poab-navy-surface text-poab-gold text-xs uppercase tracking-wider mb-4 border border-poab-navy-muted">
              <ShieldCheck className="w-4 h-4 text-poab-gold" />
              <span>Incorporated in Nigeria • {COMPANY_INFO.rcNumber}</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Construction Built on Site Proof &amp; Professional Rigor.
            </h1>
            <p className="text-base sm:text-lg text-poab-stone/85 font-light leading-relaxed">
              POAB Global Construction Company Ltd is a registered Nigerian building contractor dedicated to delivering residential and commercial structures from virgin excavation through to final keys handover.
            </p>
          </div>
        </div>
      </section>

      {/* Origin & Operational Story */}
      <section className="py-20 border-b border-poab-grey-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6 text-poab-charcoal/85 leading-relaxed text-sm sm:text-base font-light">
              <div className="inline-block px-2.5 py-1 bg-poab-stone text-poab-navy text-xs font-semibold uppercase tracking-wider mb-1">
                Company Profile
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-poab-navy tracking-tight">
                Practical Experience Where It Matters: On The Ground.
              </h2>
              <p>
                At POAB Global Construction Company Ltd, our foundation is built on <strong>11 years of hands-on site engineering experience</strong>. While many contractors supervise projects through third parties or desk estimates, our leadership was shaped directly in the trenches—overseeing excavation depths, testing concrete mixes, and ensuring structural blockwork aligns perfectly.
              </p>
              <p>
                Headquartered in Ibadan, Oyo State, with extensive operational coverage in Lagos and across Nigeria, we have earned client trust by doing simple things thoroughly: avoiding shortcuts, issuing honest quotations, and taking total ownership of the building process.
              </p>
              <p>
                Our core service proposition is <strong>complete building delivery from foundation to finishing</strong>. Whether managing a bespoke family bungalow, a high-end duplex with a swimming pool, or a commercial development, we treat each milestone with consistent quality and discipline.
              </p>

              {/* Quote Block */}
              <div className="my-6 p-6 bg-poab-stone-light border-l-4 border-poab-gold border border-poab-grey-border">
                <p className="text-sm font-medium text-poab-navy italic">
                  &ldquo;{COMPANY_INFO.customerPromise}&rdquo;
                </p>
                <span className="block mt-2 text-xs uppercase tracking-wider font-semibold text-poab-charcoal/70">
                  — Official POAB Delivery Standard
                </span>
              </div>

              <p>
                Beyond primary construction, we offer property services focused on land acquisition, property listings, and representing legitimate property owners seeking a transparent sales channel.
              </p>
            </div>

            {/* Quick Fact Sheet Column */}
            <div className="lg:col-span-5 bg-poab-stone-light p-8 border border-poab-grey-border">
              <h3 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-4 mb-6">
                Verified Credentials
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                    Corporate Entity
                  </span>
                  <span className="font-bold text-poab-navy">{COMPANY_INFO.name}</span>
                </div>

                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                    CAC Registration
                  </span>
                  <span className="font-mono font-bold text-poab-navy">{COMPANY_INFO.rcNumber}</span>
                </div>

                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                    Site Experience
                  </span>
                  <span className="font-semibold text-poab-navy">{COMPANY_INFO.experienceStatement}</span>
                </div>

                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                    Head Office
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-poab-gold flex-shrink-0" />
                    <span className="font-medium text-poab-charcoal">{COMPANY_INFO.headOffice}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                    Operating Range
                  </span>
                  <span className="font-medium text-poab-charcoal">{COMPANY_INFO.operationsCoverage}</span>
                </div>

                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                    Business Model
                  </span>
                  <span className="font-medium text-poab-charcoal">{COMPANY_INFO.positioning}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-poab-grey-border">
                <Link
                  href="/request-quote"
                  className="w-full py-3 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold text-center block hover:bg-poab-navy-surface transition-colors"
                >
                  Request a Project Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Engineering Disciplines */}
      <section className="py-20 bg-poab-stone-light border-b border-poab-grey-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="inline-block px-2.5 py-1 bg-white text-poab-navy text-xs font-semibold uppercase tracking-wider mb-2 border border-poab-grey-border">
              Site Principles
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-poab-navy">
              Our Construction Standards
            </h2>
            <p className="mt-2 text-sm text-poab-charcoal/80 font-light">
              Every building entrusted to us follows strict structural execution rules designed to protect client capital and safeguard human life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CONSTRUCTION_PRINCIPLES.map((principle, idx) => (
              <div
                key={idx}
                className="p-6 bg-white border border-poab-grey-border shadow-xs"
              >
                <div className="flex items-center space-x-2 text-poab-gold mb-3">
                  <CheckCircle2 className="w-5 h-5 text-poab-gold" />
                  <span className="font-mono text-xs font-bold text-poab-navy">
                    RULE 0{idx + 1}
                  </span>
                </div>
                <h3 className="font-heading text-base font-bold text-poab-navy mb-2">
                  {principle.title}
                </h3>
                <p className="text-xs sm:text-sm text-poab-charcoal/80 leading-relaxed font-light">
                  {principle.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-poab-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
            Build With Proven Nigerian Site Leadership
          </h2>
          <p className="text-sm text-poab-stone/85 font-light mb-8 max-w-xl mx-auto">
            Speak directly with a POAB building representative about your land, architectural plans, or structural renovation project.
          </p>
          <Link
            href="/request-quote"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-poab-gold text-poab-navy font-semibold text-xs uppercase tracking-wider hover:bg-poab-gold-light transition-colors"
          >
            <span>Start Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
