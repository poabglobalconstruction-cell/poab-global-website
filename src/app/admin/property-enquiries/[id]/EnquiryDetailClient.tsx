"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MessageCircle, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { PropertyEnquiry, PropertyEnquiryStatus } from "@/types/database";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate, buildWhatsAppLink } from "@/lib/utils";

const ENQUIRY_STATUSES: PropertyEnquiryStatus[] = [
  "New",
  "Contacted",
  "Scheduled Inspection",
  "Closed",
];

export function EnquiryDetailClient({ enquiry }: { enquiry: PropertyEnquiry }) {
  const router = useRouter();
  const [status, setStatus] = useState<PropertyEnquiryStatus>(enquiry.status);
  const [notes, setNotes] = useState(enquiry.internal_notes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const linkedProperty = enquiry.property;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/property-enquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: enquiry.id,
          status,
          internal_notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update enquiry");

      setStatusMessage("Status and internal notes saved successfully.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving");
    } finally {
      setIsLoading(false);
    }
  };

  const cleanPhone = enquiry.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = buildWhatsAppLink(
    enquiry.whatsapp || enquiry.phone,
    `Hello ${enquiry.name}, this is POAB Global regarding your enquiry on property "${linkedProperty?.title || ""}".`
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-poab-grey-border">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/property-enquiries"
            className="p-2 text-poab-charcoal/70 hover:text-poab-navy hover:bg-poab-stone"
            aria-label="Back to enquiries"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-xs text-poab-charcoal/60">
              Submitted: {formatDate(enquiry.created_at)}
            </div>
            <h2 className="font-heading text-xl font-bold text-poab-navy">
              Enquiry from {enquiry.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={`tel:${cleanPhone}`}
            className="p-2.5 bg-poab-navy text-white hover:bg-poab-navy-surface text-xs font-semibold uppercase flex items-center space-x-1"
          >
            <Phone className="w-3.5 h-3.5 text-poab-gold" />
            <span>Call</span>
          </a>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold uppercase flex items-center space-x-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          <a
            href={`mailto:${enquiry.email}`}
            className="p-2.5 bg-white border border-poab-grey-border text-poab-navy hover:bg-poab-stone text-xs font-semibold uppercase flex items-center space-x-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </a>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* Target Property Panel */}
          {linkedProperty ? (
            <div className="bg-poab-stone-light p-6 border border-poab-grey-border space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-poab-gold font-bold uppercase tracking-wider">
                  Target Property • REF: {linkedProperty.reference}
                </span>
                <span className="px-2 py-0.5 bg-poab-stone text-poab-navy font-semibold uppercase text-[10px]">
                  {linkedProperty.status}
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-poab-navy">
                {linkedProperty.title}
              </h3>
              <p className="text-poab-charcoal/80">
                <strong>Location:</strong> {linkedProperty.location}
              </p>
              <div className="pt-2 flex flex-wrap gap-4 border-t border-poab-grey-border">
                <Link
                  href={`/properties/${linkedProperty.slug}`}
                  target="_blank"
                  className="text-xs text-poab-navy font-semibold hover:text-poab-gold inline-flex items-center space-x-1"
                >
                  <span>↗ View Public Listing</span>
                </Link>
                <Link
                  href={`/admin/properties/${linkedProperty.id}`}
                  className="text-xs text-poab-navy font-semibold hover:text-poab-gold inline-flex items-center space-x-1"
                >
                  <span>✎ Manage Property in Admin</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-poab-stone-light p-6 border border-poab-grey-border space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-poab-charcoal/70 font-bold uppercase tracking-wider">
                  Target Property • {enquiry.property_reference ? `REF: ${enquiry.property_reference}` : "Deleted Listing"}
                </span>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 font-semibold uppercase text-[10px] tracking-wider border border-red-200">
                  Listing Deleted
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-poab-navy">
                {enquiry.property_title || "Preserved Property Listing"}
              </h3>
              <p className="text-poab-charcoal/70 text-xs leading-relaxed pt-1 border-t border-poab-grey-border">
                The original property listing associated with this enquiry has been permanently deleted. Lead contact details and enquiry snapshot data are preserved.
              </p>
            </div>
          )}

          {/* Customer Contact Details Panel */}
          <div className="bg-white border border-poab-grey-border p-6 shadow-xs space-y-4 text-xs">
            <span className="font-heading text-xs font-bold text-poab-navy uppercase tracking-wider block border-b border-poab-grey-border pb-2">
              Customer Contact Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block font-medium">
                  Full Name
                </span>
                <span className="font-semibold text-poab-navy text-sm">{enquiry.name}</span>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block font-medium">
                  Phone Number
                </span>
                <a href={`tel:${cleanPhone}`} className="font-semibold text-poab-navy hover:text-poab-gold">
                  {enquiry.phone}
                </a>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block font-medium">
                  Email Address
                </span>
                <a href={`mailto:${enquiry.email}`} className="font-semibold text-poab-navy hover:text-poab-gold">
                  {enquiry.email}
                </a>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block font-medium">
                  WhatsApp Number
                </span>
                <span className="font-semibold text-poab-navy">
                  {enquiry.whatsapp || enquiry.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Message */}
          <div className="bg-white border border-poab-grey-border p-6 shadow-xs space-y-3 text-xs">
            <span className="font-heading text-xs font-bold text-poab-navy uppercase tracking-wider block border-b border-poab-grey-border pb-2">
              Customer Message
            </span>
            <p className="text-sm font-light text-poab-charcoal leading-relaxed whitespace-pre-line">
              {enquiry.message}
            </p>
          </div>
        </div>

        {/* Right Column: Workflow update */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleUpdate}
            className="bg-white border border-poab-grey-border p-6 shadow-xs space-y-4"
          >
            <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-2">
              Lead Workflow Status
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyEnquiryStatus)}
                className="w-full px-4 py-2 bg-white border border-poab-grey-border text-poab-navy font-semibold text-xs"
              >
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Internal Inspection Notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record inspection date, client feedback, or negotiation details..."
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full text-xs uppercase tracking-wider font-semibold"
              isLoading={isLoading}
            >
              <Save className="w-4 h-4 mr-1.5" />
              <span>Save Lead Status</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
