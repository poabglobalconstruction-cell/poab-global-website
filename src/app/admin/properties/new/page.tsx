"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function NewPropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    property_type: "Land",
    location: "",
    price: "",
    price_public: true,
    bedrooms: "",
    bathrooms: "",
    size: "",
    description: "",
    features: "",
    status: "Available",
    featured: false,
    published: false,
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
      const featuresArray = formData.features
        ? formData.features.split("\n").map((f) => f.trim()).filter(Boolean)
        : [];

      const res = await fetch("/api/admin/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: featuresArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create property");

      router.push(`/admin/properties/${data.property.id}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error creating property");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center space-x-3 pb-4 border-b border-poab-grey-border">
        <Link
          href="/admin/properties"
          className="p-2 text-poab-charcoal/70 hover:text-poab-navy hover:bg-poab-stone"
          aria-label="Back to properties"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
          Create Property Listing
        </h2>
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
            label="Property Title"
            required
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g., 2 Plots of Fenced Dry Land"
          />
          <Input
            label="URL Slug"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g., 2-plots-fenced-dry-land"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Location"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Alakia, Ibadan"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
              Category
            </label>
            <select
              value={formData.property_type}
              onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm"
            >
              <option value="Land">Land / Plot(s)</option>
              <option value="Bungalow">Bungalow</option>
              <option value="Duplex">Duplex</option>
              <option value="Commercial">Commercial</option>
              <option value="Apartment">Apartment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
              Listing Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm"
            >
              <option value="Available">Available</option>
              <option value="Under Offer">Under Offer</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Asking Price (₦ Naira, Optional)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g., 35000000"
          />

          <Input
            label="Land / Unit Size (Optional)"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            placeholder="e.g., 1,200 sqm / 2 Plots"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Bedrooms (Optional)"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            placeholder="e.g., 4"
          />
          <Input
            label="Bathrooms (Optional)"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            placeholder="e.g., 4"
          />
        </div>

        <Textarea
          label="Full Property Description"
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Details on title documents, registered survey, topography, neighbourhood access..."
        />

        <Textarea
          label="Confirmed Features (One per line)"
          rows={3}
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          placeholder="Registered Survey Plan&#10;Gated & Perimeter Fenced&#10;Good Motor Vehicle Access Road"
        />

        {/* Toggles */}
        <div className="p-4 bg-poab-stone-light border border-poab-grey-border flex flex-wrap gap-8 text-xs font-semibold uppercase text-poab-navy">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.price_public}
              onChange={(e) => setFormData({ ...formData, price_public: e.target.checked })}
              className="accent-poab-navy w-4 h-4"
            />
            <span>Display Price Publicly</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="accent-poab-navy w-4 h-4"
            />
            <span>Publish Immediately</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="accent-poab-gold w-4 h-4"
            />
            <span>Feature Listing</span>
          </label>
        </div>

        <div className="pt-4 border-t border-poab-grey-border flex justify-end space-x-4">
          <Button href="/admin/properties" variant="outline" size="md">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Property</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
