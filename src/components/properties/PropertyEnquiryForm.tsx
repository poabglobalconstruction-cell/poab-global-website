"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidPhoneNumber } from "@/lib/validation";

interface PropertyEnquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  propertyRef: string;
}

export function PropertyEnquiryForm({
  propertyId,
  propertyTitle,
  propertyRef,
}: PropertyEnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    whatsapp: "",
    message: `Hello POAB, I would like to schedule an inspection or request further details regarding property ${propertyRef} (${propertyTitle}).`,
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
    if (!formData.phone.trim() || !isValidPhoneNumber(formData.phone)) {
      errors.phone = "Please enter a valid phone number (e.g. 08012345678 or +234...).";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@example.com).";
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      errors.message = "Please enter your enquiry message (at least 5 characters).";
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
      const res = await fetch("/api/property-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to submit enquiry. Please try again.");
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

  if (isSuccess) {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
        <h4 className="font-heading text-base font-bold text-emerald-900">
          Enquiry Received Successfully
        </h4>
        <p className="mt-2 text-xs text-emerald-800 leading-relaxed font-light">
          Your enquiry regarding <strong>{propertyRef}</strong> has been received by our property team. A representative will contact you via your provided phone number or email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field - invisible to genuine users */}
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
        placeholder="e.g., Folake Adeleke"
      />

      <Input
        label="Phone Number"
        type="tel"
        required
        value={formData.phone}
        error={fieldErrors.phone}
        onChange={(e) => {
          setFormData({ ...formData, phone: e.target.value });
          if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
        }}
        placeholder="e.g., 0801 234 5678 or +234..."
        helperText="Enter 11-digit Nigerian format or +234."
      />

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
        placeholder="e.g., folake@example.com"
      />

      <Textarea
        label="Inspection / Enquiry Message"
        required
        rows={3}
        value={formData.message}
        error={fieldErrors.message}
        onChange={(e) => {
          setFormData({ ...formData, message: e.target.value });
          if (fieldErrors.message) setFieldErrors({ ...fieldErrors, message: "" });
        }}
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full text-xs uppercase tracking-wider"
        isLoading={isLoading}
      >
        <Send className="w-3.5 h-3.5 mr-2 text-poab-gold" />
        <span>Submit Property Enquiry</span>
      </Button>
    </form>
  );
}
