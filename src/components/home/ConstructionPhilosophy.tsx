import React from "react";
import Image from "next/image";
import { CONSTRUCTION_PRINCIPLES } from "@/lib/constants";
import { CheckCircle2 } from "lucide-react";

export function ConstructionPhilosophy() {
  return (
    <section className="py-20 bg-poab-stone-light border-b border-poab-grey-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Manifesto */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-block px-2.5 py-1 bg-white text-poab-navy text-xs font-semibold uppercase tracking-wider border border-poab-grey-border">
              Construction Principles
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-poab-navy tracking-tight leading-tight">
              Why Real Site Standards Matter.
            </h2>

            <p className="text-sm sm:text-base text-poab-charcoal/85 leading-relaxed font-light">
              Most construction problems in Nigeria do not happen during painting or roofing. They occur under the soil during excavation and foundation casting.
            </p>

            <p className="text-sm sm:text-base text-poab-charcoal/85 leading-relaxed font-light">
              At POAB Global Construction, our 11 years of hands-on site experience guide every decision. We do not gamble with structural integrity, we do not guess concrete mix ratios, and we do not compromise on supervision.
            </p>

            <div className="p-4 bg-white border-l-4 border-poab-gold border border-poab-grey-border text-xs text-poab-charcoal leading-relaxed font-medium">
              &ldquo;A building is only as reliable as the supervision protecting its foundation. Our priority is building structures that stand the test of time.&rdquo;
            </div>

            {/* Authentic POAB Foundation Team Work */}
            <div className="border border-poab-grey-border bg-white overflow-hidden shadow-xs">
              <div className="relative aspect-[4/3] w-full bg-poab-navy">
                <Image
                  src="/images/projects/ibadan-workers.jpg"
                  alt="POAB Global Construction site workers setting deep foundation alignment on an active project in Ibadan, Oyo State"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
              <div className="px-3.5 py-2 bg-poab-stone-light border-t border-poab-grey-border text-[11px] font-mono uppercase tracking-wider text-poab-charcoal/70 flex items-center justify-between">
                <span>Sub-Structure Standards</span>
                <span className="text-poab-navy/70">Ibadan Foundation Work</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Core Practical Tenets */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CONSTRUCTION_PRINCIPLES.map((principle, idx) => (
              <div
                key={idx}
                className="p-6 bg-white border border-poab-grey-border shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 text-poab-gold mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-mono font-bold text-poab-navy">
                      STANDARD #{idx + 1}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-poab-navy mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-xs text-poab-charcoal/80 leading-relaxed font-light">
                    {principle.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
