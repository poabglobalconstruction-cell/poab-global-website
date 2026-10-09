"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Mail,
  ShieldCheck,
  HardHat,
  Home,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
} from "lucide-react";
import { COMPANY_INFO, DEPARTMENT_EMAILS } from "@/lib/constants";
import { PublicContactSettings } from "@/lib/contact-settings";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidPhoneNumber } from "@/lib/validation";

interface ContactClientProps {
  contact: PublicContactSettings;
}

export function ContactClient({ contact }: ContactClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    honeypot: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Full name is required (at least 2 characters).";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }
    if (formData.phone.trim() && !isValidPhoneNumber(formData.phone)) {
      errors.phone = "Please enter a valid phone number (e.g. 08012345678 or +234...).";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = "Please enter your message (at least 10 characters).";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorMessage(Object.values(errors)[0]);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate clicks
    if (!validate()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Atmospheric Construction Backdrop */}
      <section className="relative bg-poab-navy text-white py-16 sm:py-24 border-b border-poab-navy-surface overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

        {/* Atmospheric Construction Backdrop (Sub-Structure & Blockwork Activity) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/illustrative/nigeria-foundation-work.jpg"
            alt="Active building construction site engineering in Nigeria"
            fill
            priority
            className="object-cover object-[center_25%] opacity-45 md:opacity-50 scale-102"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-poab-navy via-poab-navy/90 to-poab-navy/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-poab-navy via-transparent to-poab-navy/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block px-2.5 py-1 bg-poab-navy-surface text-poab-gold text-xs uppercase tracking-wider mb-4 border border-poab-navy-muted backdrop-blur-xs">
              Direct Communication
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Let&apos;s Discuss Your Project.
            </h1>
            <p className="text-base sm:text-lg text-poab-stone/85 font-light leading-relaxed">
              Have questions regarding our construction capabilities, active building sites, or property acquisition? Reach out to our operational team.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Col 1: Verified Information */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-wider text-poab-gold font-bold block mb-1">
                Official Directory
              </span>
              <h2 className="font-heading text-2xl font-bold text-poab-navy">
                Corporate &amp; Operational Base
              </h2>
              <p className="text-sm text-poab-charcoal/80 font-light mt-2 leading-relaxed">
                POAB Global Construction Company Ltd coordinates project teams, surveying, and material logistics from our central administrative office in Oyo State.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-poab-grey-border">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-poab-stone text-poab-navy flex-shrink-0">
                  <MapPin className="w-5 h-5 text-poab-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                    Head Office
                  </h3>
                  <p className="text-sm text-poab-charcoal/85 mt-1 font-light">
                    {contact.office_address || COMPANY_INFO.headOffice}
                  </p>
                  <span className="text-xs text-poab-charcoal/60 block mt-0.5">
                    Central management and project coordination
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-poab-stone text-poab-navy flex-shrink-0">
                  <HardHat className="w-5 h-5 text-poab-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                    Site Operations
                  </h3>
                  <p className="text-sm text-poab-charcoal/85 mt-1 font-light">
                    {COMPANY_INFO.operationsCoverage}
                  </p>
                  <span className="text-xs text-poab-charcoal/60 block mt-0.5">
                    Active mobilization on residential and commercial building sites
                  </span>
                </div>
              </div>

              {contact.public_phone && (
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-poab-stone text-poab-navy flex-shrink-0">
                    <Phone className="w-5 h-5 text-poab-gold" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                      Official Telephone
                    </h3>
                    <a
                      href={`tel:${contact.public_phone.replace(/\s+/g, "")}`}
                      className="text-sm font-medium text-poab-navy hover:text-poab-gold transition-colors block mt-1"
                    >
                      {contact.public_phone}
                    </a>
                    <span className="text-xs text-poab-charcoal/60 block mt-0.5">
                      Direct office line &amp; operational inquiries
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-poab-stone text-poab-navy flex-shrink-0">
                  <Mail className="w-5 h-5 text-poab-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                    Official Business Email
                  </h3>
                  <a
                    href={`mailto:${contact.official_email}`}
                    className="text-sm font-medium text-poab-navy hover:text-poab-gold transition-colors block mt-1"
                  >
                    {contact.official_email}
                  </a>
                  <span className="text-xs text-poab-charcoal/60 block mt-0.5">
                    General enquiries &amp; corporate communications
                  </span>
                </div>
              </div>

              {contact.business_hours && (
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-poab-stone text-poab-navy flex-shrink-0">
                    <Clock className="w-5 h-5 text-poab-gold" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                      Operating Hours
                    </h3>
                    <p className="text-sm text-poab-charcoal/85 mt-1 font-light">
                      {contact.business_hours}
                    </p>
                    <span className="text-xs text-poab-charcoal/60 block mt-0.5">
                      Administrative &amp; consultation schedule
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-poab-stone text-poab-navy flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-poab-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                    Legal Registration
                  </h3>
                  <p className="text-sm font-mono text-poab-charcoal/85 mt-1">
                    {COMPANY_INFO.rcNumber}
                  </p>
                  <span className="text-xs text-poab-charcoal/60 block mt-0.5">
                    Corporate Affairs Commission (CAC) Registered Contractor
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: General Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-poab-stone-light border border-poab-grey-border p-8 sm:p-10 shadow-xs">
              <h2 className="font-heading text-xl font-bold text-poab-navy mb-2">
                Send a General Message
              </h2>
              <p className="text-xs sm:text-sm text-poab-charcoal/70 mb-8 font-light">
                For detailed construction quotes or building plan uploads, please use our dedicated{" "}
                <Link href="/request-quote" className="text-poab-gold font-semibold underline">
                  Request a Quote form
                </Link>
                .
              </p>

              {isSuccess ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h3 className="font-heading text-lg font-bold text-emerald-950">
                    Thank You — Your Message Has Been Sent
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 font-light mt-2 max-w-md mx-auto">
                    Thank you for contacting POAB Global Construction Company Ltd. Our team will review your message and get in touch with you.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="honeypot"
                      value={formData.honeypot}
                      onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <Input
                    label="Full Name"
                    required
                    value={formData.name}
                    error={fieldErrors.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                    }}
                    placeholder="e.g., Kayode Adeleke"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      value={formData.email}
                      error={fieldErrors.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                      }}
                      placeholder="e.g., kayode@example.com"
                    />
                    <Input
                      label="Phone Number (Optional)"
                      type="tel"
                      value={formData.phone}
                      error={fieldErrors.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
                      }}
                      placeholder="e.g., 0801 234 5678 or +234..."
                      helperText="Optional: Nigerian 11-digit or +234 format."
                    />
                  </div>

                  <Input
                    label="Subject (Optional)"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Site consultation enquiry"
                  />

                  <Textarea
                    label="Message"
                    required
                    rows={4}
                    value={formData.message}
                    error={fieldErrors.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: "" });
                    }}
                    placeholder="How can our construction or property team assist you?"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full text-xs uppercase tracking-wider py-4 font-semibold"
                    isLoading={isLoading}
                  >
                    <Send className="w-4 h-4 mr-2 text-poab-gold" />
                    <span>Send Message to POAB</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Departmental Routing Section */}
      <section className="bg-poab-stone-light/60 border-t border-poab-grey-border py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs uppercase tracking-wider text-poab-gold font-bold block mb-1">
              Direct Departmental Routing
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-poab-navy">
              Get in Touch With the Right Team
            </h2>
            <p className="text-sm text-poab-charcoal/80 font-light mt-2 leading-relaxed">
              Connect directly with our specialized teams for faster response times tailored to your specific project or property enquiry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. General Enquiries */}
            <div className="bg-white border border-poab-grey-border p-6 flex flex-col justify-between shadow-2xs hover:border-poab-gold transition-colors">
              <div>
                <div className="w-10 h-10 bg-poab-stone flex items-center justify-center text-poab-navy mb-4">
                  <Mail className="w-5 h-5 text-poab-gold" />
                </div>
                <h3 className="font-heading text-base font-bold text-poab-navy">
                  General Enquiries
                </h3>
                <p className="text-xs text-poab-charcoal/75 mt-2 leading-relaxed font-light">
                  Corporate communications, media queries, administrative matters, and general information.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-poab-grey-border/60">
                <a
                  href={`mailto:${contact.official_email}`}
                  className="text-xs font-mono font-semibold text-poab-navy hover:text-poab-gold transition-colors break-all block"
                >
                  {contact.official_email}
                </a>
              </div>
            </div>

            {/* 2. Building Projects & Quotations */}
            <div className="bg-white border border-poab-grey-border p-6 flex flex-col justify-between shadow-2xs hover:border-poab-gold transition-colors">
              <div>
                <div className="w-10 h-10 bg-poab-stone flex items-center justify-center text-poab-navy mb-4">
                  <HardHat className="w-5 h-5 text-poab-gold" />
                </div>
                <h3 className="font-heading text-base font-bold text-poab-navy">
                  Building Projects &amp; Quotes
                </h3>
                <p className="text-xs text-poab-charcoal/75 mt-2 leading-relaxed font-light">
                  New building tenders, architectural plan submissions, Bill of Quantities (BOQ), and site quotes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-poab-grey-border/60">
                <a
                  href={`mailto:${DEPARTMENT_EMAILS.projects}`}
                  className="text-xs font-mono font-semibold text-poab-navy hover:text-poab-gold transition-colors break-all block"
                >
                  {DEPARTMENT_EMAILS.projects}
                </a>
              </div>
            </div>

            {/* 3. Properties & Land Acquisition */}
            <div className="bg-white border border-poab-grey-border p-6 flex flex-col justify-between shadow-2xs hover:border-poab-gold transition-colors">
              <div>
                <div className="w-10 h-10 bg-poab-stone flex items-center justify-center text-poab-navy mb-4">
                  <Home className="w-5 h-5 text-poab-gold" />
                </div>
                <h3 className="font-heading text-base font-bold text-poab-navy">
                  Properties &amp; Acquisitions
                </h3>
                <p className="text-xs text-poab-charcoal/75 mt-2 leading-relaxed font-light">
                  Verified land purchases, residential properties, seller representation, and document vetting.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-poab-grey-border/60">
                <a
                  href={`mailto:${DEPARTMENT_EMAILS.properties}`}
                  className="text-xs font-mono font-semibold text-poab-navy hover:text-poab-gold transition-colors break-all block"
                >
                  {DEPARTMENT_EMAILS.properties}
                </a>
              </div>
            </div>

            {/* 4. Client Service & Site Support */}
            <div className="bg-white border border-poab-grey-border p-6 flex flex-col justify-between shadow-2xs hover:border-poab-gold transition-colors">
              <div>
                <div className="w-10 h-10 bg-poab-stone flex items-center justify-center text-poab-navy mb-4">
                  <ShieldCheck className="w-5 h-5 text-poab-gold" />
                </div>
                <h3 className="font-heading text-base font-bold text-poab-navy">
                  Client Service &amp; Support
                </h3>
                <p className="text-xs text-poab-charcoal/75 mt-2 leading-relaxed font-light">
                  Active project supervision updates, site visit scheduling, ongoing client assistance, and handover support.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-poab-grey-border/60">
                <a
                  href={`mailto:${DEPARTMENT_EMAILS.service}`}
                  className="text-xs font-mono font-semibold text-poab-navy hover:text-poab-gold transition-colors break-all block"
                >
                  {DEPARTMENT_EMAILS.service}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
