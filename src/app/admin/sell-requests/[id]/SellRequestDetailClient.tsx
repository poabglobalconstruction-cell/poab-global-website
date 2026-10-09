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
} from "lucide-react";
import { SellPropertyRequest, SellPropertyAttachment, SellRequestStatus } from "@/types/database";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDate, buildWhatsAppLink } from "@/lib/utils";

interface SellRequestDetailClientProps {
  initialRequest: SellPropertyRequest;
  attachments: SellPropertyAttachment[];
}

const ALL_STATUSES: SellRequestStatus[] = [
  "New",
  "Reviewing",
  "Contacted",
  "Accepted",
  "Rejected",
  "Closed",
];

export function SellRequestDetailClient({
  initialRequest,
  attachments,
}: SellRequestDetailClientProps) {
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [status, setStatus] = useState<SellRequestStatus>(initialRequest.status);
  const [notes, setNotes] = useState(initialRequest.internal_notes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/sell-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          status,
          internal_notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update sell request");

      setStatusMessage("Status and notes saved successfully.");
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
        `/api/admin/attachments?type=sell&recordId=${request.id}&attachmentId=${attachmentId}`
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

  const cleanPhone = request.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = buildWhatsAppLink(
    request.whatsapp || request.phone,
    `Hello ${request.seller_name}, this is POAB Global Construction regarding your property sale request (${request.reference}).`
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-poab-grey-border">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/sell-requests"
            className="p-2 text-poab-charcoal/70 hover:text-poab-navy hover:bg-poab-stone"
            aria-label="Back to sell requests"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-poab-gold">
                {request.reference}
              </span>
              <span className="text-xs text-poab-charcoal/60">
                • {formatDate(request.created_at)}
              </span>
            </div>
            <h2 className="font-heading text-xl font-bold text-poab-navy">
              Property Sale Request: {request.seller_name}
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
            href={`mailto:${request.email}`}
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
          <div className="bg-white border border-poab-grey-border p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-3">
              Property Details
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                  Property Category
                </span>
                <span className="font-bold text-poab-navy text-sm">{request.property_type}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                  Location
                </span>
                <span className="font-bold text-poab-navy text-sm">{request.property_location}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-poab-grey-border text-xs">
              <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                Expected Asking Price
              </span>
              <span className="font-mono font-bold text-poab-navy text-base">
                {request.expected_price || "Open to valuation / Negotiable"}
              </span>
            </div>

            <div className="pt-2 border-t border-poab-grey-border text-xs">
              <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold mb-1">
                Property Description &amp; Details
              </span>
              <p className="font-light text-poab-charcoal leading-relaxed whitespace-pre-line bg-poab-stone-light/50 p-3 border border-poab-grey-border">
                {request.description}
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white border border-poab-grey-border p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-3 flex items-center justify-between">
              <span>Attached Documents &amp; Photos</span>
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
                No documents or photos were attached to this request.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Workflow update */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleUpdate}
            className="bg-white border border-poab-grey-border p-6 shadow-xs space-y-4"
          >
            <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-2">
              Review Status &amp; Internal Notes
            </h3>

            <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-normal">
              <strong>Representation Note:</strong> Accepting this request confirms POAB will represent the property. It does <em>not</em> automatically publish a listing to the public website.
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SellRequestStatus)}
                className="w-full px-4 py-2 bg-white border border-poab-grey-border text-poab-navy font-semibold text-xs"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Property Verification &amp; Valuation Notes"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record survey verification, registry search results, valuation, or seller agreement terms..."
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
        </div>
      </div>
    </div>
  );
}
