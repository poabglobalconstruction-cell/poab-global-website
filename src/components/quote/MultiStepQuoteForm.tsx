"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  DollarSign,
  FileUp,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { PROJECT_TYPES, DEFAULT_BUDGET_OPTIONS, DEFAULT_TIMELINE_OPTIONS } from "@/lib/constants";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/utils";
import { isValidPhoneNumber } from "@/lib/validation";

interface MultiStepQuoteFormProps {
  initialProjectType?: string;
  initialInspiration?: string;
  whatsappNumber?: string | null;
}

export function MultiStepQuoteForm({
  initialProjectType,
  initialInspiration,
  whatsappNumber,
}: MultiStepQuoteFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    project_type: initialProjectType || "Residential",
    // Step 2
    location: "",
    land_size: "",
    floors: "",
    bedrooms: "",
    current_stage: "Site Preparation / Land Available",
    description: "",
    // Step 3
    budget_range: DEFAULT_BUDGET_OPTIONS[0] as string,
    timeline: DEFAULT_TIMELINE_OPTIONS[0] as string,
    // Step 4
    has_building_plan: false,
    project_inspiration: initialInspiration || "",
    // Step 5
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    preferred_contact: "phone" as "phone" | "whatsapp" | "email",
    privacy_acknowledged: false,
    // Anti-spam honeypot
    honeypot: "",
  });

  const [files, setFiles] = useState<File[]>([]);

  const stageOptions = [
    "Raw Land / Site Preparation Needed",
    "Excavation / Trenching Stage",
    "Foundation Cast / DPC Level",
    "Structural Masonry / Lintel Stage",
    "Roofing / Carcass Stage",
    "Finishing & Remodeling Required",
    "Completed Building (Needs Renovation)",
  ];

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
      setFiles((prev) => [...prev, ...valid].slice(0, 5)); // max 5 files
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.project_type) {
        errors.project_type = "Please select a project type.";
      }
    }
    if (step === 2) {
      if (!formData.location.trim()) {
        errors.location = "Please specify the project location.";
      }
      if (formData.description.trim().length < 10) {
        errors.description = "Please enter at least 10 characters describing your building project.";
      }
    }
    if (step === 3) {
      if (!formData.budget_range || !formData.timeline) {
        errors.budget = "Please select your budget range and estimated timeline.";
      }
    }
    if (step === 5) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        errors.name = "Please provide your full name (at least 2 characters).";
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
      if (!formData.privacy_acknowledged) {
        errors.privacy = "You must acknowledge the privacy consent to proceed.";
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorMessage(Object.values(errors)[0]);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent duplicate submissions

    if (!validateStep(5)) {
      setCurrentStep(5);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, String(val));
      });

      files.forEach((file) => {
        data.append("files", file);
      });

      const res = await fetch("/api/quote", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Submission failed. Please verify your details.");
      }

      setSubmittedReference(result.reference);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred during submission.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STATE (Section 22)
  if (submittedReference) {
    const whatsappMsg = `Hello POAB Global Construction, I just submitted project request ${submittedReference} through your website regarding my ${formData.project_type} project in ${formData.location}.`;
    const whatsappUrl = buildWhatsAppLink(whatsappNumber, whatsappMsg);

    return (
      <div className="p-8 sm:p-12 bg-white border border-poab-grey-border shadow-xs max-w-2xl mx-auto text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest text-poab-gold font-bold block mb-1">
          Submission Confirmed
        </span>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-poab-navy mb-4">
          Project Request Logged Successfully
        </h2>
        <p className="text-sm text-poab-charcoal/80 leading-relaxed font-light mb-8 max-w-lg mx-auto">
          Your construction enquiry has been recorded. Our project team will review your scope and architectural details.
        </p>

        {/* Human Reference Box */}
        <div className="p-6 bg-poab-stone-light border border-poab-grey-border mb-8 inline-block w-full max-w-md">
          <span className="text-[11px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
            Official Reference Number
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-bold text-poab-navy block mt-1 tracking-wider">
            {submittedReference}
          </span>
          <span className="text-[10px] text-poab-charcoal/50 block mt-2">
            Please quote this reference in any subsequent email or WhatsApp communication.
          </span>
        </div>

        {/* Contextual WhatsApp Continuation (Section 22 & 50) */}
        {whatsappUrl && (
          <div className="mb-6">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold hover:bg-emerald-800 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Continue via WhatsApp with Reference</span>
            </a>
          </div>
        )}

        <div className="pt-6 border-t border-poab-grey-border flex justify-center space-x-4">
          <Button href="/" variant="outline" size="sm">
            Return Home
          </Button>
          <Button href="/projects" variant="primary" size="sm">
            View Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-poab-grey-border shadow-xs max-w-3xl mx-auto overflow-hidden">
      {/* Progress Indicator (Section 22 & 52) */}
      <div className="bg-poab-navy p-6 text-white border-b border-poab-navy-surface">
        <div className="flex items-center justify-between text-xs text-poab-stone/80 mb-3">
          <span className="font-mono text-poab-gold font-bold">
            STEP 0{currentStep} OF 06
          </span>
          <span className="uppercase tracking-wider">
            {currentStep === 1 && "Project Type"}
            {currentStep === 2 && "Project Details"}
            {currentStep === 3 && "Budget & Timeline"}
            {currentStep === 4 && "Plans & References"}
            {currentStep === 5 && "Contact Information"}
            {currentStep === 6 && "Review & Submit"}
          </span>
        </div>
        <div className="w-full bg-poab-navy-muted h-1.5 overflow-hidden">
          <div
            className="bg-poab-gold h-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="m-6 p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Multi-Step Body */}
      <div className="p-6 sm:p-10">
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

        {/* STEP 1: PROJECT TYPE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-poab-navy">
                Select Your Building Category
              </h3>
              <p className="text-xs sm:text-sm text-poab-charcoal/70 mt-1 font-light">
                What type of structure are you planning to construct, renovate, or secure?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PROJECT_TYPES.map((type) => {
                const isSelected = formData.project_type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, project_type: type })}
                    className={`p-4 text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-poab-navy text-white border-poab-navy font-semibold"
                        : "bg-poab-stone-light text-poab-charcoal border-poab-grey-border hover:border-poab-navy/40"
                    }`}
                  >
                    <span className="text-sm">{type}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border ${
                        isSelected
                          ? "border-poab-gold bg-poab-gold"
                          : "border-poab-charcoal/30"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: PROJECT DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-poab-navy">
                Site &amp; Architectural Scope
              </h3>
              <p className="text-xs sm:text-sm text-poab-charcoal/70 mt-1 font-light">
                Provide preliminary dimensions and the physical location of the project.
              </p>
            </div>

            <Input
              label="Project Location (City / Area / State)"
              required
              value={formData.location}
              error={fieldErrors.location}
              onChange={(e) => {
                setFormData({ ...formData, location: e.target.value });
                if (fieldErrors.location) setFieldErrors({ ...fieldErrors, location: "" });
              }}
              placeholder="e.g., Alakia, Ibadan, Oyo State or Lekki Phase 1, Lagos"
              helperText="Verified city, town, or state where the construction will occur."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Land Size (Optional)"
                value={formData.land_size}
                onChange={(e) => setFormData({ ...formData, land_size: e.target.value })}
                placeholder="e.g., 1 plot (600 sqm) or 2 plots"
              />
              <Input
                label="No. of Floors (Optional)"
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                placeholder="e.g., 2 floors (1 storey)"
              />
              <Input
                label="Bedrooms (Optional)"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="e.g., 4 Ensuite"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
                Current Project Stage <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.current_stage}
                onChange={(e) => setFormData({ ...formData, current_stage: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm focus:outline-none focus:border-poab-navy"
              >
                {stageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Project Description / Specific Requirements"
              required
              rows={4}
              value={formData.description}
              error={fieldErrors.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
              }}
              placeholder="Describe your design intentions, preferred materials, special structural needs, or current state of the site..."
            />
          </div>
        )}

        {/* STEP 3: BUDGET & TIMELINE */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-poab-navy">
                Budget Allocation &amp; Target Timeline
              </h3>
              <p className="text-xs sm:text-sm text-poab-charcoal/70 mt-1 font-light">
                An honest budget range allows us to tailor realistic material specifications and quotation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-2">
                Estimated Project Budget Range <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2">
                {DEFAULT_BUDGET_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center justify-between p-3.5 border cursor-pointer transition-colors ${
                      formData.budget_range === opt
                        ? "bg-poab-navy text-white border-poab-navy font-semibold"
                        : "bg-poab-stone-light text-poab-charcoal border-poab-grey-border hover:bg-poab-stone"
                    }`}
                  >
                    <span className="text-sm">{opt}</span>
                    <input
                      type="radio"
                      name="budget_range"
                      value={opt}
                      checked={formData.budget_range === opt}
                      onChange={() => setFormData({ ...formData, budget_range: opt })}
                      className="accent-poab-gold"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-2">
                Desired Commencement Timeline <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_TIMELINE_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center justify-between p-3 border cursor-pointer text-xs ${
                      formData.timeline === opt
                        ? "bg-poab-navy text-white border-poab-navy font-semibold"
                        : "bg-poab-stone-light text-poab-charcoal border-poab-grey-border"
                    }`}
                  >
                    <span>{opt}</span>
                    <input
                      type="radio"
                      name="timeline"
                      value={opt}
                      checked={formData.timeline === opt}
                      onChange={() => setFormData({ ...formData, timeline: opt })}
                      className="accent-poab-gold"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PLANS & REFERENCES */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-poab-navy">
                Building Plans &amp; Documentation
              </h3>
              <p className="text-xs sm:text-sm text-poab-charcoal/70 mt-1 font-light">
                Do you already have architectural or structural drawings prepared?
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-2">
                Do you already have a building plan?
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, has_building_plan: true })}
                  className={`flex-1 py-3 px-4 border text-xs font-semibold uppercase tracking-wider ${
                    formData.has_building_plan
                      ? "bg-poab-navy text-white border-poab-navy"
                      : "bg-poab-stone-light text-poab-charcoal border-poab-grey-border"
                  }`}
                >
                  Yes, I have drawings / plans
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, has_building_plan: false })}
                  className={`flex-1 py-3 px-4 border text-xs font-semibold uppercase tracking-wider ${
                    !formData.has_building_plan
                      ? "bg-poab-navy text-white border-poab-navy"
                      : "bg-poab-stone-light text-poab-charcoal border-poab-grey-border"
                  }`}
                >
                  No, I need design consultation
                </button>
              </div>
            </div>

            {/* Optional File Upload (PDF, JPG, PNG) */}
            <div className="pt-4 border-t border-poab-grey-border">
              <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
                Upload Drawings, Site Sketches or Reference Images (Optional)
              </label>
              <p className="text-xs text-poab-charcoal/70 mb-3 font-light">
                Supported formats: PDF, JPG, PNG (Max 15MB each, up to 5 files). Stored securely in private cloud storage.
              </p>

              <label className="border-2 border-dashed border-poab-grey-border p-8 block text-center cursor-pointer hover:border-poab-navy/50 transition-colors bg-poab-stone-light/50">
                <Upload className="w-8 h-8 text-poab-navy/60 mx-auto mb-2" />
                <span className="text-xs font-semibold uppercase tracking-wider text-poab-navy block">
                  Click to select files from device
                </span>
                <span className="text-[11px] text-poab-charcoal/60 mt-1 block">
                  PDF documents or high-resolution photos
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
                <div className="mt-4 space-y-2">
                  <span className="text-xs font-semibold text-poab-navy uppercase tracking-wider block">
                    Attached Files ({files.length}):
                  </span>
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-poab-stone-light border border-poab-grey-border text-xs"
                    >
                      <span className="truncate max-w-xs">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-red-700 hover:text-red-900 p-1"
                        aria-label="Remove attached file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Input
              label="Design Inspiration / Reference Project (Optional)"
              value={formData.project_inspiration}
              onChange={(e) => setFormData({ ...formData, project_inspiration: e.target.value })}
              placeholder="e.g., Similar to duplex project in Bodija, Ibadan"
            />
          </div>
        )}

        {/* STEP 5: CONTACT */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-poab-navy">
                Your Contact Information
              </h3>
              <p className="text-xs sm:text-sm text-poab-charcoal/70 mt-1 font-light">
                Where should our construction team send the assessment and quotation?
              </p>
            </div>

            <Input
              label="Full Name"
              required
              value={formData.name}
              error={fieldErrors.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
              }}
              placeholder="e.g., Tunde Bakare"
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
                placeholder="e.g., 0803 123 4567 or +234..."
                helperText="Enter 11-digit Nigerian format or international +234."
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
                placeholder="e.g., 0803 123 4567 or +234..."
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
              placeholder="e.g., tunde.bakare@example.com"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-2">
                Preferred Method of Contact
              </label>
              <div className="flex flex-wrap gap-4 text-xs">
                {(["phone", "whatsapp", "email"] as const).map((method) => (
                  <label key={method} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="preferred_contact"
                      value={method}
                      checked={formData.preferred_contact === method}
                      onChange={() => setFormData({ ...formData, preferred_contact: method })}
                      className="accent-poab-gold"
                    />
                    <span className="capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Privacy Acknowledgement (Section 22 & 40) */}
            <div className="pt-4 border-t border-poab-grey-border">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.privacy_acknowledged}
                  onChange={(e) => {
                    setFormData({ ...formData, privacy_acknowledged: e.target.checked });
                    if (fieldErrors.privacy) setFieldErrors({ ...fieldErrors, privacy: "" });
                  }}
                  className="mt-1 accent-poab-navy"
                />
                <span className="text-xs text-poab-charcoal/80 leading-relaxed font-light">
                  I consent to POAB Global Construction Company Ltd collecting and processing my building requirements and contact information for the purpose of project assessment and quotation. <span className="text-red-600">*</span>
                </span>
              </label>
              {fieldErrors.privacy && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.privacy}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-poab-navy">
                Review Your Project Submission
              </h3>
              <p className="text-xs sm:text-sm text-poab-charcoal/70 mt-1 font-light">
                Please confirm your entered specifications before submitting to our project team.
              </p>
            </div>

            <div className="bg-poab-stone-light p-6 border border-poab-grey-border space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-poab-grey-border">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                    Category
                  </span>
                  <span className="font-bold text-poab-navy">{formData.project_type}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                    Location
                  </span>
                  <span className="font-bold text-poab-navy">{formData.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-poab-grey-border">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                    Current Stage
                  </span>
                  <span className="font-medium text-poab-charcoal">{formData.current_stage}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                    Budget Range
                  </span>
                  <span className="font-medium text-poab-charcoal">{formData.budget_range}</span>
                </div>
              </div>

              <div className="pb-3 border-b border-poab-grey-border">
                <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                  Description
                </span>
                <p className="font-light text-poab-charcoal/85 mt-1 leading-relaxed">
                  {formData.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-poab-grey-border">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                    Contact Name
                  </span>
                  <span className="font-bold text-poab-navy">{formData.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                    Phone / Email
                  </span>
                  <span className="font-medium text-poab-charcoal">
                    {formData.phone} • {formData.email}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-poab-charcoal/60 block font-semibold">
                  Uploaded Drawings / Files
                </span>
                <span className="font-medium text-poab-charcoal">
                  {files.length > 0 ? `${files.length} document(s) attached` : "None"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="mt-10 pt-6 border-t border-poab-grey-border flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={nextStep}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="gold"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>Submit Construction Request</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
