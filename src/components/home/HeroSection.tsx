import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Compass, MapPin } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative bg-poab-navy text-white overflow-hidden border-b border-poab-navy-surface">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Background Image Layer (Atmospheric Nigerian Building Construction Backdrop) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          <Image
            src="/images/illustrative/lagos-building-construction.jpg"
            alt="Multi-level building construction in Nigeria"
            fill
            priority
            className="object-cover object-center lg:object-[center_30%] opacity-50 md:opacity-55 scale-102 transition-transform duration-700"
            sizes="100vw"
          />
        </div>
        {/* Directional Navy Gradient Overlays: Rich protection on left for text, opening up on right to reveal construction activity */}
        <div className="absolute inset-0 bg-gradient-to-r from-poab-navy via-poab-navy/90 to-poab-navy/55 lg:to-poab-navy/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-poab-navy via-poab-navy/35 to-poab-navy/60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Main Hero Value Proposition */}
          <div className="lg:col-span-7 xl:col-span-7">
            {/* Official Accreditation Label */}
            <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 bg-poab-navy-surface border border-poab-navy-muted/60 text-xs tracking-wider uppercase text-poab-gold mb-6 font-medium backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-poab-gold" />
              <span>RC {COMPANY_INFO.cacNumber} • Registered Nigerian Building Contractor</span>
            </div>

            {/* Official Tagline Heading */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-bold tracking-tight text-white leading-[1.15] mb-6">
              Building Houses That Stand The Test Of Time.
            </h1>

            {/* Supporting Construction Value Proposition */}
            <p className="text-base sm:text-lg md:text-xl text-poab-stone/90 leading-relaxed mb-8 max-w-2xl font-light">
              Hands-on site engineering delivering residential and commercial buildings across Lagos, Ibadan, and nationwide. We take full responsibility from deep trench excavation and solid foundation blockwork through to meticulous turnkey finishing.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3.5 sm:space-y-0 sm:space-x-4">
              <Link
                href="/request-quote"
                className="px-8 py-4 bg-poab-gold text-poab-navy font-semibold text-sm tracking-wider uppercase text-center hover:bg-poab-gold-light active:bg-poab-gold-dark transition-colors border border-poab-gold-dark flex items-center justify-center space-x-2 group shadow-sm"
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/projects"
                className="px-8 py-4 bg-poab-navy-surface/90 text-poab-stone hover:text-white hover:bg-poab-navy-muted text-sm tracking-wider uppercase text-center transition-colors border border-poab-navy-muted flex items-center justify-center space-x-2 backdrop-blur-xs"
              >
                <Compass className="w-4 h-4 text-poab-gold" />
                <span>View Our Projects</span>
              </Link>
            </div>

            {/* Core Customer Promise */}
            <div className="mt-10 pt-6 border-t border-poab-navy-surface/80 flex items-center space-x-3 text-xs text-poab-stone/75">
              <span className="w-2 h-2 rounded-full bg-poab-gold shrink-0" />
              <span>&ldquo;{COMPANY_INFO.customerPromise}&rdquo;</span>
            </div>
          </div>

          {/* Genuine Construction Site Feature Card (Preserves Aspect Ratio) */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm sm:max-w-md bg-poab-navy-surface border border-poab-navy-muted/70 p-3 shadow-xl relative group">
              {/* Corner Architectural Accent */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-poab-gold" />
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-poab-gold" />

              <div className="relative aspect-[3/4] w-full overflow-hidden bg-poab-navy">
                <Image
                  src="/images/projects/ogun-exterior.jpg"
                  alt="Ongoing residential apartment development by POAB Global Construction in Ogun State showing multi-level blockwork"
                  fill
                  priority
                  className="object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-poab-navy via-transparent to-transparent opacity-60" />

                <div className="absolute top-3 left-3 bg-poab-navy/90 backdrop-blur-xs border border-poab-gold/50 px-2.5 py-1 text-[11px] font-mono tracking-wider text-poab-gold uppercase">
                  Active Construction
                </div>
              </div>

              {/* Verified Project Badge */}
              <div className="p-3.5 bg-poab-navy text-left border-t border-poab-navy-muted/60 mt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>Residential Apartment Development</span>
                  <span className="text-poab-gold font-mono text-[11px]">Ongoing</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-poab-stone/80 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-poab-gold shrink-0" />
                  <span>Ogun State, Nigeria • Three mini-flats &amp; one self-contained flat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

