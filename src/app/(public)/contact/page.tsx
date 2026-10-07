"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Mail, ShieldCheck, HardHat, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidPhoneNumber } from "@/lib/validation";

export default function ContactPage() {
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
      {/* Header */}
      <section className="bg-poab-navy text-white py-16 sm:py-24 border-b border-poab-navy-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block px-2.5 py-1 bg-poab-navy-surface text-poab-gold text-xs uppercase tracking-wider mb-4 border border-poab-navy-muted">
              Direct Communication
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Contact Our Head Office &amp; Project Locations.
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
                    {COMPANY_INFO.headOffice}
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

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-poab-stone text-poab-navy flex-shrink-0">
                  <Mail className="w-5 h-5 text-poab-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                    Official Business Email
                  </h3>
                  <a
                    href={`mailto:${COMPANY_INFO.officialEmail}`}
                    className="text-sm font-medium text-poab-navy hover:text-poab-gold transition-colors block mt-1"
                  >
                    {COMPANY_INFO.officialEmail}
                  </a>
                  <span className="text-xs text-poab-charcoal/60 block mt-0.5">
                    Direct ownership &amp; client correspondence
                  </span>
                </div>
              </div>

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
                    Message Dispatched Successfully
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 font-light mt-2 max-w-md mx-auto">
                    Thank you for contacting POAB Global Construction Company Ltd. Your enquiry has been received and routed to our team.
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
    </div>
  );
}
