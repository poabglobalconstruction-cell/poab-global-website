"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function NewProjectPage() {
  const router = useRouter();
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData({ ...formData, title: val, slug: generatedSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

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
        setErrorMessage("An unexpected error occurred");
      }
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
            Create New Project Log
          </h2>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-poab-grey-border p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Project Title"
            required
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g., 4-Bedroom Contemporary Duplex"
          />

          <Input
            label="URL Slug"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g., 4-bedroom-contemporary-duplex"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Site Location"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Oluyole Estate, Ibadan"
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
              Site Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm"
            >
              <option value="Ongoing">Ongoing Site</option>
              <option value="Completed">Completed & Handed Over</option>
              <option value="Planning">Site Preparation / Setting Out</option>
            </select>
          </div>
        </div>

        <Input
          label="Declared Scope (Optional)"
          value={formData.scope}
          onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          placeholder="e.g., Foundation to finish, swimming pool, perimeter fence"
        />

        <Textarea
          label="Short Summary (Card Preview)"
          required
          rows={2}
          value={formData.short_description}
          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
          placeholder="Brief 1-2 sentence overview visible on project cards..."
        />

        <Textarea
          label="Detailed Description & Engineering Scope"
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Complete breakdown of excavation, structural blockwork, concrete mix, roofing and finishing specifications..."
        />

        <Input
          label="Cover Image Storage Path / URL (Optional)"
          value={formData.cover_image_path}
          onChange={(e) => setFormData({ ...formData, cover_image_path: e.target.value })}
          placeholder="https://... or bucket storage path"
          helperText="Direct image URL or Supabase storage path"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Commencement Date (Optional)"
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

        {/* Publication & Feature Toggles */}
        <div className="p-4 bg-poab-stone-light border border-poab-grey-border flex flex-wrap gap-8">
          <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold uppercase text-poab-navy">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="accent-poab-navy w-4 h-4"
            />
            <span>Publish Immediately (Visible to Public)</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold uppercase text-poab-navy">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="accent-poab-gold w-4 h-4"
            />
            <span>Feature on Homepage</span>
          </label>
        </div>

        <div className="pt-4 border-t border-poab-grey-border flex justify-end space-x-4">
          <Button href="/admin/projects" variant="outline" size="md">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Create Project Log</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
