import React from "react";
import Link from "next/link";
import { Mail, Building } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { PropertyEnquiry } from "@/types/database";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

async function getEnquiries(): Promise<PropertyEnquiry[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;
    if (!client) return [];

    const { data, error } = await client
      .from("property_enquiries")
      .select("*, properties(title, reference)")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as PropertyEnquiry[];
  } catch {
    return [];
  }
}

export default async function AdminPropertyEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-poab-grey-border">
        <div>
          <h2 className="font-heading text-lg font-bold text-poab-navy uppercase tracking-wider">
            Property Leads &amp; Enquiries
          </h2>
          <p className="text-xs text-poab-charcoal/70 mt-1 font-light">
            Inquiries and inspection bookings tied directly to listed properties.
          </p>
        </div>
      </div>

      <div className="bg-white border border-poab-grey-border overflow-hidden shadow-xs">
        {enquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-poab-stone-light border-b border-poab-grey-border text-poab-navy uppercase tracking-wider font-mono">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Target Property</th>
                  <th className="p-4">Phone / Email</th>
                  <th className="p-4">Message Snippet</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-poab-grey-border">
                {enquiries.map((enq) => {
                  const linkedProp = (enq as any).properties;
                  return (
                    <tr key={enq.id} className="hover:bg-poab-stone-light/40 transition-colors">
                      <td className="p-4 font-bold text-poab-navy">{enq.name}</td>
                      <td className="p-4 font-medium text-poab-navy">
                        {linkedProp ? (
                          <div>
                            <span className="font-mono text-[10px] text-poab-gold font-bold block">
                              {linkedProp.reference}
                            </span>
                            <span>{linkedProp.title}</span>
                          </div>
                        ) : enq.property_title || enq.property_reference ? (
                          <div>
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              {enq.property_reference && (
                                <span className="font-mono text-[10px] text-poab-charcoal/70 font-bold">
                                  {enq.property_reference}
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-800">
                                Listing Deleted
                              </span>
                            </div>
                            <span className="text-poab-navy/90 block">
                              {enq.property_title || "Preserved Listing"}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-poab-stone text-poab-charcoal/70 block w-fit mb-0.5">
                              Listing Deleted
                            </span>
                            <span className="text-poab-charcoal/50">Unspecified Listing</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-poab-charcoal font-mono">
                        <div>{enq.phone}</div>
                        <span className="text-[11px] font-sans text-poab-charcoal/60">{enq.email}</span>
                      </td>
                      <td className="p-4 text-poab-charcoal/80 max-w-xs truncate font-light">
                        {enq.message}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                            enq.status === "New"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {enq.status}
                        </span>
                      </td>
                      <td className="p-4 text-poab-charcoal/60">{formatDate(enq.created_at)}</td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/property-enquiries/${enq.id}`}
                          className="px-3 py-1 bg-poab-stone text-poab-navy hover:bg-poab-stone-dark text-[11px] font-semibold uppercase tracking-wider inline-block"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-poab-charcoal/60 font-light">
            No property enquiries logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
