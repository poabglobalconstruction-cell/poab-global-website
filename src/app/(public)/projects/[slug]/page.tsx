import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, ArrowRight, CheckCircle2, Building, ChevronRight, Layers } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Project, ProjectStage, ProjectImage } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

async function getProjectBySlug(slug: string): Promise<{
  project: Project | null;
  stages: ProjectStage[];
  images: ProjectImage[];
}> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return { project: null, stages: [], images: [] };

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .is("archived_at", null)
      .single();

    if (projectError || !projectData) {
      return { project: null, stages: [], images: [] };
    }

    const project = projectData as Project;

    // Fetch stages
    const { data: stagesData } = await supabase
      .from("project_stages")
      .select("*")
      .eq("project_id", project.id)
      .order("sort_order", { ascending: true });

    // Fetch images
    const { data: imagesData } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", project.id)
      .order("sort_order", { ascending: true });

    return {
      project,
      stages: (stagesData as ProjectStage[]) || [],
      images: (imagesData as ProjectImage[]) || [],
    };
  } catch {
    return { project: null, stages: [], images: [] };
  }
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { project } = await getProjectBySlug(resolvedParams.slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  const imageUrl = project.cover_image_path || "/brand/poab-logo.svg";

  return {
    title: {
      absolute: `${project.title} | POAB Global Construction`,
    },
    description: project.short_description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title: `${project.title} | POAB Global Construction`,
      description: project.short_description,
      url: `/projects/${project.slug}`,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | POAB Global Construction`,
      description: project.short_description,
      images: [imageUrl],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const resolvedParams = await params;
  const { project, stages, images } = await getProjectBySlug(resolvedParams.slug);

  if (!project) {
    notFound();
  }

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: project.title, path: `/projects/${project.slug}` },
  ]);

  const statusVariant =
    project.status === "Completed"
      ? "success"
      : project.status === "Ongoing"
      ? "warning"
      : "stone";

  return (
    <div className="bg-white min-h-screen">
      <JsonLd data={breadcrumbs} />
      {/* Breadcrumb Bar */}
      <div className="bg-poab-stone-light border-b border-poab-grey-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-poab-charcoal/70 flex items-center space-x-2">
          <Link href="/" className="hover:text-poab-navy">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/projects" className="hover:text-poab-navy">Projects</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-poab-navy font-semibold truncate max-w-xs">{project.title}</span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-poab-navy text-white py-12 sm:py-20 border-b border-poab-navy-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-2.5 py-1 bg-poab-navy-surface text-poab-gold text-xs font-semibold uppercase tracking-wider border border-poab-navy-muted">
              {project.project_type}
            </span>
            <Badge variant={statusVariant}>{project.status}</Badge>
            <div className="flex items-center space-x-1.5 text-xs text-poab-stone/80 ml-2">
              <MapPin className="w-3.5 h-3.5 text-poab-gold" />
              <span>{project.location}</span>
            </div>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg text-poab-stone/85 font-light leading-relaxed max-w-3xl">
            {project.short_description}
          </p>
        </div>
      </section>

      {/* Main Body Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content: Story & Stages */}
          <div className="lg:col-span-8 space-y-12">
            {/* Primary Cover Image */}
            <div className="relative aspect-[16/9] bg-poab-stone border border-poab-grey-border overflow-hidden">
              {project.cover_image_path ? (
                <Image
                  src={project.cover_image_path}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-poab-navy/40 p-8 text-center bg-poab-stone-light">
                  <Building className="w-12 h-12 mb-3 opacity-40" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-poab-charcoal/60">
                    Official Site Photography Pending
                  </span>
                </div>
              )}
            </div>

            {/* Full Project Description */}
            {project.description && (
              <div className="prose max-w-none text-poab-charcoal/85 leading-relaxed text-sm sm:text-base font-light space-y-4">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-poab-navy">
                  Project Scope &amp; Structural Overview
                </h2>
                <div className="whitespace-pre-line">{project.description}</div>
              </div>
            )}

            {/* Flexible Project Stages - Clean Vertical Story */}
            <div className="pt-8 border-t border-poab-grey-border">
              <div className="flex items-center space-x-2.5 mb-8">
                <Layers className="w-5 h-5 text-poab-gold" />
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-poab-navy">
                  Construction Progress
                </h2>
              </div>

              {stages.length > 0 ? (
                <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-poab-grey-border pl-2 sm:pl-4">
                  {stages.map((stage, idx) => (
                    <div key={stage.id} className="relative pl-8 sm:pl-10 group">
                      {/* Circle Dot */}
                      <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-poab-navy border-2 border-poab-gold" />

                      <div className="p-6 bg-poab-stone-light border border-poab-grey-border shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono font-bold text-poab-gold uppercase tracking-wider">
                            Stage 0{idx + 1}
                          </span>
                          {stage.stage_date && (
                            <span className="text-xs text-poab-charcoal/60 flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDate(stage.stage_date)}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading text-base font-bold text-poab-navy mb-2">
                          {stage.title}
                        </h3>

                        {stage.description && (
                          <p className="text-xs sm:text-sm text-poab-charcoal/80 leading-relaxed font-light mb-3">
                            {stage.description}
                          </p>
                        )}

                        {/* Stage Specific Photographs */}
                        {images.filter((img) => img.project_stage_id === stage.id).length > 0 && (
                          <div className="mt-4 pt-3 border-t border-poab-grey-border/60">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-poab-navy/60 block mb-2">
                              Stage Documentation Photos:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {images
                                .filter((img) => img.project_stage_id === stage.id)
                                .map((img) => (
                                  <div
                                    key={img.id}
                                    className="relative aspect-[4/3] bg-poab-stone border border-poab-grey-border overflow-hidden group"
                                  >
                                    <Image
                                      src={img.storage_path}
                                      alt={img.alt_text || `${stage.title} photograph`}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                                      sizes="(max-width: 640px) 50vw, 33vw"
                                    />
                                    {img.caption && (
                                      <div className="absolute bottom-0 inset-x-0 bg-poab-navy/85 text-white text-[10px] p-1 truncate">
                                        {img.caption}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-poab-stone-light border border-dashed border-poab-grey-border text-center">
                  <p className="text-xs sm:text-sm text-poab-charcoal/70 font-light">
                    Site progress stages for this project are currently being updated by our construction team.
                  </p>
                </div>
              )}
            </div>

            {/* Gallery Grid */}
            {images.length > 0 && (
              <div className="pt-8 border-t border-poab-grey-border">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-poab-navy mb-6">
                  Project Photos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-[4/3] bg-poab-stone border border-poab-grey-border overflow-hidden">
                      <Image
                        src={img.storage_path}
                        alt={img.alt_text || project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      {img.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-poab-navy/80 text-white text-[11px] p-2">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info & Contextual CTA */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-poab-stone-light p-6 sm:p-8 border border-poab-grey-border space-y-6">
              <h3 className="font-heading text-base font-bold text-poab-navy uppercase tracking-wider border-b border-poab-grey-border pb-3">
                Project Information
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                    Location
                  </span>
                  <span className="font-semibold text-poab-navy">{project.location}</span>
                </div>

                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                    Building Category
                  </span>
                  <span className="font-semibold text-poab-navy">{project.project_type}</span>
                </div>

                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                    Status
                  </span>
                  <span className="font-semibold text-poab-navy">{project.status}</span>
                </div>

                {project.scope && (
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                      Project Scope
                    </span>
                    <span className="font-medium text-poab-charcoal">{project.scope}</span>
                  </div>
                )}

                {project.start_date && (
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                      Commencement Date
                    </span>
                    <span className="font-medium text-poab-charcoal">{formatDate(project.start_date)}</span>
                  </div>
                )}

                {project.completion_date && (
                  <div>
                    <span className="block text-[11px] uppercase tracking-wider text-poab-charcoal/60 font-medium">
                      Completion Date
                    </span>
                    <span className="font-medium text-poab-charcoal">{formatDate(project.completion_date)}</span>
                  </div>
                )}
              </div>

              {/* Contextual CTA Section 19 */}
              <div className="pt-6 border-t border-poab-grey-border">
                <span className="text-xs font-bold text-poab-navy uppercase tracking-wider block mb-2">
                  Planning Something Similar?
                </span>
                <p className="text-xs text-poab-charcoal/80 mb-4 leading-relaxed font-light">
                  Request an honest quotation referencing the design or construction scope of this project.
                </p>
                <Link
                  href={`/request-quote?inspiration=${encodeURIComponent(project.title)}&type=${encodeURIComponent(project.project_type)}`}
                  className="w-full py-3.5 px-4 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold text-center block hover:bg-poab-navy-surface transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Request a Quote</span>
                  <ArrowRight className="w-4 h-4 text-poab-gold" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
