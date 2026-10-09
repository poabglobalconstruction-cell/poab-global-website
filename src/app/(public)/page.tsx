import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { CredibilityStrip } from "@/components/home/CredibilityStrip";
import { WhatWeBuild } from "@/components/home/WhatWeBuild";
import { FoundationToFinish } from "@/components/home/FoundationToFinish";
import { MeetOurFounder } from "@/components/home/MeetOurFounder";
import { SelectedProjects } from "@/components/home/SelectedProjects";
import { ConstructionPhilosophy } from "@/components/home/ConstructionPhilosophy";
import { HowWeWork } from "@/components/home/HowWeWork";
import { PropertyServicesTeaser } from "@/components/home/PropertyServicesTeaser";
import { ProjectCtaSection } from "@/components/home/ProjectCtaSection";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Project } from "@/types/database";

export const revalidate = 60; // Revalidate every minute

async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .eq("featured", true)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error || !data) return [];
    return data as Project[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects();

  return (
    <div>
      <HeroSection />
      <CredibilityStrip />
      <WhatWeBuild />
      <FoundationToFinish />
      <MeetOurFounder />
      <SelectedProjects projects={featuredProjects} />
      <ConstructionPhilosophy />
      <HowWeWork />
      <PropertyServicesTeaser />
      <ProjectCtaSection />
    </div>
  );
}

