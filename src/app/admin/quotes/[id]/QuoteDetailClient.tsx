"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
} from "lucide-react";
import { QuoteRequest, QuoteAttachment, QuoteStatus } from "@/types/database";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate, buildWhatsAppLink } from "@/lib/utils";

interface QuoteDetailClientProps {
  initialQuote: QuoteRequest;
  attachments: QuoteAttachment[];
}

const ALL_STATUSES: QuoteStatus[] = [
  "New",
  "Contacted",
  "Site Assessment",
  "Quotation Sent",
  "Won",
  "Lost",
  "Closed",
];

export function QuoteDetailClient({ initialQuote, attachments }: QuoteDetailClientProps) {
  const router = useRouter();
  const [quote, setQuote] = useState(initialQuote);
  const [status, setStatus] = useState<QuoteStatus>(initialQuote.status);
  const [notes, setNotes] = useState(initialQuote.internal_notes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/quotes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: quote.id,
          status,
          internal_notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update quote");

      setStatusMessage("Quote status and notes saved successfully.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving");
    } finally {
      setIsLoading(false);
    }
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadAttachment = async (attachmentId: string) => {
    try {
      setDownloadingId(attachmentId);
      const res = await fetch(
        `/api/admin/attachments?type=quote&recordId=${quote.id}&attachmentId=${attachmentId}`
      );
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to get download link");
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error downloading file");
    } finally {
      setDownloadingId(null);
    }
  };

  const cleanPhone = quote.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = buildWhatsAppLink(
    quote.whatsapp || quote.phone,
    `Hello ${quote.name}, this is POAB Global Construction Company Ltd regarding your construction quote request (${quote.reference}).`
  );

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-poab-grey-border">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/quotes"
            className="p-2 text-poab-charcoal/70 hover:text-poab-navy hover:bg-poab-stone"
            aria-label="Back to quotes"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-poab-gold">
                {quote.reference}
              </span>
              <span className="text-xs text-poab-charcoal/60">
                • {formatDate(quote.created_at)}
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold text-poab-navy">
              {quote.name}
            </h2>
          </div>
        </div>

        {/* Contact Shortcuts */}
        <div className="flex items-center space-x-2">
          <a
            href={`tel:${cleanPhone}`}
            className="p-2.5 bg-poab-navy text-white hover:bg-poab-navy-surface text-xs font-semibold uppercase flex items-center space-x-1"
            title="Call Client"
          >
            <Phone className="w-3.5 h-3.5 text-poab-gold" />
            <span className="hidden sm:inline">Call</span>
          </a>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold uppercase flex items-center space-x-1"
              title="Open WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          <a
            href={`mailto:${quote.email}?subject=POAB%20Global%20Construction%20Quote%20${quote.reference}`}
            className="p-2.5 bg-white border border-poab-grey-border text-poab-navy hover:bg-poab-stone text-xs font-semibold uppercase flex items-center space-x-1"
            title="Send Email"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Email</span>
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

      {/* Grid: Details vs Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scope & Contact Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Specifications Box */}
          <div className="bg-white border border-poab-grey-border p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-3">
              Project Details
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                  Category
                </span>
                <span className="font-bold text-poab-navy text-sm">{quote.project_type}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                  Site Location
                </span>
                <span className="font-bold text-poab-navy text-sm">{quote.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-poab-grey-border">
              <div>
                <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">Land Size</span>
                <span>{quote.land_size || "Not specified"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">Floors</span>
                <span>{quote.floors || "Not specified"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">Bedrooms</span>
                <span>{quote.bedrooms || "Not specified"}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-poab-grey-border text-xs">
              <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">
                Current Site Stage
              </span>
              <span className="font-medium text-poab-charcoal">{quote.current_stage}</span>
            </div>

            <div className="pt-2 border-t border-poab-grey-border text-xs">
              <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold mb-1">
                Project Scope &amp; Description
              </span>
              <p className="font-light text-poab-charcoal leading-relaxed whitespace-pre-line bg-poab-stone-light/50 p-3 border border-poab-grey-border">
                {quote.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-poab-grey-border">
              <div>
                <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">
                  Declared Budget Range
                </span>
                <span className="font-bold text-poab-navy">{quote.budget_range}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">
                  Target Timeline
                </span>
                <span>{quote.timeline}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-poab-grey-border text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">
                  Building Plan Ready?
                </span>
                <span className="font-semibold text-poab-navy">
                  {quote.has_building_plan ? "Yes (Drawings Provided)" : "No (Architectural Design Needed)"}
                </span>
              </div>
              {quote.project_inspiration && (
                <div className="text-right">
                  <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">
                    Inspiration / Ref
                  </span>
                  <span>{quote.project_inspiration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Attached Documents Box */}
          <div className="bg-white border border-poab-grey-border p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-3 flex items-center justify-between">
              <span>Attached Documents &amp; Plans</span>
              <span className="font-mono text-xs text-poab-gold">{attachments.length}</span>
            </h3>

            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-poab-stone-light border border-poab-grey-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate max-w-xs sm:max-w-sm">
                      <FileText className="w-4 h-4 text-poab-navy flex-shrink-0" />
                      <span className="font-medium text-poab-navy truncate">{att.file_name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] font-mono text-poab-charcoal/60">
                        {(att.file_size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(att.id)}
                        disabled={downloadingId === att.id}
                        className="px-2.5 py-1 bg-white border border-poab-grey-border hover:bg-poab-stone text-poab-navy font-semibold text-[11px] flex items-center space-x-1"
                        title="Download or view secure document"
                      >
                        <Download className="w-3.5 h-3.5 text-poab-gold" />
                        <span>{downloadingId === att.id ? "Loading..." : "View / Download"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-poab-charcoal/60 font-light">
                No drawings or documents were attached to this request.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Status & Internal Notes */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleUpdate}
            className="bg-white border border-poab-grey-border p-6 shadow-xs space-y-6"
          >
            <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-3">
              Enquiry Status &amp; Internal Notes
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-navy font-semibold text-sm focus:outline-none focus:border-poab-navy"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Internal Notes"
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record assessment notes, soil testing results, BOQ cost estimate, client calls, or site meeting schedules..."
              helperText="Private notes visible only to company staff."
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full text-xs uppercase tracking-wider font-semibold"
              isLoading={isLoading}
            >
              <Save className="w-4 h-4 mr-1.5" />
              <span>Save Status &amp; Notes</span>
            </Button>
          </form>

          {/* Client Contact Profile Box */}
          <div className="bg-poab-stone-light border border-poab-grey-border p-6 space-y-3 text-xs">
            <span className="font-heading font-bold text-poab-navy uppercase tracking-wider block border-b border-poab-grey-border pb-2">
              Client Contact Details
            </span>
            <div>
              <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">Phone</span>
              <span className="font-mono font-bold text-poab-navy">{quote.phone}</span>
            </div>
            {quote.whatsapp && (
              <div>
                <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">WhatsApp</span>
                <span className="font-mono text-poab-navy">{quote.whatsapp}</span>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">Email</span>
              <span className="text-poab-navy font-medium">{quote.email}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-poab-charcoal/60 block font-semibold">Preferred Channel</span>
              <span className="capitalize font-semibold text-poab-navy">{quote.preferred_contact}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
