import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, FolderKanban } from "lucide-react";
import { Project } from "@/types/database";
import { ProjectCard } from "@/components/projects/ProjectCard";

interface SelectedProjectsProps {
  projects: Project[];
}

export function SelectedProjects({ projects }: SelectedProjectsProps) {
  const hasProjects = projects && projects.length > 0;

  return (
    <section className="py-20 bg-white border-b border-poab-grey-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-block px-2.5 py-1 bg-poab-stone text-poab-navy text-xs font-semibold uppercase tracking-wider mb-3">
              Construction Proof
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-poab-navy tracking-tight">
              Selected Site Projects
            </h2>
            <p className="mt-2 text-sm text-poab-charcoal/80 font-light max-w-xl">
              Real documented projects demonstrating our stage-by-stage construction delivery across residential, commercial, and structural works.
            </p>
          </div>

          <Link
            href="/projects"
            className="mt-6 md:mt-0 text-xs font-semibold uppercase tracking-wider text-poab-navy hover:text-poab-gold flex items-center space-x-1.5 transition-colors"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {hasProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          /* Intentional development empty state without fabricating fake projects */
          <div className="p-12 text-center bg-poab-stone-light border border-dashed border-poab-grey-border">
            <div className="w-12 h-12 bg-poab-stone text-poab-navy mx-auto flex items-center justify-center mb-4">
              <FolderKanban className="w-6 h-6 text-poab-navy/60" />
            </div>
            <h3 className="font-heading text-base font-bold text-poab-navy">
              Project Portfolio Coming Soon
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-poab-charcoal/70 max-w-md mx-auto font-light">
              Our site documentation and project records are currently being prepared for presentation. Full stage-by-stage project logs will be featured here shortly.
            </p>
            <div className="mt-6">
              <Link
                href="/request-quote"
                className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-poab-gold bg-poab-navy px-5 py-2.5 hover:bg-poab-navy-surface transition-colors"
              >
                <Compass className="w-4 h-4 text-poab-gold" />
                <span>Discuss Your Building Project</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
