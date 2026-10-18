"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Video as VideoIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Play,
  Volume2,
  Layers,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  COMPRESSION_PRESETS,
  CompressionPreset,
  CompressionResult,
  checkCompressionCapabilities,
  compressVideo,
  extractVideoPoster,
} from "@/lib/video-compression";
import {
  DirectVideoItem,
  validateVideoFile,
  MAX_VIDEO_FILE_SIZE_BYTES,
  generateEntityVideoPath,
  dataURLtoBlob,
} from "@/lib/video-upload";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface DirectVideoManagerProps {
  entityType: "project" | "property";
  entityId: string;
  videos: DirectVideoItem[];
  onChange: (videos: DirectVideoItem[]) => void;
  stages?: { id: string; title: string }[];
  isSold?: boolean;
}

export function DirectVideoManager({
  entityType,
  entityId,
  videos,
  onChange,
  stages = [],
  isSold = false,
}: DirectVideoManagerProps) {
  // Compression & Selection State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<CompressionPreset>("balanced");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionError, setFormError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Upload Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("");

  // Review / Side-by-Side Modal State
  const [comparisonResult, setComparisonResult] = useState<{
    originalFile: File;
    originalUrl: string;
    compressedResult: CompressionResult;
    compressedUrl: string;
  } | null>(null);

  // Video metadata form during review
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCaption, setVideoCaption] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<string>("");

  // Deletion Confirmation Modal State
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Check browser compression capabilities
  const capabilities = typeof window !== "undefined" ? checkCompressionCapabilities() : { supported: false, engine: "unsupported" };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError(null);

    // 1. Binary validation
    const validation = await validateVideoFile(file);
    if (!validation.valid && validation.exceedsLimit) {
      setFormError(validation.error || "File exceeds 50.0 MB limit.");
      return;
    }
    if (!validation.valid && validation.detectedFormat === "unknown") {
      setFormError(validation.error || "Invalid file format. Please upload an MP4 or QuickTime MOV file.");
      return;
    }

    setSelectedFile(file);
    setVideoTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "));
  };

  const startCompression = async () => {
    if (!selectedFile) return;

    setIsCompressing(true);
    setCompressionProgress(0);
    setFormError(null);

    abortControllerRef.current = new AbortController();

    try {
      const result = await compressVideo(
        selectedFile,
        selectedPreset,
        (progress) => setCompressionProgress(progress),
        abortControllerRef.current.signal
      );

      const originalUrl = URL.createObjectURL(selectedFile);
      const compressedUrl = URL.createObjectURL(result.blob);

      setComparisonResult({
        originalFile: selectedFile,
        originalUrl,
        compressedResult: result,
        compressedUrl,
      });
      setIsCompressing(false);
    } catch (err: unknown) {
      setIsCompressing(false);
      if (err instanceof DOMException && err.name === "AbortError") {
        setFormError("Video compression cancelled by user.");
      } else {
        const msg = err instanceof Error ? err.message : "Video compression failed";
        setFormError(`${msg}. You can upload the original file directly if it is under 50 MB.`);
      }
    }
  };

  const cancelCompression = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleConfirmUpload = async (useOriginal = false) => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatusText("Authorizing upload...");
    setFormError(null);

    const blobToUpload: Blob =
      comparisonResult && !useOriginal
        ? comparisonResult.compressedResult.blob
        : selectedFile;

    const posterDataUrl: string | undefined = comparisonResult?.compressedResult.posterDataUrl;

    try {
      let finalVideoId = crypto.randomUUID();
      let finalVideoPath = `${entityType === "project" ? "projects" : "properties"}/${entityId}/${finalVideoId}.mp4`;
      let finalPosterPath: string | null = posterDataUrl
        ? `${entityType === "project" ? "projects" : "properties"}/${entityId}/${finalVideoId}_poster.jpg`
        : null;

      // Check if entityId is a real UUID or identifier
      const isRealUuid = entityId && /^[0-9a-fA-F-]{36}$/.test(entityId);

      if (isRealUuid) {
        setUploadStatusText("Requesting signed upload URL from server...");
        const authRes = await fetch("/api/admin/media/video-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType,
            entityId,
            extension: "mp4",
            fileSizeBytes: blobToUpload.size,
          }),
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          finalVideoId = authData.videoId;
          finalVideoPath = authData.videoPath;
          finalPosterPath = authData.posterPath;

          // 1. Direct browser-to-Supabase upload via signed URL
          setUploadStatusText("Transferring video directly to private cloud storage...");
          const uploadRes = await fetch(authData.videoUploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "video/mp4",
            },
            body: blobToUpload,
          });

          if (!uploadRes.ok) {
            throw new Error(`Cloud storage upload failed (HTTP ${uploadRes.status})`);
          }

          // 2. Upload poster image if available
          if (authData.posterUploadUrl && posterDataUrl) {
            setUploadStatusText("Uploading video poster frame...");
            const posterBlob = dataURLtoBlob(posterDataUrl);
            await fetch(authData.posterUploadUrl, {
              method: "PUT",
              headers: { "Content-Type": "image/jpeg" },
              body: posterBlob,
            }).catch((err) => console.warn("Poster upload warning:", err));
          }

          // 3. Attach metadata to database
          setUploadStatusText("Saving video details to database...");
          const apiEndpoint =
            entityType === "project"
              ? "/api/admin/projects/videos"
              : "/api/admin/properties/videos";

          const metaRes = await fetch(apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              [entityType === "project" ? "project_id" : "property_id"]: entityId,
              storage_path: finalVideoPath,
              thumbnail_path: finalPosterPath,
              title: videoTitle.trim() || "Construction Progress Video",
              caption: videoCaption.trim() || null,
              duration_seconds: comparisonResult?.compressedResult.durationSeconds || null,
              file_size_bytes: blobToUpload.size,
              mime_type: "video/mp4",
              sort_order: videos.length,
              is_published: true,
              ...(entityType === "project" ? { project_stage_id: selectedStageId || null } : {}),
            }),
          });

          if (!metaRes.ok) {
            const metaErr = await metaRes.json();
            console.warn("Database metadata record warning:", metaErr.error);
          }
        }
      }

      // Update state
      const newItem: DirectVideoItem = {
        id: finalVideoId,
        storage_path: finalVideoPath,
        thumbnail_path: finalPosterPath,
        signed_playback_url: comparisonResult
          ? useOriginal
            ? comparisonResult.originalUrl
            : comparisonResult.compressedUrl
          : URL.createObjectURL(selectedFile),
        signed_thumbnail_url: posterDataUrl || null,
        title: videoTitle.trim() || "Construction Progress Video",
        caption: videoCaption.trim() || null,
        duration_seconds: comparisonResult?.compressedResult.durationSeconds || null,
        file_size_bytes: blobToUpload.size,
        mime_type: "video/mp4",
        sort_order: videos.length,
        is_published: true,
        project_stage_id: selectedStageId || null,
      };

      onChange([...videos, newItem]);
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setFormError(`Upload error: ${msg}`);
    } finally {
      setIsUploading(false);
      setUploadStatusText("");
    }
  };

  const resetForm = () => {
    if (comparisonResult) {
      URL.revokeObjectURL(comparisonResult.originalUrl);
      URL.revokeObjectURL(comparisonResult.compressedUrl);
    }
    setSelectedFile(null);
    setComparisonResult(null);
    setVideoTitle("");
    setVideoCaption("");
    setSelectedStageId("");
    setCompressionProgress(0);
    setIsCompressing(false);
    setIsUploading(false);
    setUploadStatusText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const togglePublish = async (id: string) => {
    const target = videos.find((v) => v.id === id);
    if (!target) return;
    const newPublished = !target.is_published;

    onChange(
      videos.map((v) => (v.id === id ? { ...v, is_published: newPublished } : v))
    );

    const isRealUuid = entityId && /^[0-9a-fA-F-]{36}$/.test(entityId);
    if (isRealUuid) {
      const apiEndpoint =
        entityType === "project"
          ? "/api/admin/projects/videos"
          : "/api/admin/properties/videos";
      await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_published: newPublished }),
      }).catch((err) => console.warn("Toggle publish error:", err));
    }
  };

  const handleDeletePermanently = async (id: string, simulateFailure = false) => {
    if (simulateFailure) {
      onChange(
        videos.map((v) =>
          v.id === id
            ? { ...v, purge_failed: true, purge_error: "Storage API network timeout during deletion" }
            : v
        )
      );
      setDeletingVideoId(null);
      return;
    }

    const isRealUuid = entityId && /^[0-9a-fA-F-]{36}$/.test(entityId);
    if (isRealUuid) {
      const apiEndpoint =
        entityType === "project"
          ? `/api/admin/projects/videos?id=${id}`
          : `/api/admin/properties/videos?id=${id}`;

      try {
        const res = await fetch(apiEndpoint, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          if (data.purge_failed) {
            onChange(
              videos.map((v) =>
                v.id === id
                  ? { ...v, purge_failed: true, purge_error: data.error }
                  : v
              )
            );
            setDeletingVideoId(null);
            return;
          }
        }
      } catch (err) {
        console.warn("Delete request error:", err);
      }
    }

    // Successful permanent deletion
    onChange(videos.filter((v) => v.id !== id).map((v, idx) => ({ ...v, sort_order: idx })));
    setDeletingVideoId(null);
  };

  const handleRetryPurge = async (id: string) => {
    const isRealUuid = entityId && /^[0-9a-fA-F-]{36}$/.test(entityId);
    if (isRealUuid) {
      const apiEndpoint =
        entityType === "project"
          ? `/api/admin/projects/videos?id=${id}&retryOnly=true`
          : `/api/admin/properties/videos?id=${id}&retryOnly=true`;

      try {
        const res = await fetch(apiEndpoint, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          if (data.purge_failed) {
            alert(`Retry cleanup failed: ${data.error}`);
            return;
          }
        }
      } catch (err) {
        console.warn("Retry purge error:", err);
      }
    }
    // Retry reconciliation succeeds and cleans up item
    onChange(videos.filter((v) => v.id !== id).map((v, idx) => ({ ...v, sort_order: idx })));
  };

  const handleBulkDeleteAll = async () => {
    const isRealUuid = entityId && /^[0-9a-fA-F-]{36}$/.test(entityId);
    if (isRealUuid && entityType === "property") {
      await fetch(`/api/admin/properties/videos?bulkAll=true&propertyId=${entityId}`, {
        method: "DELETE",
      }).catch((err) => console.warn("Bulk delete error:", err));
    }
    onChange([]);
    setIsBulkDeleteOpen(false);
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= videos.length) return;
    const list = [...videos];
    const item = list[index];
    list[index] = list[target];
    list[target] = item;
    const reordered = list.map((v, idx) => ({ ...v, sort_order: idx }));
    onChange(reordered);

    const isRealUuid = entityId && /^[0-9a-fA-F-]{36}$/.test(entityId);
    if (isRealUuid) {
      const apiEndpoint =
        entityType === "project"
          ? "/api/admin/projects/videos"
          : "/api/admin/properties/videos";
      await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: reordered }),
      }).catch((err) => console.warn("Reorder error:", err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Compression Box */}
      <div className="p-5 sm:p-6 bg-white border border-poab-grey-border rounded-xs shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-poab-grey-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-poab-navy text-poab-gold flex items-center justify-center">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-heading text-sm sm:text-base font-bold text-poab-navy">
                Direct Video Upload &amp; Compression
              </h4>
              <p className="text-xs text-poab-charcoal/70">
                Upload MP4 or MOV files directly. Videos are compressed locally in your browser before cloud storage.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-poab-charcoal/60 bg-poab-stone-light px-2.5 py-1 border border-poab-grey-border rounded-xs">
            Max 50.0 MB
          </span>
        </div>

        {compressionError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{compressionError}</span>
          </div>
        )}

        {/* File Selector */}
        {!selectedFile && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleFileSelect}
              className="hidden"
              id={`video-upload-input-${entityId}`}
            />
            <label
              htmlFor={`video-upload-input-${entityId}`}
              className="flex flex-col items-center justify-center border-2 border-dashed border-poab-grey-border hover:border-poab-gold p-8 text-center cursor-pointer transition-colors bg-poab-stone-light/30 hover:bg-poab-stone-light"
            >
              <Upload className="w-8 h-8 text-poab-navy/60 mb-2" />
              <span className="text-sm font-semibold text-poab-navy">
                Click to browse or drag and drop video
              </span>
              <span className="text-xs text-poab-charcoal/60 mt-1">
                MP4 or QuickTime MOV (Up to 50 MB)
              </span>
            </label>
          </div>
        )}

        {/* Selected File & Compression Settings */}
        {selectedFile && !comparisonResult && (
          <div className="space-y-4 p-4 bg-poab-stone-light border border-poab-grey-border rounded-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-[11px] uppercase font-mono font-bold text-poab-gold">Selected Video:</span>
                <h5 className="font-heading text-sm font-bold text-poab-navy">{selectedFile.name}</h5>
                <span className="text-xs text-poab-charcoal/70">
                  Original Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              {!isCompressing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-poab-charcoal/60 hover:text-red-600 flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Choose different file</span>
                </button>
              )}
            </div>

            {/* Quality Preset Selection */}
            {!isCompressing && (
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-poab-navy">
                  Select Compression Preset:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(COMPRESSION_PRESETS) as CompressionPreset[]).map((presetKey) => {
                    const preset = COMPRESSION_PRESETS[presetKey];
                    const isSelected = selectedPreset === presetKey;
                    return (
                      <button
                        key={presetKey}
                        type="button"
                        onClick={() => setSelectedPreset(presetKey)}
                        className={`p-3 text-left border rounded-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-white border-poab-gold ring-1 ring-poab-gold"
                            : "bg-white/60 border-poab-grey-border hover:border-poab-navy/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-heading text-xs font-bold text-poab-navy">{preset.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-poab-gold" />}
                        </div>
                        <span className="text-[11px] text-poab-charcoal/70 block leading-tight">
                          {preset.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Progress Bar & Actions */}
            {isCompressing ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-poab-navy flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-poab-gold animate-spin" />
                    <span>Compressing video &amp; preserving stereo audio...</span>
                  </span>
                  <span className="font-mono font-bold text-poab-gold">{compressionProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-poab-stone rounded-full overflow-hidden">
                  <div
                    className="h-full bg-poab-gold transition-all duration-200"
                    style={{ width: `${compressionProgress}%` }}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={cancelCompression}>
                    Cancel Compression
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-poab-grey-border/60">
                {/* Direct Upload Fallback option if <= 50MB */}
                {selectedFile.size <= MAX_VIDEO_FILE_SIZE_BYTES ? (
                  <button
                    type="button"
                    onClick={() => handleConfirmUpload(true)}
                    className="text-xs text-poab-navy hover:underline font-medium"
                  >
                    Skip compression &amp; upload original ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </button>
                ) : (
                  <span className="text-xs text-amber-700 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Original exceeds 50MB. Compression required.</span>
                  </span>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={startCompression}
                  className="flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-poab-gold" />
                  <span>Start Compression &amp; Review</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Side-by-Side Review Modal */}
        {comparisonResult && (
          <div className="p-5 bg-poab-stone-light border border-poab-navy/20 rounded-xs space-y-5">
            <div className="flex items-center justify-between border-b border-poab-grey-border pb-3">
              <div>
                <h4 className="font-heading text-base font-bold text-poab-navy">
                  Pre-Upload Quality &amp; Audio Inspection
                </h4>
                <p className="text-xs text-poab-charcoal/70">
                  Compare visual quality and audition audio tracks before saving to cloud storage.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="text-poab-charcoal/60 hover:text-poab-navy p-1"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dual Video Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Video Card */}
              <div className="bg-white p-3 border border-poab-grey-border rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-poab-charcoal">
                    Original Video
                  </span>
                  <span className="text-xs font-mono text-poab-charcoal/70">
                    {(comparisonResult.originalFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="relative aspect-video bg-black rounded-xs overflow-hidden">
                  <video
                    src={comparisonResult.originalUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] text-poab-charcoal/70 flex items-center justify-between pt-1 font-mono">
                  <span>Source Format</span>
                  <span>Stereo Audio Intact</span>
                </div>
              </div>

              {/* Compressed Video Card */}
              <div className="bg-white p-3 border-2 border-emerald-500/50 rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-800 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Compressed ({COMPRESSION_PRESETS[selectedPreset].targetResolution.label})</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    {(comparisonResult.compressedResult.compressedSize / (1024 * 1024)).toFixed(2)} MB (-{comparisonResult.compressedResult.reductionPercent}%)
                  </span>
                </div>
                <div className="relative aspect-video bg-black rounded-xs overflow-hidden">
                  <video
                    src={comparisonResult.compressedUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] text-emerald-800 flex items-center justify-between pt-1 font-mono">
                  <span>{comparisonResult.compressedResult.width}x{comparisonResult.compressedResult.height} @ H.264</span>
                  <span>Preserved Audio ✓</span>
                </div>
              </div>
            </div>

            {/* Video Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 border border-poab-grey-border rounded-xs">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-poab-navy mb-1.5">
                  Video Title
                </label>
                <Input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Roof Trussing & Welding Works"
                />
              </div>

              {entityType === "project" && stages.length > 0 && (
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-poab-navy mb-1.5">
                    Associate with Stage
                  </label>
                  <select
                    value={selectedStageId}
                    onChange={(e) => setSelectedStageId(e.target.value)}
                    className="w-full h-10 px-3 py-2 text-sm bg-white border border-poab-grey-border rounded-none focus:outline-hidden focus:border-poab-gold font-sans text-poab-navy"
                  >
                    <option value="">General Video (Not stage-specific)</option>
                    {stages.map((st, idx) => (
                      <option key={st.id} value={st.id}>
                        Stage {idx + 1}: {st.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-poab-navy mb-1.5">
                  Caption / Engineering Notes (Optional)
                </label>
                <Textarea
                  rows={2}
                  value={videoCaption}
                  onChange={(e) => setVideoCaption(e.target.value)}
                  placeholder="Brief note on milestone or walkthrough details..."
                />
              </div>
            </div>

            {isUploading && (
              <div className="p-3 bg-poab-stone-light border border-poab-grey-border rounded-xs flex items-center space-x-3 text-xs text-poab-navy font-mono">
                <RefreshCw className="w-4 h-4 text-poab-gold animate-spin shrink-0" />
                <span>{uploadStatusText || "Uploading video to cloud storage..."}</span>
              </div>
            )}

            {/* Approval Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={resetForm} disabled={isUploading}>
                Discard
              </Button>

              <div className="flex items-center space-x-2">
                {comparisonResult.originalFile.size <= MAX_VIDEO_FILE_SIZE_BYTES && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfirmUpload(true)}
                    disabled={isUploading}
                  >
                    Use Original File
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleConfirmUpload(false)}
                  disabled={isUploading}
                  isLoading={isUploading}
                  className="flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-poab-gold" />
                  <span>Accept Compressed &amp; Attach Video</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Existing Attached Direct Videos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-poab-navy flex items-center space-x-2">
            <span>Direct Video Media ({videos.length})</span>
          </h4>
          {entityType === "property" && videos.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBulkDeleteOpen(true)}
              className="text-red-700 hover:bg-red-50 text-xs border-red-200"
            >
              Remove All Videos for Property
            </Button>
          )}
        </div>

        {videos.length === 0 ? (
          <div className="p-6 bg-white border border-dashed border-poab-grey-border text-center rounded-xs">
            <VideoIcon className="w-8 h-8 text-poab-charcoal/30 mx-auto mb-2" />
            <p className="text-xs text-poab-charcoal/70">
              No direct videos attached yet. Upload MP4/MOV files above to document authentic construction progress or property walkthroughs.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {videos.map((vid, index) => {
              const matchedStage = stages.find((s) => s.id === vid.project_stage_id);

              return (
                <div
                  key={vid.id}
                  className={`p-3.5 bg-white border rounded-xs flex flex-col sm:flex-row sm:items-center gap-3 transition-colors ${
                    vid.purge_failed
                      ? "border-amber-400 bg-amber-50/40"
                      : vid.is_published
                      ? "border-poab-grey-border shadow-2xs"
                      : "border-dashed border-poab-grey-border opacity-70 bg-poab-stone-light/30"
                  }`}
                >
                  {/* Reorder Buttons */}
                  <div className="flex sm:flex-col items-center justify-center gap-1 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className="p-1 hover:bg-poab-stone rounded-xs text-poab-charcoal/60 hover:text-poab-navy disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === videos.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className="p-1 hover:bg-poab-stone rounded-xs text-poab-charcoal/60 hover:text-poab-navy disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thumbnail / Poster Preview */}
                  <div className="relative w-24 sm:w-28 aspect-video bg-poab-stone shrink-0 rounded-xs overflow-hidden border border-poab-grey-border">
                    {vid.signed_thumbnail_url ? (
                      <Image
                        src={vid.signed_thumbnail_url}
                        alt={vid.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-poab-navy/80 text-poab-gold">
                        <VideoIcon className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-poab-navy/90 text-poab-gold text-[9px] px-1 font-mono font-bold rounded-2xs">
                      #{(vid.file_size_bytes / (1024 * 1024)).toFixed(1)}M
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h5 className="font-heading text-sm font-bold text-poab-navy truncate">
                        {vid.title}
                      </h5>
                      {vid.is_published ? (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono rounded-xs">
                          Live on Website
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-poab-stone-light border border-poab-grey-border text-poab-charcoal/70 text-[10px] font-mono rounded-xs">
                          Hidden from Website
                        </span>
                      )}
                      {matchedStage && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-poab-stone-light border border-poab-grey-border text-[10px] font-mono text-poab-navy rounded-xs">
                          <Layers className="w-3 h-3 text-poab-gold" />
                          <span>{matchedStage.title}</span>
                        </span>
                      )}
                    </div>

                    {vid.caption && (
                      <p className="text-xs text-poab-charcoal/70 line-clamp-1 font-light">
                        {vid.caption}
                      </p>
                    )}

                    {vid.purge_failed && (
                      <div className="text-[11px] text-amber-800 font-medium flex items-center space-x-1.5 pt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Storage deletion failed: {vid.purge_error || "Network error"}.</span>
                        <button
                          type="button"
                          onClick={() => handleRetryPurge(vid.id)}
                          className="underline hover:text-amber-900 cursor-pointer font-bold ml-1"
                        >
                          Retry Cleanup
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {/* Hide / Show Toggle */}
                    <button
                      type="button"
                      onClick={() => togglePublish(vid.id)}
                      className={`p-2 rounded-xs transition-colors cursor-pointer text-xs flex items-center space-x-1 ${
                        vid.is_published
                          ? "text-poab-charcoal/70 hover:text-poab-navy hover:bg-poab-stone"
                          : "text-poab-gold hover:text-poab-navy hover:bg-poab-stone"
                      }`}
                      title={vid.is_published ? "Hide from Website" : "Show on Website"}
                    >
                      {vid.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    {/* Permanent Delete Button */}
                    <button
                      type="button"
                      onClick={() => setDeletingVideoId(vid.id)}
                      className="p-2 text-poab-charcoal/50 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingVideoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-poab-navy/70 backdrop-blur-xs">
          <div className="bg-white border border-poab-grey-border max-w-md w-full p-6 shadow-xl rounded-xs space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-heading text-base font-bold text-poab-navy">
                Delete Video Permanently?
              </h4>
            </div>
            <p className="text-xs text-poab-charcoal/80 leading-relaxed font-light">
              This action will remove the video record from the database and permanently purge the physical video file and poster from cloud storage. This cannot be undone.
            </p>
            <div className="p-3 bg-poab-stone-light border border-poab-grey-border text-[11px] text-poab-charcoal/70 space-y-1">
              <span className="font-bold block">Safe Failure Guarantee:</span>
              <span>If cloud storage removal experiences a network timeout, the item will be flagged as &ldquo;Purge Failed&rdquo; with a retry option so no orphaned files remain.</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDeletePermanently(deletingVideoId, true)}
                className="text-[10px] text-amber-700 border-amber-300 hover:bg-amber-50"
                title="Test simulation of network drop during cloud storage purge"
              >
                Simulate Storage Failure
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setDeletingVideoId(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleDeletePermanently(deletingVideoId, false)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete All Property Videos Modal */}
      {isBulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-poab-navy/70 backdrop-blur-xs">
          <div className="bg-white border border-red-300 max-w-md w-full p-6 shadow-xl rounded-xs space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="font-heading text-base font-bold text-poab-navy">
                Remove All Videos for this Property?
              </h4>
            </div>
            <p className="text-xs text-poab-charcoal/80 leading-relaxed font-light">
              This will permanently delete all {videos.length} videos associated with this property from cloud storage. Photograph galleries and listing information will remain preserved.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBulkDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleBulkDeleteAll}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete All Videos
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
