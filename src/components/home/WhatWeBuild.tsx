import React from "react";
import Link from "next/link";
import { ArrowRight, Home, Building2, Hammer, Shield } from "lucide-react";

export function WhatWeBuild() {
  const serviceGroups = [
    {
      id: "residential",
      icon: Home,
      title: "Residential Construction",
      tagline: "Bungalows, Duplexes & Luxury Homes",
      description:
        "Engineered residential construction tailored for Nigerian terrain and climate. From contemporary duplexes to modern bungalows and bespoke family residences.",
      scopeList: [
        "Storey duplexes & mansions",
        "Modern detached bungalows",
        "Apartment blocks & flats",
        "Homes with private swimming pools",
      ],
      quoteParam: "Residential",
    },
    {
      id: "commercial",
      icon: Building2,
      title: "Commercial Construction",
      tagline: "Purpose-Built Business Structures",
      description:
        "Functional, robust commercial structures constructed with heavy-duty structural concrete, strict deadline adherence, and professional project management.",
      scopeList: [
        "Commercial shopping plazas",
        "Corporate office buildings",
        "Warehouses & storage facilities",
        "Hospitality & mixed-use units",
      ],
      quoteParam: "Commercial",
    },
    {
      id: "renovation",
      icon: Hammer,
      title: "Renovation & Finishing",
      tagline: "Structural Upgrades & Turnkey Finishing",
      description:
        "Revitalizing existing structures, finishing abandoned or partially built carcasses, and executing premium interior screeding, tiling, plumbing, and electrical installations.",
      scopeList: [
        "Complete structural remodeling",
        "Completion of unfinished buildings",
        "High-grade floor tiling & screeding",
        "Conduit plumbing & electrical fitting",
      ],
      quoteParam: "Renovation",
    },
    {
      id: "site-works",
      icon: Shield,
      title: "Site & Perimeter Works",
      tagline: "Foundations, Perimeter Fencing & Securing",
      description:
        "Securing land parcels before development, perimeter blockwork, gate installations, and durable foundation structural works.",
      scopeList: [
        "Perimeter security fence construction",
        "Site clearing, levelling & boundary setting",
        "Retaining walls & drainage channels",
        "Foundation sub-structure casting",
      ],
      quoteParam: "Perimeter / Site Work",
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-poab-grey-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-block px-2.5 py-1 bg-poab-stone text-poab-navy text-xs font-semibold uppercase tracking-wider mb-3">
            Core Construction Scope
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-poab-navy tracking-tight">
            What We Build Across Nigeria
          </h2>
          <p className="mt-4 text-sm sm:text-base text-poab-charcoal/80 font-light leading-relaxed">
            Every building structure executed by POAB Global Construction is overseen by experienced site supervisors who understand practical building science and honest material application.
          </p>
        </div>

        {/* 4 Architectural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {serviceGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.id}
                className="p-8 bg-poab-stone-light border border-poab-grey-border flex flex-col justify-between hover:border-poab-navy/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-poab-navy text-poab-gold flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs uppercase font-semibold text-poab-charcoal/60 tracking-wider">
                      {group.tagline}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-poab-navy group-hover:text-poab-gold transition-colors">
                    {group.title}
                  </h3>

                  <p className="mt-3 text-sm text-poab-charcoal/85 leading-relaxed font-light">
                    {group.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-poab-grey-border">
                    <span className="text-xs font-bold text-poab-navy uppercase tracking-wider block mb-3">
                      Included Scope:
                    </span>
                    <ul className="space-y-1.5 text-xs text-poab-charcoal/80">
                      {group.scopeList.map((item, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-poab-gold flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-poab-grey-border flex items-center justify-between">
                  <Link
                    href={`/services#${group.id}`}
                    className="text-xs font-semibold uppercase tracking-wider text-poab-navy hover:text-poab-gold flex items-center space-x-1.5"
                  >
                    <span>Full Service Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/request-quote?type=${encodeURIComponent(group.quoteParam)}`}
                    className="px-4 py-2 bg-poab-navy text-poab-stone text-xs uppercase font-medium tracking-wider hover:bg-poab-navy-surface hover:text-white transition-colors"
                  >
                    Request a Quote
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
