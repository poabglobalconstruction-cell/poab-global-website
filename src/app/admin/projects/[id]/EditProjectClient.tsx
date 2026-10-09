"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Layers,
  ChevronUp,
  ChevronDown,
  Edit2,
  Check,
  X,
  Camera,
} from "lucide-react";
import { Project, ProjectStage, ProjectImage } from "@/types/database";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";
import { MultiImageUploader, ProjectPhotoItem } from "@/components/admin/MultiImageUploader";

interface EditProjectClientProps {
  initialProject: Project;
  initialStages: ProjectStage[];
  initialImages?: ProjectImage[];
}

export function EditProjectClient({
  initialProject,
  initialStages,
  initialImages = [],
}: EditProjectClientProps) {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);

  const [project, setProject] = useState(initialProject);
  const [stages, setStages] = useState(initialStages);

  // Initialize unified photos from initialImages, ensuring cover image is represented
  const initialUnifiedPhotos: ProjectPhotoItem[] = React.useMemo(() => {
    let list: ProjectPhotoItem[] = initialImages.map((img, idx) => ({
      id: img.id,
      storage_path: img.storage_path,
      alt_text: img.alt_text || initialProject.title,
      caption: img.caption,
      sort_order: typeof img.sort_order === "number" ? img.sort_order : idx,
      is_cover: Boolean(
        img.is_cover ||
        (initialProject.cover_image_path && img.storage_path === initialProject.cover_image_path)
      ),
      project_stage_id: img.project_stage_id || null,
    }));

    // If project has cover_image_path not in initialImages, prepend it
    if (
      initialProject.cover_image_path &&
      !list.some((p) => p.storage_path === initialProject.cover_image_path)
    ) {
      list = [
        {
          id: crypto.randomUUID(),
          storage_path: initialProject.cover_image_path,
          alt_text: initialProject.title,
          caption: null,
          sort_order: 0,
          is_cover: true,
          project_stage_id: null,
        },
        ...list.map((p, idx) => ({ ...p, sort_order: idx + 1 })),
      ];
    } else if (list.length > 0 && !list.some((p) => p.is_cover)) {
      list[0].is_cover = true;
    }

    return list;
  }, [initialImages, initialProject]);

  const [photos, setPhotos] = useState<ProjectPhotoItem[]>(initialUnifiedPhotos);

  // Editing stage state
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editStageTitle, setEditStageTitle] = useState("");
  const [editStageDesc, setEditStageDesc] = useState("");
  const [editStageDate, setEditStageDate] = useState("");

  // New stage form state
  const [newStageTitle, setNewStageTitle] = useState("");
  const [newStageDesc, setNewStageDesc] = useState("");
  const [newStageDate, setNewStageDate] = useState("");

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollToError = () => {
    setTimeout(() => {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const handleProjectSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const coverPhoto = photos.find((p) => p.is_cover) || photos[0];
      const resolvedCover = coverPhoto ? coverPhoto.storage_path : project.cover_image_path || null;

      const payload = {
        ...project,
        cover_image_path: resolvedCover,
        ...(project.published ? { archived_at: null } : {}),
        stages,
        images: photos,
      };

      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update project");

      setProject((prev) => ({
        ...prev,
        cover_image_path: resolvedCover,
        ...(project.published ? { archived_at: null } : {}),
      }));
      setStatusMessage("Project specifications, timeline stages, and gallery images saved successfully.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error saving project");
      scrollToError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this project? It will be removed from public display.")) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: project.id,
          archived_at: new Date().toISOString(),
          published: false,
        }),
      });
      if (!res.ok) throw new Error("Failed to archive");
      setProject((prev) => ({ ...prev, archived_at: new Date().toISOString(), published: false }));
      setStatusMessage("Project has been moved to archive.");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to archive project");
      scrollToError();
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
      scrollToError();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/projects?id=${project.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      setIsDeleteModalOpen(false);
      router.push("/admin/projects?deleted=project");
    } catch (err: unknown) {
      setDeleteErrorMessage(err instanceof Error ? err.message : "Error deleting project");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddStage = () => {
    if (!newStageTitle.trim()) return;

    const newStage: ProjectStage = {
      id: crypto.randomUUID(),
      project_id: project.id,
      title: newStageTitle.trim(),
      description: newStageDesc.trim() || null,
      stage_date: newStageDate || null,
      sort_order: stages.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setStages([...stages, newStage]);
    setNewStageTitle("");
    setNewStageDesc("");
    setNewStageDate("");
    setStatusMessage("Stage added to timeline. Click 'Save Changes' to save your updates.");
  };

  const startEditStage = (stage: ProjectStage) => {
    setEditingStageId(stage.id);
    setEditStageTitle(stage.title);
    setEditStageDesc(stage.description || "");
    setEditStageDate(stage.stage_date || "");
  };

  const saveEditStage = (id: string) => {
    setStages(
      stages.map((s) =>
        s.id === id
          ? {
              ...s,
              title: editStageTitle.trim() || s.title,
              description: editStageDesc.trim() || null,
              stage_date: editStageDate || null,
              updated_at: new Date().toISOString(),
            }
          : s
      )
    );
    setEditingStageId(null);
    setStatusMessage("Stage updated. Remember to click 'Save Changes' above.");
  };

  const cancelEditStage = () => {
    setEditingStageId(null);
  };

  const moveStage = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= stages.length) return;

    const updated = [...stages];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    const reordered = updated.map((s, idx) => ({ ...s, sort_order: idx }));
    setStages(reordered);
  };

  const removeStage = (id: string) => {
    // Decouple photos from removed stage
    setPhotos(photos.map((p) => (p.project_stage_id === id ? { ...p, project_stage_id: null } : p)));
    setStages(stages.filter((s) => s.id !== id).map((s, idx) => ({ ...s, sort_order: idx })));
  };

  // Stage-associated photo addition
  const handleAddStagePhoto = (storagePath: string, publicUrl: string, stageId: string) => {
    const newPhoto: ProjectPhotoItem = {
      id: crypto.randomUUID(),
      storage_path: publicUrl,
      alt_text: project.title,
      caption: null,
      sort_order: photos.length,
      is_cover: false,
      project_stage_id: stageId,
    };
    setPhotos([...photos, newPhoto]);
    setStatusMessage("Stage photograph added. Click 'Save Changes' to save your updates.");
  };

  const removePhotoById = (id: string) => {
    const photoToRemove = photos.find((p) => p.id === id);
    const remaining = photos
      .filter((p) => p.id !== id)
      .map((p, idx) => ({ ...p, sort_order: idx }));

    if (photoToRemove?.is_cover && remaining.length > 0) {
      remaining[0].is_cover = true;
    }
    setPhotos(remaining);
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
        <div
          ref={errorRef}
          role="alert"
          className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2"
        >
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
            label="Page Address (URL)"
            required
            value={project.slug}
            onChange={(e) => setProject({ ...project, slug: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Project Location"
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
              Project Status
            </label>
            <select
              value={project.status}
              onChange={(e) => setProject({ ...project, status: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-white border border-poab-grey-border text-poab-charcoal text-sm"
            >
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Planning">Planning</option>
            </select>
          </div>
        </div>

        <Input
          label="Project Scope / Building Details"
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

        {/* Project Photography & Multi-Image Gallery Manager */}
        <div className="p-4 sm:p-6 bg-poab-stone-light/40 border border-poab-grey-border space-y-4">
          <MultiImageUploader
            bucket="project-images"
            folder="projects"
            label="Project Photographs, Cover Photo & Gallery"
            helperText="Select several photographs to upload at once. You can add more, reorder, assign photos to construction stages, and select any photo as the primary cover using 'Set as Cover'."
            photos={photos}
            onChange={setPhotos}
            availableStages={stages.map((s) => ({ id: s.id, title: s.title }))}
          />
        </div>

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
            <span>Visible on Website (Published)</span>
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

      {/* Stage Management Section with Inline Editing and Stage Photo Support */}
      <div className="bg-white border border-poab-grey-border p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-poab-grey-border">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-poab-gold" />
            <h3 className="font-heading text-base font-bold text-poab-navy uppercase tracking-wider">
              Construction Progress Updates
            </h3>
          </div>
          <span className="text-xs font-mono text-poab-gold font-bold">
            {stages.length} Updates
          </span>
        </div>

        {/* Existing Stages List */}
        {stages.length > 0 ? (
          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const isEditingThis = editingStageId === stage.id;

              return (
                <div
                  key={stage.id}
                  className="p-4 bg-poab-stone-light/60 border border-poab-grey-border space-y-3 text-xs"
                >
                  {isEditingThis ? (
                    <div className="space-y-3 bg-white p-4 border border-poab-navy/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Stage Title"
                          value={editStageTitle}
                          onChange={(e) => setEditStageTitle(e.target.value)}
                        />
                        <Input
                          label="Stage Date"
                          type="date"
                          value={editStageDate}
                          onChange={(e) => setEditStageDate(e.target.value)}
                        />
                      </div>
                      <Textarea
                        label="Description / Technical Scope"
                        rows={2}
                        value={editStageDesc}
                        onChange={(e) => setEditStageDesc(e.target.value)}
                      />
                      <div className="flex items-center justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={cancelEditStage}
                          className="px-2.5 py-1 text-xs border border-poab-grey-border hover:bg-poab-stone flex items-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditStage(stage.id)}
                          className="px-3 py-1 bg-poab-navy text-white text-xs font-semibold uppercase flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5 text-poab-gold" />
                          <span>Update Stage</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-poab-gold font-bold uppercase tracking-wider">
                            Stage 0{idx + 1}
                          </span>
                          {stage.stage_date && (
                            <span className="text-[11px] text-poab-charcoal/60">
                              • {stage.stage_date}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-poab-navy text-sm mt-0.5">{stage.title}</h4>
                        {stage.description && (
                          <p className="text-poab-charcoal/80 mt-1 font-light leading-relaxed">
                            {stage.description}
                          </p>
                        )}

                        {/* Stage Photos Gallery */}
                        {photos.filter((p) => p.project_stage_id === stage.id).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {photos
                              .filter((p) => p.project_stage_id === stage.id)
                              .map((img) => (
                                <div
                                  key={img.id}
                                  className="relative w-16 h-14 bg-poab-stone border border-poab-grey-border group overflow-hidden"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={img.storage_path}
                                    alt={img.alt_text}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removePhotoById(img.id)}
                                    className="absolute inset-0 bg-red-900/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    title="Remove photo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveStage(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 hover:bg-poab-stone disabled:opacity-30 text-poab-navy"
                          title="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStage(idx, "down")}
                          disabled={idx === stages.length - 1}
                          className="p-1 hover:bg-poab-stone disabled:opacity-30 text-poab-navy"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditStage(stage)}
                          className="p-1 text-poab-navy hover:text-poab-gold"
                          title="Edit stage details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStage(stage.id)}
                          className="p-1 text-red-700 hover:text-red-900"
                          title="Remove stage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add Photo to this stage */}
                  {!isEditingThis && (
                    <div className="pt-2 border-t border-poab-grey-border/60">
                      <AdminImageUploader
                        bucket="project-images"
                        folder={`stages/${stage.id.slice(0, 8)}`}
                        label={`Add Progress Photograph for Stage 0${idx + 1}`}
                        helperText="Select photographs representing work completed in this stage."
                        onUploadComplete={(path, url) => handleAddStagePhoto(path, url, stage.id)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-poab-charcoal/60 py-6 font-light text-center border border-dashed border-poab-grey-border">
            No stages logged yet. Add your first milestone below.
          </div>
        )}

        {/* Add Stage Form */}
        <div className="pt-4 border-t border-poab-grey-border space-y-4">
          <h4 className="font-heading text-xs font-bold text-poab-navy uppercase tracking-wider">
            Add Progress Stage
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Stage Title"
              value={newStageTitle}
              onChange={(e) => setNewStageTitle(e.target.value)}
              placeholder="e.g., Foundation & Ground Works"
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
            <span>Add Progress Stage</span>
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/40 border border-red-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider">
            Danger Zone
          </h3>
        </div>
        <p className="text-xs text-poab-charcoal/80 font-light leading-relaxed max-w-2xl">
          Permanently delete this project, its construction progress updates, and all uploaded photographs. This action cannot be undone. If you only want to hide it from visitors, set it to Draft or use Archive Project instead.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              setDeleteErrorMessage(null);
              setIsDeleteModalOpen(true);
            }}
            className="text-xs uppercase tracking-wider"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Delete Project</span>
          </Button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Project?"
        itemName={project.title}
        itemType="Project"
        isDeleting={isDeleting}
        errorMessage={deleteErrorMessage}
        onConfirm={handlePermanentDelete}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
