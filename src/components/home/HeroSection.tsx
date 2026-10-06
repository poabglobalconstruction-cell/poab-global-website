import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Compass } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative bg-poab-navy text-white overflow-hidden border-b border-poab-navy-surface">
      {/* Subtle Background Pattern & Gradient Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-poab-navy via-poab-navy/95 to-poab-navy-surface/80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
          {/* Official Accreditation Label */}
          <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 bg-poab-navy-surface border border-poab-navy-muted/60 text-xs tracking-wider uppercase text-poab-gold mb-6 font-medium">
            <ShieldCheck className="w-4 h-4 text-poab-gold" />
            <span>RC {COMPANY_INFO.cacNumber} • Registered Nigerian Building Contractor</span>
          </div>

          {/* Official Tagline Heading */}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-6">
            Building Houses That Stand The Test Of Time.
          </h1>

          {/* Supporting Construction Value Proposition */}
          <p className="text-base sm:text-lg md:text-xl text-poab-stone/85 leading-relaxed mb-10 max-w-2xl font-light">
            Hands-on site engineering delivering residential and commercial buildings across Lagos, Ibadan, and nationwide. We take full responsibility from deep trench excavation and solid foundation blockwork through to meticulous turnkey finishing.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3.5 sm:space-y-0 sm:space-x-4">
            <Link
              href="/request-quote"
              className="px-8 py-4 bg-poab-gold text-poab-navy font-semibold text-sm tracking-wider uppercase text-center hover:bg-poab-gold-light active:bg-poab-gold-dark transition-colors border border-poab-gold-dark flex items-center justify-center space-x-2 group"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/projects"
              className="px-8 py-4 bg-poab-navy-surface text-poab-stone hover:text-white hover:bg-poab-navy-muted text-sm tracking-wider uppercase text-center transition-colors border border-poab-navy-muted flex items-center justify-center space-x-2"
            >
              <Compass className="w-4 h-4 text-poab-gold" />
              <span>View Our Projects</span>
            </Link>
          </div>

          {/* Core Customer Promise */}
          <div className="mt-12 pt-8 border-t border-poab-navy-surface flex items-center space-x-3 text-xs text-poab-stone/70">
            <span className="w-2 h-2 rounded-full bg-poab-gold" />
            <span>&ldquo;{COMPANY_INFO.customerPromise}&rdquo;</span>
          </div>
        </div>
      </div>
    </section>
  );
}
