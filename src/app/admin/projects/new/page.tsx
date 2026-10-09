"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, Layers } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";

export default function NewProjectPage() {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    location: "",
    project_type: "Residential",
    status: "Ongoing",
    scope: "",
    short_description: "",
    description: "",
    cover_image_path: "",
    featured: false,
    published: false,
    start_date: "",
    completion_date: "",
    // Initial stage support
    initial_stage_title: "",
    initial_stage_description: "",
    initial_stage_date: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, title: val, slug: generatedSlug }));
  };

  const scrollToError = () => {
    setTimeout(() => {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate required fields explicitly with friendly messages
    if (!formData.title.trim()) {
      setErrorMessage("Please enter a project title.");
      scrollToError();
      return;
    }

    if (!formData.location.trim()) {
      setErrorMessage("Please enter the site location (e.g. Ogun State, Nigeria).");
      scrollToError();
      return;
    }

    // Explicit check for short_description with clear guidance
    if (!formData.short_description.trim()) {
      setErrorMessage(
        "Please provide a Short Summary for project cards and previews (1-2 sentences)."
      );
      scrollToError();
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      router.push(`/admin/projects/${data.project.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred while saving the project.");
      }
      scrollToError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-poab-grey-border">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/projects"
            className="p-2 text-poab-charcoal/70 hover:text-poab-navy hover:bg-poab-stone"
            aria-label="Back to Projects"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
            Add New Project
          </h2>
        </div>
      </div>

      {/* Top Error Alert Banner with Scroll Anchor */}
      {errorMessage && (
        <div
          ref={errorRef}
          role="alert"
          className="p-4 bg-red-50 border border-red-300 text-xs text-red-800 flex items-start space-x-2.5 rounded-none shadow-xs"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-poab-grey-border p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Project Title"
            required
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g., Residential Apartment Development"
            helperText="Clear public title of the development"
          />

          <Input
            label="Page Address (URL)"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g., residential-apartment-development"
            helperText="Automatically generated from the title. Used in the website web address."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Project Location"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Ogun State, Nigeria"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
              Building Category
            </label>
            <select
              value={formData.project_type}
              onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Renovation">Renovation</option>
              <option value="Site Works">Site Works</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
              Project Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm"
            >
              <option value="Ongoing">Ongoing Construction</option>
              <option value="Completed">Completed</option>
              <option value="Planning">Planning &amp; Site Preparation</option>
            </select>
          </div>
        </div>

        <Input
          label="Project Scope / Building Details (Optional)"
          value={formData.scope}
          onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          placeholder="e.g., Three mini-flats upstairs and one self-contained apartment downstairs"
        />

        {/* Short Summary (Required) with clear guidance */}
        <div>
          <Textarea
            label="Short Summary (Required)"
            required
            rows={2}
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            placeholder="Brief 1-2 sentence overview visible on project cards and search listings..."
            helperText="A brief 1–2 sentence summary shown on project cards and previews."
          />
        </div>

        <Textarea
          label="Full Project Description (Optional)"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Complete breakdown of excavation, structural blockwork, concrete mix, roofing and finishing specifications..."
        />

        {/* Direct Photo Uploader for Cover Image */}
        <div className="p-4 bg-poab-stone-light/40 border border-poab-grey-border space-y-3">
          <AdminImageUploader
            bucket="project-images"
            folder="covers"
            label="Project Cover Photo (Optional)"
            helperText="Select a clear photo of the project from your phone or computer. You can also add or change this later."
            currentValue={formData.cover_image_path}
            onUploadComplete={(path, url) => setFormData((prev) => ({ ...prev, cover_image_path: url }))}
            onRemove={() => setFormData((prev) => ({ ...prev, cover_image_path: "" }))}
          />
        </div>

        {/* Optional Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date (Optional)"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
          <Input
            label="Completion Date (Optional)"
            type="date"
            value={formData.completion_date}
            onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
          />
        </div>

        {/* Initial Milestone Stage (Optional) */}
        <div className="p-4 bg-white border border-poab-grey-border space-y-4">
          <div className="flex items-center space-x-2 border-b border-poab-grey-border pb-2">
            <Layers className="w-4 h-4 text-poab-gold" />
            <h3 className="font-heading text-xs font-bold text-poab-navy uppercase tracking-wider">
              Initial Construction Progress (Optional)
            </h3>
          </div>
          <p className="text-xs text-poab-charcoal/70">
            You can record the current progress stage now (e.g., &ldquo;Awaiting plastering&rdquo;), or add detailed progress updates later.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Stage / Milestone Name"
              value={formData.initial_stage_title}
              onChange={(e) => setFormData({ ...formData, initial_stage_title: e.target.value })}
              placeholder="e.g., Superstructure & Blockwork / Awaiting Plastering"
            />
            <Input
              label="Stage Date"
              type="date"
              value={formData.initial_stage_date}
              onChange={(e) => setFormData({ ...formData, initial_stage_date: e.target.value })}
            />
          </div>

          <Textarea
            label="Stage Description / Notes"
            rows={2}
            value={formData.initial_stage_description}
            onChange={(e) => setFormData({ ...formData, initial_stage_description: e.target.value })}
            placeholder="e.g., Blockwork completed to lintel level, piping installed, awaiting plastering..."
          />
        </div>

        {/* Publication & Feature Toggles */}
        <div className="p-4 bg-poab-stone-light border border-poab-grey-border flex flex-wrap gap-8">
          <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold uppercase text-poab-navy">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="accent-poab-navy w-4 h-4"
            />
            <span>Visible on Website (Publish Immediately)</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold uppercase text-poab-navy">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="accent-poab-gold w-4 h-4"
            />
            <span>Show on Homepage (Featured Project)</span>
          </label>
        </div>

        {/* Bottom Error Notification directly above action buttons */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-4 border-t border-poab-grey-border flex justify-end space-x-4">
          <Button href="/admin/projects" variant="outline" size="md">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Project</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
