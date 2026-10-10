"use client";

import React, { useRef, useState } from "react";
import {
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

export interface PhotoItem {
  id: string;
  storage_path: string;
  alt_text: string;
  caption?: string | null;
  sort_order: number;
  is_cover: boolean;
  project_stage_id?: string | null;
}

export type ProjectPhotoItem = PhotoItem;

interface MultiImageUploaderProps {
  bucket: "project-images" | "property-images";
  folder?: string;
  label?: string;
  helperText?: string;
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  // If provided, photographs can be associated with construction stages
  availableStages?: Array<{ id: string; title: string }>;
}

export function MultiImageUploader({
  bucket,
  folder = "gallery",
  label = "Upload Photographs",
  helperText = "Select one or more photographs (JPG, PNG, WebP up to 15MB each).",
  photos,
  onChange,
  availableStages = [],
}: MultiImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<
    Array<{ fileName: string; status: "uploading" | "success" | "error"; error?: string }>
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setGlobalError(null);
    setIsProcessing(true);

    // Initialize upload queue tracker for user feedback
    type QueueItem = {
      fileName: string;
      status: "uploading" | "success" | "error";
      error?: string;
    };
    const initialQueue: QueueItem[] = files.map((f) => ({
      fileName: f.name,
      status: "uploading",
    }));
    setUploadQueue(initialQueue);

    let updatedPhotos = [...photos];
    const newQueue: QueueItem[] = [...initialQueue];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Client-side quick check
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        newQueue[i] = {
          fileName: file.name,
          status: "error",
          error: "Invalid file type. Only JPG, PNG, and WebP are allowed.",
        };
        setUploadQueue([...newQueue]);
        continue;
      }

      if (file.size > 15 * 1024 * 1024) {
        newQueue[i] = {
          fileName: file.name,
          status: "error",
          error: "File exceeds 15MB limit.",
        };
        setUploadQueue([...newQueue]);
        continue;
      }

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
          throw new Error(data.error || "Failed to upload photo");
        }

        // Check if there is already a cover photo; if not, make this first photo the cover
        const hasCover = updatedPhotos.some((p) => p.is_cover);

        const newPhotoItem: ProjectPhotoItem = {
          id: crypto.randomUUID(),
          storage_path: data.publicUrl,
          alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          caption: null,
          sort_order: updatedPhotos.length,
          is_cover: !hasCover,
          project_stage_id: null,
        };

        updatedPhotos = [...updatedPhotos, newPhotoItem];
        onChange(updatedPhotos);

        newQueue[i] = {
          fileName: file.name,
          status: "success",
        };
        setUploadQueue([...newQueue]);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Upload error";
        newQueue[i] = {
          fileName: file.name,
          status: "error",
          error: errMsg,
        };
        setUploadQueue([...newQueue]);
      }
    }

    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSetCover = (id: string) => {
    const updated = photos.map((p) => ({
      ...p,
      is_cover: p.id === id,
    }));
    onChange(updated);
  };

  const handleRemovePhoto = (id: string) => {
    const photoToRemove = photos.find((p) => p.id === id);
    const remaining = photos
      .filter((p) => p.id !== id)
      .map((p, idx) => ({ ...p, sort_order: idx }));

    // If removed photo was the cover and other photos exist, make the first one the cover
    if (photoToRemove?.is_cover && remaining.length > 0) {
      remaining[0].is_cover = true;
    }

    onChange(remaining);
  };

  const handleMove = (index: number, direction: "prev" | "next") => {
    if (
      (direction === "prev" && index === 0) ||
      (direction === "next" && index === photos.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "prev" ? index - 1 : index + 1;
    const reordered = [...photos];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updatedWithOrder = reordered.map((p, idx) => ({
      ...p,
      sort_order: idx,
    }));

    onChange(updatedWithOrder);
  };

  const handleStageAssignment = (photoId: string, stageId: string | null) => {
    const updated = photos.map((p) => {
      if (p.id === photoId) {
        return { ...p, project_stage_id: stageId || null };
      }
      return p;
    });
    onChange(updated);
  };

  const dismissQueue = () => {
    setUploadQueue([]);
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Photos button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy">
            {label}
          </label>
          <p className="text-[11px] text-poab-charcoal/70 leading-normal mt-0.5">
            {helperText}
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFilesSelected}
            className="hidden"
            id={`multi-image-uploader-${folder}`}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 bg-poab-navy text-white hover:bg-poab-navy-surface text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-poab-gold" />
                <span>Uploading Photos...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-poab-gold" />
                <span>Add Photos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Upload Progress Queue Banner */}
      {uploadQueue.length > 0 && (
        <div className="p-3 bg-poab-stone-light/70 border border-poab-grey-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-poab-navy">
            <span>
              Upload Queue ({uploadQueue.filter((q) => q.status === "success").length}/
              {uploadQueue.length} completed)
            </span>
            {!isProcessing && (
              <button
                type="button"
                onClick={dismissQueue}
                className="text-[11px] text-poab-charcoal/60 hover:text-poab-navy"
              >
                Dismiss
              </button>
            )}
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
            {uploadQueue.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[11px] py-1 border-b border-poab-grey-border/50 last:border-0"
              >
                <span className="truncate max-w-xs font-mono">{item.fileName}</span>
                <span className="flex-shrink-0 ml-2">
                  {item.status === "uploading" && (
                    <span className="text-amber-700 flex items-center gap-1 font-sans">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                    </span>
                  )}
                  {item.status === "success" && (
                    <span className="text-emerald-700 flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  )}
                  {item.status === "error" && (
                    <span className="text-red-700 flex items-center gap-1 font-sans" title={item.error}>
                      <AlertCircle className="w-3 h-3" /> {item.error || "Failed"}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className={`relative bg-white border ${
                photo.is_cover ? "border-poab-gold ring-2 ring-poab-gold/40 shadow-sm" : "border-poab-grey-border"
              } flex flex-col justify-between overflow-hidden group`}
            >
              {/* Thumbnail Container */}
              <div className="relative w-full h-32 bg-poab-stone overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.storage_path}
                  alt={photo.alt_text || "Project Photo"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />

                {/* Cover Photo Badge */}
                {photo.is_cover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-poab-navy text-poab-gold text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 shadow-md border border-poab-gold/50">
                    <Star className="w-2.5 h-2.5 fill-poab-gold text-poab-gold" />
                    <span>Cover Photo</span>
                  </span>
                )}

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-900/90 hover:bg-red-950 text-white rounded-none transition-colors shadow-sm"
                  title="Remove photograph"
                  aria-label="Remove photograph"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Controls and metadata */}
              <div className="p-2 bg-poab-stone-light/40 space-y-2 border-t border-poab-grey-border">
                {/* Reorder and Cover Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "prev")}
                      disabled={idx === 0}
                      className="p-1 text-poab-navy hover:bg-poab-stone disabled:opacity-25"
                      title="Move backward"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-poab-charcoal/60">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "next")}
                      disabled={idx === photos.length - 1}
                      className="p-1 text-poab-navy hover:bg-poab-stone disabled:opacity-25"
                      title="Move forward"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!photo.is_cover ? (
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo.id)}
                      className="text-[10px] text-poab-navy hover:text-poab-gold font-semibold uppercase tracking-wider"
                    >
                      Set as Cover
                    </button>
                  ) : (
                    <span className="text-[10px] text-poab-gold font-bold uppercase tracking-wider">
                      Primary
                    </span>
                  )}
                </div>

                {/* Construction Stage Assignment (Optional dropdown) */}
                {availableStages.length > 0 && (
                  <div className="pt-1 border-t border-poab-grey-border/60">
                    <label className="block text-[9px] uppercase tracking-wider text-poab-charcoal/60 mb-0.5">
                      Stage Milestone:
                    </label>
                    <select
                      value={photo.project_stage_id || ""}
                      onChange={(e) => handleStageAssignment(photo.id, e.target.value || null)}
                      className="w-full text-[10px] px-1.5 py-1 bg-white border border-poab-grey-border text-poab-charcoal"
                    >
                      <option value="">General Project Gallery</option>
                      {availableStages.map((st, sIdx) => (
                        <option key={st.id} value={st.id}>
                          Stage 0{sIdx + 1}: {st.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 bg-poab-stone-light/40 border border-dashed border-poab-grey-border text-center space-y-2">
          <ImageIcon className="w-8 h-8 text-poab-charcoal/30 mx-auto" />
          <p className="text-xs text-poab-charcoal/70">
            No photographs added yet. Click <strong>Add Photos</strong> above to select multiple site pictures.
          </p>
        </div>
      )}
    </div>
  );
}
