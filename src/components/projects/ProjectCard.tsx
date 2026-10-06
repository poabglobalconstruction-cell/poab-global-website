import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, Building } from "lucide-react";
import { Project } from "@/types/database";
import { Badge } from "@/components/ui/Badge";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusVariant =
    project.status === "Completed"
      ? "success"
      : project.status === "Ongoing"
      ? "warning"
      : "stone";

  return (
    <article className="bg-white border border-poab-grey-border flex flex-col justify-between hover:border-poab-navy/50 transition-all group overflow-hidden">
      <div>
        {/* Cover Image Slot */}
        <div className="relative aspect-[16/10] bg-poab-navy/10 overflow-hidden">
          {project.cover_image_path ? (
            <Image
              src={project.cover_image_path}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-poab-stone text-poab-navy/40 p-4 text-center">
              <Building className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-[11px] uppercase tracking-wider font-medium text-poab-charcoal/60">
                Site Photography Staging
              </span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant={statusVariant}>{project.status}</Badge>
          </div>

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 bg-poab-navy/90 text-white text-[10px] font-semibold uppercase tracking-wider">
              {project.project_type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-1.5 text-xs text-poab-charcoal/70 mb-2">
            <MapPin className="w-3.5 h-3.5 text-poab-gold flex-shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>

          <h3 className="font-heading text-lg font-bold text-poab-navy group-hover:text-poab-gold transition-colors leading-snug">
            <Link href={`/projects/${project.slug}`}>
              {project.title}
            </Link>
          </h3>

          <p className="mt-2.5 text-xs sm:text-sm text-poab-charcoal/80 line-clamp-3 font-light leading-relaxed">
            {project.short_description}
          </p>
        </div>
      </div>

      {/* Footer Link */}
      <div className="px-6 py-4 border-t border-poab-grey-border bg-poab-stone-light/50 flex items-center justify-between">
        <span className="text-[11px] text-poab-charcoal/60 uppercase tracking-wider font-mono">
          Stage Progress Log
        </span>
        <Link
          href={`/projects/${project.slug}`}
          className="text-xs font-semibold uppercase tracking-wider text-poab-navy group-hover:text-poab-gold flex items-center space-x-1 transition-colors"
        >
          <span>View Site Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
