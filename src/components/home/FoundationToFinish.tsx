import React from "react";
import { CONSTRUCTION_STAGES } from "@/lib/constants";

export function FoundationToFinish() {
  return (
    <section className="py-20 bg-poab-navy text-white border-b border-poab-navy-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16">
          <div className="inline-block px-2.5 py-1 bg-poab-navy-surface text-poab-gold text-xs font-semibold uppercase tracking-wider mb-3 border border-poab-navy-muted">
            End-to-End Delivery
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            The Foundation-to-Finish Methodology
          </h2>
          <p className="mt-4 text-sm sm:text-base text-poab-stone/80 font-light leading-relaxed">
            Building in Nigeria demands disciplined site leadership. We take clients through an orderly, step-by-step construction progression with photographic proof at every milestone.
          </p>
        </div>

        {/* Architectural Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {CONSTRUCTION_STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className="p-5 bg-poab-navy-surface border border-poab-navy-muted/60 flex flex-col justify-between hover:border-poab-gold/50 transition-colors relative group"
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-poab-gold font-bold tracking-wider">
                  0{index + 1}
                </span>
                <span className="w-2 h-2 rounded-full bg-poab-navy-muted group-hover:bg-poab-gold transition-colors" />
              </div>

              <div>
                <h3 className="font-heading text-sm font-bold text-white mb-2 leading-snug">
                  {stage.title}
                </h3>
                <p className="text-xs text-poab-stone/75 leading-relaxed font-light">
                  {stage.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-poab-navy-muted/40 text-[10px] uppercase tracking-wider text-poab-gold/80 font-mono">
                Stage {index + 1} of 7
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
