import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Compass } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Project, ProjectType } from "@/types/database";
import { ProjectCard } from "@/components/projects/ProjectCard";

export const metadata: Metadata = {
  title: "Projects & Proof of Work",
  description: "Browse construction logs and completed projects executed by POAB Global Construction Company Ltd across Nigeria.",
  alternates: {
    canonical: "/projects",
  },
};

export const revalidate = 60;

interface ProjectsPageProps {
  searchParams: Promise<{ type?: string }>;
}

async function getPublishedProjects(typeFilter?: string): Promise<Project[]> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return [];

    let query = supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (typeFilter && typeFilter !== "All") {
      query = query.eq("project_type", typeFilter);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Project[];
  } catch {
    return [];
  }
}

const FILTER_OPTIONS = ["All", "Residential", "Commercial", "Renovation", "Site Works"];

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedParams = await searchParams;
  const currentFilter = resolvedParams.type || "All";
  const projects = await getPublishedProjects(currentFilter);
  const hasProjects = projects.length > 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-poab-navy text-white py-16 sm:py-24 border-b border-poab-navy-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block px-2.5 py-1 bg-poab-navy-surface text-poab-gold text-xs uppercase tracking-wider mb-4 border border-poab-navy-muted">
              Documented Site Evidence
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Built With Precision. Presented With Proof.
            </h1>
            <p className="text-base sm:text-lg text-poab-stone/85 font-light leading-relaxed">
              Explore our project archive documenting stage-by-stage construction execution. We believe honest photography of straight excavation trenches and solid foundation casting speaks louder than promises.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs & Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filter Navigation */}
        <div className="flex flex-wrap gap-2 pb-8 border-b border-poab-grey-border mb-12">
          {FILTER_OPTIONS.map((filter) => {
            const isActive = currentFilter === filter;
            const queryParam = filter === "All" ? "" : `?type=${encodeURIComponent(filter)}`;
            return (
              <Link
                key={filter}
                href={`/projects${queryParam}`}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-poab-navy text-poab-gold border border-poab-navy"
                    : "bg-poab-stone text-poab-charcoal hover:bg-poab-stone-dark border border-poab-grey-border"
                }`}
              >
                {filter}
              </Link>
            );
          })}
        </div>

        {/* Projects Grid or Intentional Empty State */}
        {hasProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-poab-stone-light border border-dashed border-poab-grey-border max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-poab-stone text-poab-navy mx-auto flex items-center justify-center mb-4">
              <FolderKanban className="w-7 h-7 text-poab-navy/60" />
            </div>
            <h2 className="font-heading text-lg font-bold text-poab-navy">
              Project documentation is being prepared for publication.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-poab-charcoal/70 font-light leading-relaxed">
              Selected POAB construction projects will be published here with approved photographs and stage-by-stage project details.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              {currentFilter !== "All" && (
                <Link
                  href="/projects"
                  className="px-5 py-2.5 bg-white border border-poab-grey-border text-xs uppercase tracking-wider font-semibold text-poab-navy hover:bg-poab-stone transition-colors"
                >
                  View All Categories
                </Link>
              )}
              <Link
                href="/request-quote"
                className="px-5 py-2.5 bg-poab-navy text-poab-gold text-xs uppercase tracking-wider font-semibold hover:bg-poab-navy-surface transition-colors flex items-center space-x-2"
              >
                <Compass className="w-4 h-4 text-poab-gold" />
                <span>Discuss Your Project</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
