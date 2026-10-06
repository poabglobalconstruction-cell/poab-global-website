import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { Project, ProjectStage } from "@/types/database";
import { EditProjectClient } from "./EditProjectClient";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

async function getProjectWithStages(id: string): Promise<{
  project: Project | null;
  stages: ProjectStage[];
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return { project: null, stages: [] };

    const { data: project, error: pError } = await client
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (pError || !project) return { project: null, stages: [] };

    const { data: stages } = await client
      .from("project_stages")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true });

    return {
      project: project as Project,
      stages: (stages as ProjectStage[]) || [],
    };
  } catch {
    return { project: null, stages: [] };
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const resolvedParams = await params;
  const { project, stages } = await getProjectWithStages(resolvedParams.id);

  if (!project) {
    notFound();
  }

  return <EditProjectClient initialProject={project} initialStages={stages} />;
}
