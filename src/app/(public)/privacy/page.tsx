import React from "react";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import { getPublicContactSettings } from "@/lib/contact-settings";

export const metadata: Metadata = {
  title: {
    absolute: "Privacy Policy | POAB Global Construction",
  },
  description: `Privacy policy and client data handling practices for ${COMPANY_INFO.name}.`,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | POAB Global Construction",
    description: `Privacy policy and client data handling practices for ${COMPANY_INFO.name}.`,
    url: "/privacy",
    type: "website",
    images: [{ url: "/brand/poab-logo.svg", width: 800, height: 600, alt: "POAB Global Privacy Policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | POAB Global Construction",
    description: `Privacy policy and client data handling practices for ${COMPANY_INFO.name}.`,
    images: ["/brand/poab-logo.svg"],
  },
};

export default async function PrivacyPage() {
  const contact = await getPublicContactSettings();
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-poab-grey-border pb-8 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-poab-stone-light text-poab-navy text-xs uppercase tracking-wider mb-4 border border-poab-grey-border">
            <ShieldCheck className="w-4 h-4 text-poab-gold" />
            <span>Information Governance</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-poab-navy">
            Privacy Policy &amp; Data Handling
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-poab-charcoal/70 font-light">
            Effective Date: October 2026 • {COMPANY_INFO.name} ({COMPANY_INFO.rcNumber})
          </p>
        </div>

        <div className="prose max-w-none text-poab-charcoal/85 space-y-8 text-sm leading-relaxed font-light">
          <section>
            <h2 className="font-heading text-lg font-bold text-poab-navy mb-3">
              1. Scope of This Policy
            </h2>
            <p>
              This Privacy Policy explains how <strong>{COMPANY_INFO.name}</strong> (&ldquo;POAB,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) collects, uses, and safeguards information provided through our official website. We value client privacy and treat all construction documents and property records with professional discretion.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-poab-navy mb-3">
              2. Information We Collect
            </h2>
            <p>
              We collect information that you deliberately provide to us through our website, including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong>Construction Quote Inquiries:</strong> Full name, telephone number, WhatsApp contact, email address, project site location, building scope, target budget selection, and timeline preferences.
              </li>
              <li>
                <strong>Architectural Plans &amp; Document Uploads:</strong> Architectural drawings, structural plans, site sketches, or photos uploaded through our quote form or property sale submission.
              </li>
              <li>
                <strong>Seller Representation Requests:</strong> Seller name, phone number, email address, property location, title description, asking price, and uploaded survey/title documents.
              </li>
              <li>
                <strong>Property Inspection Enquiries:</strong> Name, phone number, email, and inspection scheduling requests regarding listed properties.
              </li>
              <li>
                <strong>General Correspondence:</strong> Name, email, and message content submitted via our contact form.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-poab-navy mb-3">
              3. How We Use Collected Information
            </h2>
            <p>Information submitted is used exclusively for legitimate business purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>To evaluate construction feasibility and prepare honest quotations.</li>
              <li>To conduct physical site inspections and schedule project assessments.</li>
              <li>To review property ownership documents for seller listings.</li>
              <li>To contact you regarding your submitted inquiries via your preferred method.</li>
              <li>To maintain project records and enquiry references.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-poab-navy mb-3">
              4. Storage &amp; Document Security
            </h2>
            <p>
              All customer attachments (including architectural building plans and property documents) are securely stored and protected by restricted access controls. We do not expose uploaded customer documents on the public website.
            </p>
            <p className="mt-2">
              We never sell, trade, or rent client contact details to external marketing agencies or lead aggregators.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-poab-navy mb-3">
              5. Data Retention &amp; Inquiries
            </h2>
            <p>
              We retain lead submissions for the duration of the project inquiry or as needed for business and audit records. If you wish to update or request the removal of your contact details from our records, please contact our administrative team at{" "}
              <a
                href={`mailto:${contact.official_email}`}
                className="text-poab-gold font-semibold underline"
              >
                {contact.official_email}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
