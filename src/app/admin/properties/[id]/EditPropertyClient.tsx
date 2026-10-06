"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Archive, CheckCircle2, AlertCircle } from "lucide-react";
import { Property, PropertyImage } from "@/types/database";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface EditPropertyClientProps {
  initialProperty: Property;
  initialImages: PropertyImage[];
}

export function EditPropertyClient({ initialProperty }: EditPropertyClientProps) {
  const router = useRouter();
  const [property, setProperty] = useState({
    ...initialProperty,
    featuresText: initialProperty.features?.join("\n") || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const featuresArray = property.featuresText
        ? property.featuresText.split("\n").map((f) => f.trim()).filter(Boolean)
        : [];

      const res = await fetch("/api/admin/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...property,
          features: featuresArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update property");

      setStatusMessage("Property details updated successfully.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error updating property");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this property?")) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/properties?id=${property.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to archive");
      router.push("/admin/properties");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error archiving");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-poab-grey-border">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/properties"
            className="p-2 text-poab-charcoal/70 hover:text-poab-navy hover:bg-poab-stone"
            aria-label="Back to properties"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
              Edit Property: {property.title}
            </h2>
            <span className="font-mono text-xs text-poab-gold font-bold">
              {property.reference}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {property.published && (
            <Link
              href={`/properties/${property.slug}`}
              target="_blank"
              className="px-3 py-2 bg-poab-stone text-poab-navy text-xs uppercase font-semibold tracking-wider hover:bg-poab-stone-dark"
            >
              ↗ View Live
            </Link>
          )}
          <button
            type="button"
            onClick={handleArchive}
            className="px-3 py-2 text-red-700 hover:text-red-900 border border-red-200 text-xs uppercase tracking-wider font-semibold"
          >
            Archive Property
          </button>
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

      <form onSubmit={handleSave} className="bg-white border border-poab-grey-border p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Property Title"
            required
            value={property.title}
            onChange={(e) => setProperty({ ...property, title: e.target.value })}
          />
          <Input
            label="URL Slug"
            required
            value={property.slug}
            onChange={(e) => setProperty({ ...property, slug: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Location"
            required
            value={property.location}
            onChange={(e) => setProperty({ ...property, location: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
              Category
            </label>
            <select
              value={property.property_type}
              onChange={(e) => setProperty({ ...property, property_type: e.target.value as any })}
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
              Status (Section 30)
            </label>
            <select
              value={property.status}
              onChange={(e) => setProperty({ ...property, status: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm font-semibold"
            >
              <option value="Available">Available</option>
              <option value="Under Offer">Under Offer</option>
              <option value="Sold">Sold (Marks SOLD on Site)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Price (₦ Naira)"
            type="number"
            value={property.price !== null ? String(property.price) : ""}
            onChange={(e) => setProperty({ ...property, price: Number(e.target.value) || null })}
          />
          <Input
            label="Land / Unit Size"
            value={property.size || ""}
            onChange={(e) => setProperty({ ...property, size: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Bedrooms"
            type="number"
            value={property.bedrooms !== null ? String(property.bedrooms) : ""}
            onChange={(e) => setProperty({ ...property, bedrooms: Number(e.target.value) || null })}
          />
          <Input
            label="Bathrooms"
            type="number"
            value={property.bathrooms !== null ? String(property.bathrooms) : ""}
            onChange={(e) => setProperty({ ...property, bathrooms: Number(e.target.value) || null })}
          />
        </div>

        <Textarea
          label="Full Description"
          required
          rows={4}
          value={property.description}
          onChange={(e) => setProperty({ ...property, description: e.target.value })}
        />

        <Textarea
          label="Confirmed Features (One per line)"
          rows={3}
          value={property.featuresText}
          onChange={(e) => setProperty({ ...property, featuresText: e.target.value })}
        />

        <div className="p-4 bg-poab-stone-light border border-poab-grey-border flex flex-wrap gap-8 text-xs font-semibold uppercase text-poab-navy">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={property.price_public}
              onChange={(e) => setProperty({ ...property, price_public: e.target.checked })}
              className="accent-poab-navy w-4 h-4"
            />
            <span>Display Price Publicly</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={property.published}
              onChange={(e) => setProperty({ ...property, published: e.target.checked })}
              className="accent-poab-navy w-4 h-4"
            />
            <span>Published (Visible to Public)</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={property.featured}
              onChange={(e) => setProperty({ ...property, featured: e.target.checked })}
              className="accent-poab-gold w-4 h-4"
            />
            <span>Featured Listing</span>
          </label>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
