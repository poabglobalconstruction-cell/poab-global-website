import React from "react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/constants";
import { getPublicContactSettings } from "@/lib/contact-settings";
import { ShieldCheck, MapPin, Mail, HardHat, Phone } from "lucide-react";

export async function Footer() {
  const contact = await getPublicContactSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-poab-navy text-poab-stone border-t border-poab-navy-surface pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-10 h-12 flex-shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/poab-pillar.svg"
                  alt="POAB Global Monogram Pillar Logo"
                  width={40}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-bold tracking-wider text-white block leading-tight">
                  POAB GLOBAL
                </span>
                <span className="text-[11px] text-poab-gold uppercase tracking-[0.2em] font-medium block leading-tight">
                  Construction Company Ltd
                </span>
              </div>
            </div>
            <p className="text-sm text-poab-stone/80 leading-relaxed">
              &ldquo;{COMPANY_INFO.tagline}&rdquo;
            </p>
            <div className="pt-2 space-y-2 text-xs text-poab-stone/70">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-poab-gold flex-shrink-0" />
                <span>Incorporated in Nigeria • {COMPANY_INFO.rcNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HardHat className="w-4 h-4 text-poab-gold flex-shrink-0" />
                <span>{COMPANY_INFO.experienceStatement}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-poab-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-poab-gold transition-colors">
                  About POAB
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-poab-gold transition-colors">
                  Construction Services
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-poab-gold transition-colors">
                  Projects &amp; Portfolio
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-poab-gold transition-colors">
                  Property Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-poab-gold transition-colors">
                  Contact Office
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Construction Scope */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Scope of Delivery
            </h4>
            <ul className="space-y-2.5 text-sm text-poab-stone/80">
              <li>Residential Homes & Duplexes</li>
              <li>Bungalows & Apartments</li>
              <li>Commercial Construction</li>
              <li>Renovation & Modern Finishing</li>
              <li>Perimeter Fencing & Site Securing</li>
              <li>Foundation to Finish Delivery</li>
            </ul>
          </div>

          {/* Col 4: Verified Operating Details */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Operations & Contact
            </h4>
            <div className="space-y-3 text-sm text-poab-stone/80">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-poab-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">Head Office:</span>
                  <span>{contact.office_address || COMPANY_INFO.headOffice}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-poab-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">Coverage:</span>
                  <span>{COMPANY_INFO.operationsCoverage}</span>
                </div>
              </div>

              {contact.public_phone && (
                <div className="flex items-start space-x-2.5">
                  <Phone className="w-4 h-4 text-poab-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-medium text-white">Phone:</span>
                    <a
                      href={`tel:${contact.public_phone.replace(/\s+/g, "")}`}
                      className="hover:text-poab-gold transition-colors"
                    >
                      {contact.public_phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-poab-gold flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">Official Email:</span>
                  <a
                    href={`mailto:${contact.official_email}`}
                    className="hover:text-poab-gold transition-colors"
                  >
                    {contact.official_email}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-poab-navy-surface">
              <Link
                href="/request-quote"
                className="inline-block px-4 py-2 bg-poab-navy-surface text-poab-gold hover:bg-poab-navy-muted transition-colors text-xs uppercase font-medium tracking-wider border border-poab-navy-muted"
              >
                Start a Project
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 border-t border-poab-navy-surface flex flex-col sm:flex-row justify-between items-center text-xs text-poab-stone/60 space-y-4 sm:space-y-0">
          <div>
            © {currentYear} {COMPANY_INFO.name}. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-poab-stone transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
