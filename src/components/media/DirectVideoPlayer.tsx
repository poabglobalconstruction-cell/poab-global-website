"use client";

import React, { useState } from "react";
import { Play, Volume2, Layers, AlertCircle, RefreshCw } from "lucide-react";

export interface DirectVideoPlayerProps {
  video: {
    id: string;
    title: string;
    caption?: string | null;
    storage_path: string;
    thumbnail_path?: string | null;
    signed_playback_url?: string | null;
    signed_thumbnail_url?: string | null;
    duration_seconds?: number | null;
  };
  entityType: "project" | "property";
  stageName?: string | null;
}

export function DirectVideoPlayer({
  video,
  entityType,
  stageName,
}: DirectVideoPlayerProps) {
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(
    video.signed_playback_url || null
  );
  const [posterUrl, setPosterUrl] = useState<string | null>(
    video.signed_thumbnail_url || null
  );
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchFreshUrl = async () => {
    setIsLoadingUrl(true);
    setLoadError(null);

    try {
      const res = await fetch("/api/media/playback-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          videoId: video.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to load video playback link");
      }

      setPlaybackUrl(data.signedUrl);
      if (data.posterUrl) setPosterUrl(data.posterUrl);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Error loading video");
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleVideoError = () => {
    // If signed URL has expired (HTTP 403 / 400 from S3/Supabase), auto-refresh once
    if (!isLoadingUrl) {
      fetchFreshUrl();
    }
  };

  return (
    <div className="bg-poab-stone-light border border-poab-grey-border overflow-hidden shadow-xs flex flex-col">
      {/* Responsive Video Container */}
      <div className="relative aspect-video bg-poab-navy/95 w-full overflow-hidden flex items-center justify-center">
        {playbackUrl ? (
          <video
            src={playbackUrl}
            poster={posterUrl || undefined}
            controls
            playsInline
            preload="metadata"
            onError={handleVideoError}
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video streaming.
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            {loadError ? (
              <div className="space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs text-poab-stone">{loadError}</p>
                <button
                  type="button"
                  onClick={fetchFreshUrl}
                  className="px-3 py-1.5 bg-poab-gold text-poab-navy text-xs font-mono font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={fetchFreshUrl}
                disabled={isLoadingUrl}
                className="group flex flex-col items-center space-y-2 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-poab-gold/90 text-poab-navy flex items-center justify-center group-hover:scale-105 group-hover:bg-white transition-all shadow-md">
                  {isLoadingUrl ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-poab-stone uppercase tracking-wider">
                  {isLoadingUrl ? "Authorizing Stream..." : "Play Video"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Video Metadata Footer */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
            <h4 className="font-heading text-sm font-bold text-poab-navy">
              {video.title}
            </h4>
            {stageName && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-poab-grey-border text-[10px] font-mono text-poab-navy rounded-xs">
                <Layers className="w-3 h-3 text-poab-gold" />
                <span>{stageName}</span>
              </span>
            )}
          </div>

          {video.caption && (
            <p className="text-xs text-poab-charcoal/80 font-light leading-relaxed">
              {video.caption}
            </p>
          )}
        </div>

        {video.duration_seconds && video.duration_seconds > 0 && (
          <div className="text-[10px] font-mono text-poab-charcoal/60 pt-2 border-t border-poab-grey-border/50">
            Duration: {Math.floor(video.duration_seconds / 60)}:
            {String(video.duration_seconds % 60).padStart(2, "0")}
          </div>
        )}
      </div>
    </div>
  );
}
