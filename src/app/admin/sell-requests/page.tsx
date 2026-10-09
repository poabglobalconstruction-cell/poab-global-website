import React from "react";
import Link from "next/link";
import { Tag } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { SellPropertyRequest } from "@/types/database";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

async function getSellRequests(): Promise<SellPropertyRequest[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return [];

    const { data, error } = await client
      .from("sell_property_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as SellPropertyRequest[];
  } catch {
    return [];
  }
}

export default async function AdminSellRequestsPage() {
  const requests = await getSellRequests();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-poab-grey-border">
        <div>
          <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
            Property Sale Requests
          </h2>
          <p className="text-xs text-poab-charcoal/70 mt-1 font-light">
            Confidential submissions from property owners wishing to sell land or buildings.
          </p>
        </div>
      </div>

      <div className="bg-white border border-poab-grey-border overflow-hidden shadow-xs">
        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-poab-stone-light border-b border-poab-grey-border text-poab-navy uppercase tracking-wider font-mono">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Seller Name</th>
                  <th className="p-4">Property Type</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Asking Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-poab-grey-border">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-poab-stone-light/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-poab-gold">
                      {req.reference}
                    </td>
                    <td className="p-4 font-bold text-poab-navy">
                      <div>{req.seller_name}</div>
                      <span className="text-[11px] text-poab-charcoal/60 font-normal">
                        {req.phone}
                      </span>
                    </td>
                    <td className="p-4 text-poab-charcoal">{req.property_type}</td>
                    <td className="p-4 text-poab-charcoal">{req.property_location}</td>
                    <td className="p-4 font-mono font-semibold text-poab-navy">
                      {req.expected_price || "Not specified"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                          req.status === "New"
                            ? "bg-amber-100 text-amber-900"
                            : req.status === "Accepted"
                            ? "bg-emerald-100 text-emerald-900"
                            : req.status === "Rejected"
                            ? "bg-red-100 text-red-900"
                            : "bg-blue-100 text-blue-900"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-poab-charcoal/60">{formatDate(req.created_at)}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/sell-requests/${req.id}`}
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
            No property sale requests received yet.
          </div>
        )}
      </div>
    </div>
  );
}
