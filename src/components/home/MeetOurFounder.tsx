import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, HardHat, CheckCircle2, ArrowRight } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export function MeetOurFounder() {
  return (
    <section className="py-20 sm:py-24 bg-white border-b border-poab-grey-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Founder Photo Card (Portrait Aspect Ratio preserved without stretching) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-sm sm:max-w-md bg-poab-navy p-3 border border-poab-navy-surface shadow-xl">
              {/* Gold Corner Architectural Details */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-poab-gold" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-poab-gold" />

              <div className="relative aspect-[3/4] w-full overflow-hidden bg-poab-navy-surface">
                <Image
                  src="/images/founder/poab-founder.jpg"
                  alt="Oriowo Abiola Idris, Founder & CEO of POAB Global Construction Company Ltd wearing hard hat and branded attire on an active construction site"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 400px"
                />
              </div>

              {/* Caption Strip */}
              <div className="p-4 bg-poab-navy-surface border-t border-poab-navy-muted/60 mt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white tracking-wide">
                      Oriowo Abiola Idris
                    </h3>
                    <p className="text-xs text-poab-gold font-medium tracking-wider uppercase mt-0.5">
                      Founder &amp; Chief Executive Officer
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-poab-navy flex items-center justify-center border border-poab-gold/40 shrink-0">
                    <HardHat className="w-5 h-5 text-poab-gold" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Founder Profile Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-poab-stone text-poab-navy text-xs font-semibold uppercase tracking-wider border border-poab-grey-border">
              <ShieldCheck className="w-4 h-4 text-poab-gold" />
              <span>Leadership &amp; Site Supervision</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-poab-navy tracking-tight leading-tight">
              Hands-On Site Leadership From the Ground Up.
            </h2>

            <p className="text-base sm:text-lg text-poab-charcoal/85 leading-relaxed font-light">
              Under the leadership of <strong>Oriowo Abiola Idris</strong>, POAB Global Construction Company Ltd has grown on a singular principle: real structural quality is delivered through direct on-site presence, not remote guesswork.
            </p>

            <p className="text-sm sm:text-base text-poab-charcoal/80 leading-relaxed font-light">
              With over 11 years of hands-on site engineering and project coordination experience, our founder leads our teams directly across excavation, foundation setting, structural decking, and finishing milestones. This personal supervision guarantees honest quotations, transparent communication, and structural reliability.
            </p>

            {/* Leadership Guiding Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-poab-stone-light border border-poab-grey-border">
                <div className="flex items-center space-x-2 text-poab-navy font-bold text-xs uppercase tracking-wider mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-poab-gold shrink-0" />
                  <span>On-Site Supervision</span>
                </div>
                <p className="text-xs text-poab-charcoal/80 font-light leading-relaxed">
                  Direct site oversight of concrete mixes, steel reinforcement, and masonry alignment at every milestone.
                </p>
              </div>

              <div className="p-4 bg-poab-stone-light border border-poab-grey-border">
                <div className="flex items-center space-x-2 text-poab-navy font-bold text-xs uppercase tracking-wider mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-poab-gold shrink-0" />
                  <span>Honest Client Pricing</span>
                </div>
                <p className="text-xs text-poab-charcoal/80 font-light leading-relaxed">
                  Transparent bills of quantities with zero hidden fees, realistic timelines, and reliable procurement.
                </p>
              </div>
            </div>

            {/* Official Operating Experience Banner */}
            <div className="p-4 bg-poab-stone-light border-l-4 border-poab-gold border border-poab-grey-border">
              <span className="block text-xs uppercase tracking-wider font-bold text-poab-navy">
                Field Track Record: 11 Years of Hands-On Site Engineering
              </span>
              <p className="text-xs text-poab-charcoal/85 mt-1 leading-relaxed font-light">
                Extensive technical supervision across residential developments, foundation blockwork, structural decking, and turnkey delivery throughout Lagos, Ibadan, and nationwide.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider font-bold text-poab-navy hover:text-poab-gold transition-colors group"
              >
                <span>Read our full company story &amp; credentials</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
