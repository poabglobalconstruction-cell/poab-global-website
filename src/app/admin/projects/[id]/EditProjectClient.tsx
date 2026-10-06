"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Archive, Plus, Trash2, CheckCircle2, AlertCircle, Layers } from "lucide-react";
import { Project, ProjectStage } from "@/types/database";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface EditProjectClientProps {
  initialProject: Project;
  initialStages: ProjectStage[];
}

export function EditProjectClient({ initialProject, initialStages }: EditProjectClientProps) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [stages, setStages] = useState(initialStages);

  // New stage form state
  const [newStageTitle, setNewStageTitle] = useState("");
  const [newStageDesc, setNewStageDesc] = useState("");
  const [newStageDate, setNewStageDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProjectSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        ...project,
        ...(project.published ? { archived_at: null } : {}),
        stages,
      };

      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update project");

      if (project.published) {
        setProject((prev) => ({ ...prev, archived_at: null }));
      }
      setStatusMessage("Project specifications and construction stages saved successfully.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this project? It will be removed from public display.")) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/projects?id=${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to archive");
      setProject((prev) => ({ ...prev, archived_at: new Date().toISOString(), published: false }));
      setStatusMessage("Project has been moved to archive.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to archive project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchive = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, archived_at: null }),
      });
      if (!res.ok) throw new Error("Failed to restore project");
      setProject((prev) => ({ ...prev, archived_at: null }));
      setStatusMessage("Project restored from archive.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to unarchive project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStage = async () => {
    if (!newStageTitle.trim()) return;

    try {
      const newStage: ProjectStage = {
        id: crypto.randomUUID(),
        project_id: project.id,
        title: newStageTitle,
        description: newStageDesc || null,
        stage_date: newStageDate || null,
        sort_order: stages.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setStages([...stages, newStage]);
      setNewStageTitle("");
      setNewStageDesc("");
      setNewStageDate("");
      setStatusMessage("Stage added to construction log.");
    } catch {
      setErrorMessage("Could not append stage.");
    }
  };

  const removeStage = (id: string) => {
    setStages(stages.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-poab-grey-border">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/projects"
            className="p-2 text-poab-charcoal/70 hover:text-poab-navy hover:bg-poab-stone"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
              Edit Project: {project.title}
            </h2>
            <span className="font-mono text-xs text-poab-charcoal/50">ID: {project.id}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {project.archived_at ? (
            <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider border border-red-200">
              Archived
            </span>
          ) : project.published ? (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
              Published
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
              Draft
            </span>
          )}

          {project.published && !project.archived_at && (
            <Link
              href={`/projects/${project.slug}`}
              target="_blank"
              className="px-3 py-2 bg-poab-stone text-poab-navy text-xs uppercase font-semibold tracking-wider hover:bg-poab-stone-dark"
            >
              ↗ View Live
            </Link>
          )}

          {project.archived_at ? (
            <button
              type="button"
              onClick={handleUnarchive}
              className="px-3 py-2 text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-300 text-xs uppercase tracking-wider font-semibold"
            >
              Restore / Unarchive
            </button>
          ) : (
            <button
              type="button"
              onClick={handleArchive}
              className="px-3 py-2 text-red-700 hover:text-red-900 border border-red-200 text-xs uppercase tracking-wider font-semibold"
            >
              Archive Project
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleProjectSave} className="bg-white border border-poab-grey-border p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Project Title"
            required
            value={project.title}
            onChange={(e) => setProject({ ...project, title: e.target.value })}
          />

          <Input
            label="URL Slug"
            required
            value={project.slug}
            onChange={(e) => setProject({ ...project, slug: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Site Location"
            required
            value={project.location}
            onChange={(e) => setProject({ ...project, location: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
              Category
            </label>
            <select
              value={project.project_type}
              onChange={(e) => setProject({ ...project, project_type: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Renovation">Renovation</option>
              <option value="Site Works">Site Works</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-poab-navy mb-1.5">
              Site Status
            </label>
            <select
              value={project.status}
              onChange={(e) => setProject({ ...project, status: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm"
            >
              <option value="Ongoing">Ongoing Site</option>
              <option value="Completed">Completed & Handed Over</option>
              <option value="Planning">Site Preparation / Setting Out</option>
            </select>
          </div>
        </div>

        <Input
          label="Declared Scope"
          value={project.scope || ""}
          onChange={(e) => setProject({ ...project, scope: e.target.value })}
        />

        <Textarea
          label="Short Summary"
          required
          rows={2}
          value={project.short_description}
          onChange={(e) => setProject({ ...project, short_description: e.target.value })}
        />

        <Textarea
          label="Detailed Description"
          rows={4}
          value={project.description || ""}
          onChange={(e) => setProject({ ...project, description: e.target.value })}
        />

        <Input
          label="Cover Image Path / URL"
          value={project.cover_image_path || ""}
          onChange={(e) => setProject({ ...project, cover_image_path: e.target.value })}
        />

        <div className="p-4 bg-poab-stone-light border border-poab-grey-border flex flex-wrap gap-8">
          <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold uppercase text-poab-navy">
            <input
              type="checkbox"
              checked={project.published}
              onChange={(e) =>
                setProject({
                  ...project,
                  published: e.target.checked,
                  ...(e.target.checked ? { archived_at: null } : {}),
                })
              }
              className="accent-poab-navy w-4 h-4"
            />
            <span>Published (Visible to Public)</span>
          </label>

          <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold uppercase text-poab-navy">
            <input
              type="checkbox"
              checked={project.featured}
              onChange={(e) => setProject({ ...project, featured: e.target.checked })}
              className="accent-poab-gold w-4 h-4"
            />
            <span>Featured on Homepage</span>
          </label>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>

      {/* Stage Management Section (Section 29) */}
      <div className="bg-white border border-poab-grey-border p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center space-x-2 pb-4 border-b border-poab-grey-border">
          <Layers className="w-5 h-5 text-poab-gold" />
          <h3 className="font-heading text-base font-bold text-poab-navy uppercase tracking-wider">
            Site Stages &amp; Construction Timeline
          </h3>
        </div>

        {/* Existing Stages List */}
        {stages.length > 0 ? (
          <div className="space-y-3">
            {stages.map((stage, idx) => (
              <div
                key={stage.id}
                className="p-4 bg-poab-stone-light border border-poab-grey-border flex items-start justify-between gap-4 text-xs"
              >
                <div>
                  <span className="font-mono text-poab-gold font-bold uppercase tracking-wider">
                    Stage 0{idx + 1}
                  </span>
                  <h4 className="font-bold text-poab-navy text-sm mt-0.5">{stage.title}</h4>
                  {stage.description && (
                    <p className="text-poab-charcoal/80 mt-1 font-light">{stage.description}</p>
                  )}
                  {stage.stage_date && (
                    <span className="text-[11px] text-poab-charcoal/60 block mt-1">
                      Date: {stage.stage_date}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeStage(stage.id)}
                  className="text-red-700 hover:text-red-900 p-1"
                  aria-label="Remove stage"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-poab-charcoal/60 py-4 font-light text-center border border-dashed border-poab-grey-border">
            No stages logged yet. Add your first milestone below.
          </div>
        )}

        {/* Add Stage Form */}
        <div className="pt-4 border-t border-poab-grey-border space-y-4">
          <h4 className="font-heading text-xs font-bold text-poab-navy uppercase tracking-wider">
            Add Construction Stage
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Stage Title"
              value={newStageTitle}
              onChange={(e) => setNewStageTitle(e.target.value)}
              placeholder="e.g., Deep Trench Excavation & Blinding"
            />
            <Input
              label="Stage Date (Optional)"
              type="date"
              value={newStageDate}
              onChange={(e) => setNewStageDate(e.target.value)}
            />
          </div>
          <Textarea
            label="Stage Summary / Technical Details"
            rows={2}
            value={newStageDesc}
            onChange={(e) => setNewStageDesc(e.target.value)}
            placeholder="Engineered excavation depth, soil consistency, vibrated concrete pour..."
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleAddStage}>
            <Plus className="w-4 h-4 mr-1 text-poab-gold" />
            <span>Add Stage to Timeline</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
