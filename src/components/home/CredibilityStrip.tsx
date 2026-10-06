import React from "react";
import { HardHat, ShieldCheck, Layers, MapPin } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export function CredibilityStrip() {
  const points = [
    {
      icon: HardHat,
      title: "11 Years Site Experience",
      subtitle: "Hands-on supervision on real construction sites",
    },
    {
      icon: ShieldCheck,
      title: `CAC Registered • ${COMPANY_INFO.rcNumber}`,
      subtitle: "Incorporated Nigerian building contractor",
    },
    {
      icon: Layers,
      title: "Foundation to Finish",
      subtitle: "Full single-source project accountability",
    },
    {
      icon: MapPin,
      title: "Lagos & Nationwide",
      subtitle: "Head office Ibadan, active operations nationwide",
    },
  ];

  return (
    <section className="bg-poab-stone-light border-b border-poab-grey-border py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {points.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-white border border-poab-grey-border shadow-xs"
              >
                <div className="p-2.5 bg-poab-navy text-poab-gold flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                    {point.title}
                  </h3>
                  <p className="text-xs text-poab-charcoal/80 mt-1 leading-normal font-light">
                    {point.subtitle}
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
