"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Video as VideoIcon, ExternalLink } from "lucide-react";
import { ProjectVideo, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/video";

interface ProjectVideoPlayerProps {
  video: ProjectVideo;
  stageName?: string | null;
  priority?: boolean;
}

export function ProjectVideoPlayer({ video, stageName, priority = false }: ProjectVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const posterImage = video.poster_url || getYouTubeThumbnailUrl(video.youtube_id);
  const embedUrl = `${getYouTubeEmbedUrl(video.youtube_id)}&autoplay=1`;

  return (
    <div className="bg-white border border-poab-grey-border shadow-xs overflow-hidden flex flex-col h-full group">
      {/* 16:9 Video Viewport */}
      <div className="relative aspect-video w-full bg-poab-navy/95 overflow-hidden">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={video.title || "POAB Global Construction Site Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="w-full h-full border-0"
          />
        ) : (
          <div className="relative w-full h-full">
            {/* Poster / Thumbnail image */}
            <Image
              src={posterImage}
              alt={video.title || "Construction video thumbnail"}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized={posterImage.startsWith("https://img.youtube.com/")}
            />

            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-poab-navy/35 group-hover:bg-poab-navy/20 transition-colors" />

            {/* Stage badge if associated */}
            {stageName && (
              <div className="absolute top-3 left-3 bg-poab-navy/90 text-poab-gold font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-poab-gold/30 rounded-xs">
                {stageName}
              </div>
            )}

            {/* Play Button Facade */}
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label={`Play video: ${video.title}`}
              className="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-poab-gold/90 hover:bg-poab-gold text-poab-navy flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-poab-gold/50 cursor-pointer"
            >
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-poab-navy translate-x-0.5" />
            </button>

            {/* Video badge */}
            <div className="absolute bottom-2.5 right-2.5 bg-poab-navy/85 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-xs flex items-center space-x-1 font-mono">
              <VideoIcon className="w-3 h-3 text-poab-gold" />
              <span>Video</span>
            </div>
          </div>
        )}
      </div>

      {/* Video Details */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-poab-stone-light/50">
        <div>
          <h4 className="font-heading text-sm sm:text-base font-bold text-poab-navy line-clamp-1 mb-1">
            {video.title}
          </h4>
          {video.caption && (
            <p className="text-xs text-poab-charcoal/80 leading-relaxed font-light line-clamp-2">
              {video.caption}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2 border-t border-poab-grey-border/60 flex items-center justify-between text-[11px] text-poab-charcoal/60">
          <span className="font-mono text-[10px] uppercase tracking-wider text-poab-navy/70">
            POAB Site Media
          </span>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-poab-navy hover:underline flex items-center space-x-1"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
