import React from "react";
import Link from "next/link";
import { PlusCircle, Edit, ExternalLink, Archive, CheckCircle2, Clock } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { Project } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

async function getAdminProjects(): Promise<Project[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return [];

    const { data, error } = await client
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Project[];
  } catch {
    return [];
  }
}

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-poab-grey-border">
        <div>
          <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
            Projects &amp; Site Logs
          </h2>
          <p className="text-xs text-poab-charcoal/70 mt-1 font-light">
            Manage public project publication, stage logs, and construction proof photography.
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="px-4 py-2.5 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold hover:bg-poab-navy-surface transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-poab-gold" />
          <span>Add New Project</span>
        </Link>
      </div>

      <div className="bg-white border border-poab-grey-border overflow-hidden shadow-xs">
        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-poab-stone-light border-b border-poab-grey-border text-poab-navy uppercase tracking-wider font-mono">
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Site Status</th>
                  <th className="p-4">Visibility</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-poab-grey-border">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-poab-stone-light/40 transition-colors">
                    <td className="p-4 font-semibold text-poab-navy">
                      <div>{p.title}</div>
                      <span className="text-[10px] text-poab-charcoal/50 font-mono">
                        /{p.slug}
                      </span>
                    </td>
                    <td className="p-4 text-poab-charcoal">{p.project_type}</td>
                    <td className="p-4 text-poab-charcoal">{p.location}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-poab-stone text-[10px] uppercase font-semibold">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.archived_at ? (
                        <span className="text-red-700 font-semibold text-[10px] uppercase">Archived</span>
                      ) : p.published ? (
                        <span className="text-emerald-700 font-semibold text-[10px] uppercase flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Published</span>
                          {p.featured && <span className="text-poab-gold">★</span>}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold text-[10px] uppercase">Draft</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="px-2.5 py-1 bg-poab-stone text-poab-navy hover:bg-poab-stone-dark text-[11px] font-semibold uppercase tracking-wider inline-block"
                      >
                        Edit
                      </Link>
                      {p.published && (
                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 text-poab-charcoal/70 hover:text-poab-navy text-[11px] inline-block"
                        >
                          ↗ View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-poab-charcoal/60 font-light">
            No projects in database. Click &ldquo;Add New Project&rdquo; to create the first project log.
          </div>
        )}
      </div>
    </div>
  );
}
