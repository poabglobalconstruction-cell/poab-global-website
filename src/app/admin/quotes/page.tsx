import React from "react";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { QuoteRequest, QuoteStatus } from "@/types/database";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

interface AdminQuotesPageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_FILTERS: Array<QuoteStatus | "All"> = [
  "All",
  "New",
  "Contacted",
  "Site Assessment",
  "Quotation Sent",
  "Won",
  "Lost",
  "Closed",
];

async function getQuotes(statusFilter?: string): Promise<QuoteRequest[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return [];

    let query = client
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "All") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as QuoteRequest[];
  } catch {
    return [];
  }
}

export default async function AdminQuotesPage({ searchParams }: AdminQuotesPageProps) {
  const resolvedParams = await searchParams;
  const currentStatus = (resolvedParams.status as QuoteStatus | "All") || "All";
  const quotes = await getQuotes(currentStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-poab-grey-border">
        <div>
          <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
            Construction Quote Requests
          </h2>
          <p className="text-xs text-poab-charcoal/70 mt-1 font-light">
            Manage incoming prospective client leads, review attached drawings, and update internal stage notes.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-poab-grey-border">
        {STATUS_FILTERS.map((st) => {
          const isActive = currentStatus === st;
          const queryParam = st === "All" ? "" : `?status=${encodeURIComponent(st)}`;
          return (
            <Link
              key={st}
              href={`/admin/quotes${queryParam}`}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive
                  ? "bg-poab-navy text-poab-gold border border-poab-navy"
                  : "bg-white text-poab-charcoal hover:bg-poab-stone border border-poab-grey-border"
              }`}
            >
              {st}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-poab-grey-border overflow-hidden shadow-xs">
        {quotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-poab-stone-light border-b border-poab-grey-border text-poab-navy uppercase tracking-wider font-mono">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Project Scope</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Budget Range</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-poab-grey-border">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-poab-stone-light/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-poab-gold">
                      {q.reference}
                    </td>
                    <td className="p-4 font-bold text-poab-navy">
                      <div>{q.name}</div>
                      <span className="text-[11px] text-poab-charcoal/60 font-normal">
                        {q.phone}
                      </span>
                    </td>
                    <td className="p-4 text-poab-charcoal">{q.project_type}</td>
                    <td className="p-4 text-poab-charcoal">{q.location}</td>
                    <td className="p-4 text-poab-charcoal font-medium">{q.budget_range}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                          q.status === "New"
                            ? "bg-amber-100 text-amber-900"
                            : q.status === "Won"
                            ? "bg-emerald-100 text-emerald-900"
                            : q.status === "Lost"
                            ? "bg-red-100 text-red-900"
                            : "bg-blue-100 text-blue-900"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 text-poab-charcoal/60">{formatDate(q.created_at)}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/quotes/${q.id}`}
                        className="px-3 py-1 bg-poab-stone text-poab-navy hover:bg-poab-stone-dark text-[11px] font-semibold uppercase tracking-wider inline-block"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-poab-charcoal/60 font-light">
            No quote requests matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
