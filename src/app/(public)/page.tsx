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

import type { Metadata } from "next";
import { COMPANY_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    absolute: `Building Construction Company in Ibadan | ${COMPANY_INFO.shortName}`,
  },
  description: `${COMPANY_INFO.name} (RC ${COMPANY_INFO.cacNumber}) delivers residential and commercial building construction from foundation to finish across Ibadan, Lagos, and Nigeria.`,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `Building Construction Company in Ibadan | ${COMPANY_INFO.shortName}`,
    description: `${COMPANY_INFO.name} (RC ${COMPANY_INFO.cacNumber}) delivers residential and commercial building construction from foundation to finish across Ibadan, Lagos, and Nigeria.`,
    url: "/",
    type: "website",
    images: [
      {
        url: "/images/illustrative/lagos-building-construction.jpg",
        width: 1200,
        height: 630,
        alt: `${COMPANY_INFO.name} Building Construction`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Building Construction Company in Ibadan | ${COMPANY_INFO.shortName}`,
    description: `${COMPANY_INFO.name} (RC ${COMPANY_INFO.cacNumber}) delivers residential and commercial building construction from foundation to finish across Ibadan, Lagos, and Nigeria.`,
    images: ["/images/illustrative/lagos-building-construction.jpg"],
  },
};

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

