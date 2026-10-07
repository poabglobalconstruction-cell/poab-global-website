import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home, Building2, Hammer, Shield, CheckCircle } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Services",
  description: `Comprehensive construction capabilities by POAB Global Construction Company Ltd. Residential building, commercial construction, renovation, perimeter fencing, and property services across Nigeria.`,
};

export default function ServicesPage() {
  const services = [
    {
      id: "building-construction",
      icon: Home,
      title: "1. Building Construction",
      tagline: "Turnkey Residential & Commercial Delivery",
      description:
        "We handle complete building construction from site survey and foundation casting through to roof installation, screeding, tiling, and painting. We execute custom architectural designs with structural precision.",
      offerings: [
        {
          name: "Detached & Semi-Detached Duplexes",
          desc: "Engineered multi-level residential homes with reinforced columns, beam cantilevers, and modern facades.",
        },
        {
          name: "Contemporary Bungalows",
          desc: "Spacious single-level residential dwellings built with disciplined foundation blockwork and high-grade roofing.",
        },
        {
          name: "Luxury Homes & Villas with Swimming Pools",
          desc: "Bespoke high-end residential homes featuring integrated swimming pools and spacious outdoor terraces.",
        },
        {
          name: "Apartment Blocks & Self-Contained Units",
          desc: "Multi-tenant flats and residential rental developments structured for optimal spatial efficiency and long-term durability.",
        },
        {
          name: "Commercial & Business Structures",
          desc: "Retail complexes, corporate offices, and shopping plazas engineered for high foot traffic and robust load-bearing.",
        },
      ],
      quoteType: "Residential",
    },
    {
      id: "renovation-finishing",
      icon: Hammer,
      title: "2. Renovation & Finishing",
      tagline: "Structural Restoration & Modern Turnkey Upgrades",
      description:
        "Transforming dated, compromised, or partially completed buildings into structurally sound, modern properties. We breathe new life into existing structures without cutting corners.",
      offerings: [
        {
          name: "Structural Remodeling & Space Reconfiguration",
          desc: "Careful demolition of non-load-bearing partitions, reinforcement of existing load paths, and modernized room layouts.",
        },
        {
          name: "Completion of Unfinished Carcasses",
          desc: "Conducting structural condition assessments on uncompleted structures and completing masonry, electrical, plumbing, and finishing.",
        },
        {
          name: "Interior & Exterior Finishing",
          desc: "Flawless wall screeding, POP ceiling casting, marble & ceramic tile laying, and weatherproof exterior finishes.",
        },
        {
          name: "Conduit Plumbing & Electrical Upgrades",
          desc: "Replacing outdated wiring and corroded plumbing networks with compliant, pressure-tested conduits and high-efficiency fixtures.",
        },
      ],
      quoteType: "Renovation",
    },
    {
      id: "site-perimeter-works",
      icon: Shield,
      title: "3. Site & Perimeter Works",
      tagline: "Sub-Structure Casting, Boundary Fencing & Site Securing",
      description:
        "Protecting your land asset immediately upon acquisition. We install straight, structurally fortified perimeter fencing to ward off encroachment and execute heavy sub-structure foundations.",
      offerings: [
        {
          name: "Perimeter Security Fencing",
          desc: "Heavy-duty foundation trenches, hollow-block masonry fully cast with concrete columns, and integrated razor wire or coping.",
        },
        {
          name: "Site Clearing, Setting Out & Grading",
          desc: "Accurate physical pegging based on survey coordinates, bush clearing, soil removal, and site level stabilization.",
        },
        {
          name: "Retaining Walls & Drainage Channels",
          desc: "Reinforced retaining masonry preventing erosion and managing surface runoff on sloped terrains.",
        },
        {
          name: "Deep Trench Foundation Casting",
          desc: "Excavation to firm ground, structured steel reinforcement, and solid concrete footing pours.",
        },
      ],
      quoteType: "Perimeter / Site Work",
    },
    {
      id: "property-services",
      icon: Building2,
      title: "4. Property Services",
      tagline: "Property Sales & Acquisition Support",
      description:
        "A complementary service assisting clients with property buying and selling opportunities, connecting prospective homeowners with available parcels and completed homes.",
      offerings: [
        {
          name: "Property Listings & Sales",
          desc: "Presenting reviewed parcels of land and built homes in established neighbourhoods across Ibadan, Lagos, and surrounding states.",
        },
        {
          name: "Seller Representation (Sell With POAB)",
          desc: "Assisting property owners with listing presentation, property documentation review, and structured buyer engagement.",
        },
        {
          name: "Site Inspection & Document Review",
          desc: "Conducting preliminary site visits and document checks to give buyers and sellers clarity before proceeding with transactions.",
        },
      ],
      quoteType: "Other",
    },
  ];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-poab-navy text-white py-16 sm:py-24 border-b border-poab-navy-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block px-2.5 py-1 bg-poab-navy-surface text-poab-gold text-xs uppercase tracking-wider mb-4 border border-poab-navy-muted">
              Scope of Construction Services
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Complete Building Delivery From Foundation to Finishing.
            </h1>
            <p className="text-base sm:text-lg text-poab-stone/85 font-light leading-relaxed">
              Explore our four core operational divisions. Whether constructing a multi-level duplex, securing virgin land with heavy-duty fencing, or exploring property opportunities, POAB brings 11 years of hands-on site engineering experience.
            </p>
          </div>
        </div>
      </section>

      {/* Services Breakdown */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <section
                key={service.id}
                id={service.id}
                className="scroll-mt-28 border border-poab-grey-border p-8 sm:p-12 bg-poab-stone-light/40"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-8 pb-8 border-b border-poab-grey-border">
                  <div className="max-w-2xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2.5 bg-poab-navy text-poab-gold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-poab-navy/70">
                        {service.tagline}
                      </span>
                    </div>

                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-poab-navy">
                      {service.title}
                    </h2>

                    <p className="mt-4 text-sm sm:text-base text-poab-charcoal/85 leading-relaxed font-light">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <Link
                      href={`/request-quote?type=${encodeURIComponent(service.quoteType)}`}
                      className="inline-flex items-center space-x-2 px-6 py-3.5 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold hover:bg-poab-navy-surface transition-colors"
                    >
                      <span>Discuss Your Project</span>
                      <ArrowRight className="w-4 h-4 text-poab-gold" />
                    </Link>
                  </div>
                </div>

                {/* Offerings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {service.offerings.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-5 bg-white border border-poab-grey-border flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start space-x-2.5">
                          <CheckCircle className="w-4 h-4 text-poab-gold flex-shrink-0 mt-0.5" />
                          <h3 className="font-heading text-sm font-bold text-poab-navy">
                            {item.name}
                          </h3>
                        </div>
                        <p className="mt-2 text-xs text-poab-charcoal/80 leading-relaxed font-light pl-6">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-poab-navy text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-4">
            Need an Honest Quotation for Your Project?
          </h2>
          <p className="text-sm text-poab-stone/85 font-light mb-8 max-w-xl mx-auto">
            Share your building plans, site coordinates, or project ideas. Our project team will review and provide a structured proposal.
          </p>
          <Link
            href="/request-quote"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-poab-gold text-poab-navy font-semibold text-xs uppercase tracking-wider hover:bg-poab-gold-light transition-colors"
          >
            <span>Request a Quote</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
