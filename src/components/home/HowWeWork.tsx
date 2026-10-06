import React from "react";
import { MessageSquare, PhoneCall, Ruler, FileText, HardHat, Camera, KeyRound } from "lucide-react";

export function HowWeWork() {
  const steps = [
    {
      num: "01",
      icon: MessageSquare,
      title: "Tell Us About Your Project",
      desc: "Submit your building scope, location, architectural plan or basic site requirements via our quote intake.",
    },
    {
      num: "02",
      icon: PhoneCall,
      title: "Consultation",
      desc: "Direct review with our construction team to clarify structural expectations, materials, and priorities.",
    },
    {
      num: "03",
      icon: Ruler,
      title: "Site Assessment",
      desc: "Physical inspection of the parcel to assess soil condition, topography, access roads, and water table.",
    },
    {
      num: "04",
      icon: FileText,
      title: "Honest Quotation",
      desc: "Detailed quotation with realistic market material costs and transparent stage breakdown.",
    },
    {
      num: "05",
      icon: HardHat,
      title: "Construction Phase",
      desc: "Mobilization on site. Professional day-to-day supervision enforcing straight trenches, proper mix, and rebar integrity.",
    },
    {
      num: "06",
      icon: Camera,
      title: "Progress Updates",
      desc: "Scheduled photographic logs and stage reports delivered to you, keeping you informed regardless of where you reside.",
    },
    {
      num: "07",
      icon: KeyRound,
      title: "Handover",
      desc: "Joint snag check, thorough quality review, and official handover of your completed building.",
    },
  ];

  return (
    <section className="py-20 bg-poab-stone-light border-b border-poab-grey-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="inline-block px-2.5 py-1 bg-white text-poab-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-poab-grey-border">
            Project Workflow
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-poab-navy tracking-tight">
            How We Work With You
          </h2>
          <p className="mt-4 text-sm sm:text-base text-poab-charcoal/80 font-light leading-relaxed">
            From your initial concept to key handover, our engagement process is transparent, structured, and free of hidden surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-6 bg-white border border-poab-grey-border flex flex-col justify-between shadow-xs hover:border-poab-navy/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-sm font-bold text-poab-gold">
                      {step.num}
                    </span>
                    <div className="p-2 bg-poab-stone text-poab-navy">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-heading text-base font-bold text-poab-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-poab-charcoal/80 leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
