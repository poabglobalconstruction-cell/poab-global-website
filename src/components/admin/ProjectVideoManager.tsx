"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Video as VideoIcon,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  ProjectVideo,
  extractYouTubeId,
  getYouTubeThumbnailUrl,
} from "@/lib/video";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ProjectVideoManagerProps {
  videos: ProjectVideo[];
  onChange: (videos: ProjectVideo[]) => void;
  stages: { id: string; title: string }[];
}

export function ProjectVideoManager({
  videos,
  onChange,
  stages,
}: ProjectVideoManagerProps) {
  // New video form state
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [captionInput, setCaptionInput] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const [posterUrlInput, setPosterUrlInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Computed preview for URL
  const detectedId = extractYouTubeId(urlInput);
  const isUrlValid = Boolean(detectedId);

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      setFormError("Please enter a YouTube video URL.");
      return;
    }

    const ytId = extractYouTubeId(trimmedUrl);
    if (!ytId) {
      setFormError(
        "Invalid YouTube URL. Please provide a valid youtube.com, youtu.be, or shorts link."
      );
      return;
    }

    const title = titleInput.trim() || "Construction Progress Video";

    const newVideo: ProjectVideo = {
      id: crypto.randomUUID(),
      url: trimmedUrl,
      youtube_id: ytId,
      title,
      caption: captionInput.trim() || null,
      project_stage_id: selectedStageId || null,
      sort_order: videos.length,
      poster_url: posterUrlInput.trim() || null,
    };

    onChange([...videos, newVideo]);

    // Reset form fields
    setUrlInput("");
    setTitleInput("");
    setCaptionInput("");
    setSelectedStageId("");
    setPosterUrlInput("");
  };

  const handleRemoveVideo = (id: string) => {
    const updated = videos
      .filter((v) => v.id !== id)
      .map((v, idx) => ({ ...v, sort_order: idx }));
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;

    const list = [...videos];
    const item = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = item;

    // Recalculate sort orders
    const updated = list.map((v, idx) => ({ ...v, sort_order: idx }));
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Add New Video Box */}
      <div className="p-5 sm:p-6 bg-poab-stone-light border border-poab-grey-border rounded-xs">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-poab-navy text-poab-gold flex items-center justify-center">
            <VideoIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading text-sm sm:text-base font-bold text-poab-navy">
              Add Project Video Link
            </h4>
            <p className="text-xs text-poab-charcoal/70">
              Paste a YouTube link (standard, shortened youtu.be, or shorts) to display genuine construction progress.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddVideo} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-poab-navy mb-1.5">
              YouTube URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setFormError(null);
                }}
                className={`pr-10 ${
                  urlInput && isUrlValid
                    ? "border-emerald-500 focus:border-emerald-500"
                    : urlInput && !isUrlValid
                    ? "border-red-400 focus:border-red-400"
                    : ""
                }`}
              />
              <div className="absolute right-3 top-2.5 pointer-events-none">
                {urlInput && isUrlValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : urlInput && !isUrlValid ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            </div>

            {/* Quick detected preview info */}
            {isUrlValid && detectedId && (
              <div className="mt-2 p-2.5 bg-white border border-emerald-200 rounded-xs flex items-center space-x-3 text-xs">
                <div className="relative w-16 h-10 bg-poab-stone shrink-0 rounded-xs overflow-hidden border border-poab-grey-border">
                  <Image
                    src={getYouTubeThumbnailUrl(detectedId)}
                    alt="Detected preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-mono font-semibold text-emerald-800 block truncate">
                    Valid YouTube Video (ID: {detectedId})
                  </span>
                  <span className="text-[10px] text-poab-charcoal/70">
                    Ready to attach with privacy-respecting embed
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-poab-navy mb-1.5">
                Video Title
              </label>
              <Input
                type="text"
                placeholder="e.g. Foundation Pouring & Piling"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-poab-navy mb-1.5">
                Associate with Construction Stage
              </label>
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-poab-grey-border rounded-none focus:outline-hidden focus:border-poab-gold font-sans text-poab-navy"
              >
                <option value="">General Project Video (Not stage-specific)</option>
                {stages.map((st, idx) => (
                  <option key={st.id} value={st.id}>
                    Stage {idx + 1}: {st.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-poab-navy mb-1.5">
              Caption / Overview (Optional)
            </label>
            <Textarea
              rows={2}
              placeholder="Brief description of the activities or engineering milestones shown in this video..."
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!isUrlValid}
              className="flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Attach Video</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Existing Attached Videos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-poab-navy flex items-center space-x-2">
            <span>Attached Videos ({videos.length})</span>
          </h4>
          <span className="text-[11px] text-poab-charcoal/60">
            Use arrows to reorder display sequence
          </span>
        </div>

        {videos.length === 0 ? (
          <div className="p-6 bg-white border border-dashed border-poab-grey-border text-center rounded-xs">
            <VideoIcon className="w-8 h-8 text-poab-charcoal/30 mx-auto mb-2" />
            <p className="text-xs text-poab-charcoal/70">
              No videos attached to this project yet. Add YouTube links above to show authentic construction progress.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {videos.map((vid, index) => {
              const matchedStage = stages.find((s) => s.id === vid.project_stage_id);
              const thumb = vid.poster_url || getYouTubeThumbnailUrl(vid.youtube_id);

              return (
                <div
                  key={vid.id}
                  className="p-3.5 bg-white border border-poab-grey-border shadow-2xs rounded-xs flex flex-col sm:flex-row sm:items-center gap-3 transition-colors hover:border-poab-navy/40"
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

                  {/* Thumbnail */}
                  <div className="relative w-24 sm:w-28 aspect-video bg-poab-stone shrink-0 rounded-xs overflow-hidden border border-poab-grey-border">
                    <Image
                      src={thumb}
                      alt={vid.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-poab-navy/90 text-poab-gold text-[9px] px-1 font-mono font-bold rounded-2xs">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h5 className="font-heading text-sm font-bold text-poab-navy truncate">
                        {vid.title}
                      </h5>
                      {matchedStage ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-poab-stone-light border border-poab-grey-border text-[10px] font-mono text-poab-navy rounded-xs">
                          <Layers className="w-3 h-3 text-poab-gold" />
                          <span>{matchedStage.title}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-poab-stone-light border border-poab-grey-border text-[10px] font-mono text-poab-charcoal/70 rounded-xs">
                          General Video
                        </span>
                      )}
                    </div>

                    {vid.caption && (
                      <p className="text-xs text-poab-charcoal/70 line-clamp-1 font-light">
                        {vid.caption}
                      </p>
                    )}

                    <div className="flex items-center space-x-3 text-[11px] text-poab-charcoal/60 pt-0.5">
                      <span className="font-mono text-[10px]">ID: {vid.youtube_id}</span>
                      <a
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-poab-navy flex items-center space-x-1 hover:underline"
                      >
                        <span>Open on YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(vid.id)}
                      className="p-2 text-poab-charcoal/50 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer"
                      title="Remove Video"
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
    </div>
  );
}
