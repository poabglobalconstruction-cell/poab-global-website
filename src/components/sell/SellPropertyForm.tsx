"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Upload, X, ShieldCheck } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidPhoneNumber } from "@/lib/validation";

export function SellPropertyForm() {
  const [formData, setFormData] = useState({
    seller_name: "",
    phone: "",
    email: "",
    whatsapp: "",
    property_location: "",
    property_type: "Land",
    description: "",
    expected_price: "",
    honeypot: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const valid = selected.filter((file) => {
        const isValidType = [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/jpg",
        ].includes(file.type);
        const isValidSize = file.size <= 15 * 1024 * 1024;
        return isValidType && isValidSize;
      });
      setFiles((prev) => [...prev, ...valid].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.seller_name.trim() || formData.seller_name.trim().length < 2) {
      errors.seller_name = "Full name is required (at least 2 characters).";
    }
    if (!formData.phone.trim() || !isValidPhoneNumber(formData.phone)) {
      errors.phone = "Please enter a valid phone number (e.g. 08012345678 or +234...).";
    }
    if (formData.whatsapp.trim() && !isValidPhoneNumber(formData.whatsapp)) {
      errors.whatsapp = "Please enter a valid WhatsApp number (e.g. 08012345678 or +234...).";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }
    if (!formData.property_location.trim() || formData.property_location.trim().length < 2) {
      errors.property_location = "Property location is required.";
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = "Please provide details about the property (at least 10 characters).";
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
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      files.forEach((f) => data.append("files", f));

      const res = await fetch("/api/sell-property", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Submission failed. Please check form entries.");
      }

      setReference(result.reference);
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

  if (isSuccess && reference) {
    return (
      <div className="p-8 sm:p-12 bg-white border border-poab-grey-border shadow-xs max-w-2xl mx-auto text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest text-poab-gold font-bold block mb-1">
          Seller Submission Received
        </span>
        <h2 className="font-heading text-2xl font-bold text-poab-navy mb-4">
          Property Details Logged for Review
        </h2>
        <p className="text-sm text-poab-charcoal/80 leading-relaxed font-light mb-8 max-w-lg mx-auto">
          Thank you for contacting POAB Global Construction. Your property submission has been received. Our team will review your submission before contacting you.
        </p>

        <div className="p-6 bg-poab-stone-light border border-poab-grey-border mb-8 inline-block w-full max-w-md">
          <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
            Seller Tracking Reference
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-bold text-poab-navy block mt-1 tracking-wider">
            {reference}
          </span>
          <span className="text-[10px] text-poab-charcoal/50 block mt-2">
            This submission is under manual review and is never published automatically.
          </span>
        </div>

        <div className="pt-6 border-t border-poab-grey-border flex justify-center space-x-4">
          <Button href="/" variant="outline" size="sm">
            Return Home
          </Button>
          <Button href="/properties" variant="primary" size="sm">
            View Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-poab-grey-border p-6 sm:p-10 shadow-xs max-w-2xl mx-auto space-y-6">
      {/* Anti-spam honeypot */}
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
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Verified Process Notice */}
      <div className="p-4 bg-poab-stone-light border-l-4 border-poab-gold border border-poab-grey-border text-xs text-poab-charcoal/90 leading-relaxed">
        <strong>Confidential Seller Workflow:</strong> Submitting your property details here initiates an internal review. Your submission will <em>never</em> be automatically published online. An administrator will inspect documentation and contact you directly.
      </div>

      <div className="space-y-4">
        <h3 className="font-heading text-base font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-2">
          1. Property Owner / Seller Details
        </h3>

        <Input
          label="Your Full Name"
          required
          value={formData.seller_name}
          error={fieldErrors.seller_name}
          onChange={(e) => {
            setFormData({ ...formData, seller_name: e.target.value });
            if (fieldErrors.seller_name) setFieldErrors({ ...fieldErrors, seller_name: "" });
          }}
          placeholder="e.g., Samuel Ogundele"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Direct Phone Number"
            type="tel"
            required
            value={formData.phone}
            error={fieldErrors.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
            }}
            placeholder="e.g., 0802 345 6789 or +234..."
            helperText="Enter 11-digit Nigerian format or +234."
          />
          <Input
            label="WhatsApp Number (Optional)"
            type="tel"
            value={formData.whatsapp}
            error={fieldErrors.whatsapp}
            onChange={(e) => {
              setFormData({ ...formData, whatsapp: e.target.value });
              if (fieldErrors.whatsapp) setFieldErrors({ ...fieldErrors, whatsapp: "" });
            }}
            placeholder="e.g., 0802 345 6789 or +234..."
          />
        </div>

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
          placeholder="e.g., samuel@example.com"
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-poab-grey-border">
        <h3 className="font-heading text-base font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-2">
          2. Property Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
              Property Category <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.property_type}
              onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm focus:outline-none focus:border-poab-navy"
            >
              <option value="Land">Bare Land / Plot(s)</option>
              <option value="Bungalow">Completed Bungalow</option>
              <option value="Duplex">Duplex / Storey Building</option>
              <option value="Commercial">Commercial Structure / Warehouse</option>
              <option value="Unfinished">Unfinished Building / Carcass</option>
            </select>
          </div>

          <Input
            label="Expected Asking Price (Optional)"
            value={formData.expected_price}
            onChange={(e) => setFormData({ ...formData, expected_price: e.target.value })}
            placeholder="e.g., ₦45,000,000 or Negotiable"
          />
        </div>

        <Input
          label="Exact Property Location (City, Town, LGA)"
          required
          value={formData.property_location}
          error={fieldErrors.property_location}
          onChange={(e) => {
            setFormData({ ...formData, property_location: e.target.value });
            if (fieldErrors.property_location) setFieldErrors({ ...fieldErrors, property_location: "" });
          }}
          placeholder="e.g., Oluyole Estate, Ibadan or Sangotedo, Ajah, Lagos"
        />

        <Textarea
          label="Property Description & Title Documents"
          required
          rows={4}
          value={formData.description}
          error={fieldErrors.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
          }}
          placeholder="Mention parcel size, existing perimeter fence, land title type (e.g., Registered Survey, C of O, Deed of Assignment), and access road condition..."
        />

        {/* File / Survey Plan Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
            Attach Survey Plan, Deed, or Site Photos (Optional)
          </label>
          <p className="text-xs text-poab-charcoal/70 mb-2 font-light">
            Upload PDF or photo scans (Max 15MB each, up to 5 files). Kept strictly confidential.
          </p>

          <label className="border-2 border-dashed border-poab-grey-border p-6 block text-center cursor-pointer hover:border-poab-navy/50 transition-colors bg-poab-stone-light/50">
            <Upload className="w-6 h-6 text-poab-navy/60 mx-auto mb-1.5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-poab-navy block">
              Choose Document / Image Files
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-poab-stone-light border border-poab-grey-border text-xs"
                >
                  <span className="truncate max-w-xs">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-red-700 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-poab-grey-border">
        <Button
          type="submit"
          variant="primary"
          className="w-full text-xs uppercase tracking-wider py-4 font-semibold"
          isLoading={isLoading}
        >
          <ShieldCheck className="w-4 h-4 mr-2 text-poab-gold" />
          <span>Submit Property Details</span>
        </Button>
      </div>
    </form>
  );
}
