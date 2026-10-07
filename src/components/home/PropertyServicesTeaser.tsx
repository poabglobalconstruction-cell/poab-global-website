import React from "react";
import Link from "next/link";
import { Building, ArrowRight, CheckCircle, Tag } from "lucide-react";

export function PropertyServicesTeaser() {
  return (
    <section className="py-16 bg-white border-b border-poab-grey-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-poab-stone-light border border-poab-grey-border p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Col 1 */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-poab-stone text-poab-navy text-xs font-semibold uppercase tracking-wider">
                <Building className="w-3.5 h-3.5 text-poab-gold" />
                <span>Property Services</span>
              </div>

              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-poab-navy">
                Property Sales &amp; Acquisition Support
              </h2>

              <p className="text-sm text-poab-charcoal/80 font-light leading-relaxed max-w-2xl">
                Alongside our core construction delivery, POAB also assists clients with property buying and selling opportunities. We help property owners market parcels or completed buildings, and guide prospective buyers through available listings.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs text-poab-charcoal/80 font-medium">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-poab-gold" />
                  <span>Document Review &amp; Site Inspection</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-poab-gold" />
                  <span>Structural Condition Assessments</span>
                </span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/properties"
                className="w-full py-3.5 px-6 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold text-center hover:bg-poab-navy-surface transition-colors flex items-center justify-center space-x-2"
              >
                <span>View Properties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/sell-property"
                className="w-full py-3 px-6 bg-white text-poab-navy border border-poab-navy/20 text-xs uppercase tracking-wider font-semibold text-center hover:bg-poab-stone transition-colors flex items-center justify-center space-x-2"
              >
                <Tag className="w-3.5 h-3.5 text-poab-gold" />
                <span>Sell With POAB</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
