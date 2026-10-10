"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Archive, Trash2, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { Property, PropertyImage } from "@/types/database";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";
import { MultiImageUploader, PhotoItem } from "@/components/admin/MultiImageUploader";

interface EditPropertyClientProps {
  initialProperty: Property;
  initialImages?: PropertyImage[];
}

export function EditPropertyClient({ initialProperty, initialImages = [] }: EditPropertyClientProps) {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);

  const [property, setProperty] = useState({
    ...initialProperty,
    featuresText: initialProperty.features?.join("\n") || "",
  });
  const [photos, setPhotos] = useState<PhotoItem[]>(
    initialImages.map((img, idx) => ({
      id: img.id,
      storage_path: img.storage_path,
      alt_text: img.alt_text || initialProperty.title,
      caption: null,
      sort_order: typeof img.sort_order === "number" ? img.sort_order : idx,
      is_cover: Boolean(img.is_primary),
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const scrollToError = () => {
    setTimeout(() => {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const featuresArray = property.featuresText
        ? property.featuresText.split(/[\n,]/).map((f) => f.trim()).filter(Boolean)
        : [];

      // Clean payload: strip frontend-only featuresText and include normalized features & images
      const { featuresText, ...propertyData } = property;

      // Ensure at least one image is cover if images exist
      const hasCover = photos.some((p) => p.is_cover);
      const normalizedPhotos = photos.map((p, idx) => ({
        id: p.id,
        storage_path: p.storage_path,
        alt_text: p.alt_text || property.title,
        sort_order: p.sort_order ?? idx,
        is_primary: hasCover ? Boolean(p.is_cover) : idx === 0,
      }));

      const res = await fetch("/api/admin/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...propertyData,
          features: featuresArray,
          images: normalizedPhotos,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update property");

      if (property.published) {
        setProperty((prev) => ({ ...prev, archived_at: null }));
      }
      setStatusMessage("Property details and gallery photographs updated successfully.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error updating property");
      scrollToError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this property? It will be removed from public display.")) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: property.id,
          archived_at: new Date().toISOString(),
          published: false,
        }),
      });
      if (!res.ok) throw new Error("Failed to archive");
      setProperty((prev) => ({ ...prev, archived_at: new Date().toISOString(), published: false }));
      setStatusMessage("Property has been moved to archive.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error archiving");
      scrollToError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchive = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: property.id,
          archived_at: null,
        }),
      });
      if (!res.ok) throw new Error("Failed to restore property");
      setProperty((prev) => ({ ...prev, archived_at: null }));
      setStatusMessage("Property restored from archive.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error restoring property");
      scrollToError();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/properties?id=${property.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete property");
      }

      setIsDeleteModalOpen(false);
      router.push("/admin/properties?deleted=property");
    } catch (err: unknown) {
      setDeleteErrorMessage(err instanceof Error ? err.message : "Error deleting property");
    } finally {
      setIsDeleting(false);
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
          {property.archived_at ? (
            <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider border border-red-200">
              Archived
            </span>
          ) : property.published ? (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
              Published
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
              Draft
            </span>
          )}

          {property.published && !property.archived_at && (
            <Link
              href={`/properties/${property.slug}`}
              target="_blank"
              className="px-3 py-2 bg-poab-stone text-poab-navy text-xs uppercase font-semibold tracking-wider hover:bg-poab-stone-dark"
            >
              ↗ View Live
            </Link>
          )}

          {property.archived_at ? (
            <button
              type="button"
              onClick={handleUnarchive}
              className="px-3 py-2 text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-300 text-xs uppercase tracking-wider font-semibold"
            >
              Restore / Unarchive
            </button>
          ) : (
            <button
              type="button"
              onClick={handleArchive}
              className="px-3 py-2 text-red-700 hover:text-red-900 border border-red-200 text-xs uppercase tracking-wider font-semibold"
            >
              Archive Property
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          ref={errorRef}
          role="alert"
          className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2"
        >
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
            label="Page Address (URL)"
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
              Listing Status
            </label>
            <select
              value={property.status}
              onChange={(e) => setProperty({ ...property, status: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm font-semibold"
            >
              <option value="Available">Available</option>
              <option value="Under Offer">Under Offer</option>
              <option value="Sold">Sold</option>
              <option value="Withdrawn">Withdrawn</option>
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
          label="Confirmed Features (One per line or comma-separated)"
          rows={3}
          value={property.featuresText}
          onChange={(e) => setProperty({ ...property, featuresText: e.target.value })}
        />

        {/* Multi-Image Gallery Manager */}
        <MultiImageUploader
          bucket="property-images"
          folder={`listings/${property.reference}`}
          label="Property Photographs & Gallery"
          helperText="Select or drag multiple property photos (JPG, PNG, WebP up to 15MB each). You can set the primary cover photo, reorder images, and add descriptions."
          photos={photos}
          onChange={(updated) => setPhotos(updated)}
        />

        <div className="p-4 bg-poab-stone-light border border-poab-grey-border flex flex-wrap gap-8 text-xs font-semibold uppercase text-poab-navy">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={property.price_public}
              onChange={(e) => setProperty({ ...property, price_public: e.target.checked })}
              className="accent-poab-navy w-4 h-4"
            />
            <span>Show Price Publicly</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={property.published}
              onChange={(e) => setProperty({ ...property, published: e.target.checked })}
              className="accent-poab-navy w-4 h-4"
            />
            <span>Visible on Website</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={property.featured}
              onChange={(e) => setProperty({ ...property, featured: e.target.checked })}
              className="accent-poab-gold w-4 h-4"
            />
            <span>Feature on Homepage</span>
          </label>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50/40 border border-red-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider">
            Danger Zone
          </h3>
        </div>
        <p className="text-xs text-poab-charcoal/80 font-light leading-relaxed max-w-2xl">
          Permanently delete this property listing and all uploaded photographs. Any customer enquiries received for this property will be preserved in administration records. This action cannot be undone. If you only want to hide it from visitors, set it to Draft or use Archive Property instead.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              setDeleteErrorMessage(null);
              setIsDeleteModalOpen(true);
            }}
            className="text-xs uppercase tracking-wider"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Delete Property</span>
          </Button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Property?"
        itemName={`${property.title} (${property.reference})`}
        itemType="Property"
        isDeleting={isDeleting}
        errorMessage={deleteErrorMessage}
        onConfirm={handlePermanentDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
