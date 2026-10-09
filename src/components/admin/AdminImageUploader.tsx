"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";

interface AdminImageUploaderProps {
  bucket: "project-images" | "property-images";
  folder?: string;
  label?: string;
  helperText?: string;
  currentValue?: string;
  onUploadComplete: (storagePath: string, publicUrl: string) => void;
  onRemove?: () => void;
}

export function AdminImageUploader({
  bucket,
  folder = "covers",
  label = "Upload Photograph",
  helperText = "Supported formats: JPG, PNG, WEBP (Maximum 15MB).",
  currentValue,
  onUploadComplete,
  onRemove,
}: AdminImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentValue || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setErrorMessage(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      setPreviewUrl(data.publicUrl);
      onUploadComplete(data.storagePath, data.publicUrl);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error uploading file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setErrorMessage(null);
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy">
          {label}
        </label>
      )}

      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Preview thumbnail if available */}
        {previewUrl ? (
          <div className="relative w-32 h-24 bg-poab-stone border border-poab-grey-border overflow-hidden flex-shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => {
                // If direct relative path, ignore
              }}
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-1 right-1 p-1 bg-red-800/90 text-white hover:bg-red-900 transition-colors"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-24 bg-poab-stone-light border border-dashed border-poab-grey-border flex flex-col items-center justify-center text-poab-charcoal/40 flex-shrink-0">
            <ImageIcon className="w-6 h-6 mb-1" />
            <span className="text-[10px] uppercase font-mono">No image</span>
          </div>
        )}

        <div className="space-y-2 flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${folder}`}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 bg-poab-navy text-white hover:bg-poab-navy-surface text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-poab-gold" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-poab-gold" />
                  <span>{previewUrl ? "Replace Photo" : "Select Photo"}</span>
                </>
              )}
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs text-red-700 hover:text-red-900 border border-red-200"
              >
                Clear
              </button>
            )}
          </div>

          <p className="text-[11px] text-poab-charcoal/70 leading-normal">{helperText}</p>
        </div>
      </div>
    </div>
  );
}
