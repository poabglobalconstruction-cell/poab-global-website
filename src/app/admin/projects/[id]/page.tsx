import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { Project, ProjectStage, ProjectImage, ProjectVideo } from "@/types/database";
import { EditProjectClient } from "./EditProjectClient";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

async function getProjectWithStages(id: string): Promise<{
  project: Project | null;
  stages: ProjectStage[];
  images: ProjectImage[];
  videos: ProjectVideo[];
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return { project: null, stages: [], images: [], videos: [] };

    const { data: project, error: pError } = await client
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (pError || !project) return { project: null, stages: [], images: [], videos: [] };

    const [{ data: stages }, { data: images }, { data: videos }] = await Promise.all([
      client
        .from("project_stages")
        .select("*")
        .eq("project_id", id)
        .order("sort_order", { ascending: true }),
      client
        .from("project_images")
        .select("*")
        .eq("project_id", id)
        .order("sort_order", { ascending: true }),
      client
        .from("project_videos")
        .select("*")
        .eq("project_id", id)
        .order("sort_order", { ascending: true }),
    ]);

    return {
      project: project as Project,
      stages: (stages as ProjectStage[]) || [],
      images: (images as ProjectImage[]) || [],
      videos: videos || [],
    };
  } catch {
    return { project: null, stages: [], images: [], videos: [] };
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const resolvedParams = await params;
  const { project, stages, images, videos } = await getProjectWithStages(resolvedParams.id);

  if (!project) {
    notFound();
  }

  return (
    <EditProjectClient
      initialProject={project}
      initialStages={stages}
      initialImages={images}
      initialDirectVideos={videos}
    />
  );
}
