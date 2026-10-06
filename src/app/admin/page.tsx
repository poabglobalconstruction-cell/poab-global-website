import React from "react";
import Link from "next/link";
import {
  FileText,
  Mail,
  Tag,
  FolderKanban,
  Building,
  PlusCircle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { QuoteRequest, PropertyEnquiry, SellPropertyRequest } from "@/types/database";
import { formatDate } from "@/lib/utils";

export const revalidate = 0; // Dynamic admin dashboard

interface DashboardMetrics {
  newQuotesCount: number;
  newEnquiriesCount: number;
  newSellRequestsCount: number;
  activeProjectsCount: number;
  availablePropertiesCount: number;
  recentQuotes: QuoteRequest[];
  recentEnquiries: PropertyEnquiry[];
  recentSellRequests: SellPropertyRequest[];
}

async function getDashboardData(): Promise<DashboardMetrics> {
  const fallback: DashboardMetrics = {
    newQuotesCount: 0,
    newEnquiriesCount: 0,
    newSellRequestsCount: 0,
    activeProjectsCount: 0,
    availablePropertiesCount: 0,
    recentQuotes: [],
    recentEnquiries: [],
    recentSellRequests: [],
  };

  try {
    const supabase = await createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const client = admin || supabase;

    if (!client) return fallback;

    // Actual Database Counts (Section 28: no fabricated analytics)
    const [
      { count: quotesCount },
      { count: enquiriesCount },
      { count: sellCount },
      { count: projectsCount },
      { count: propsCount },
      { data: recentQuotes },
      { data: recentEnquiries },
      { data: recentSell },
    ] = await Promise.all([
      client.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "New"),
      client.from("property_enquiries").select("*", { count: "exact", head: true }).eq("status", "New"),
      client.from("sell_property_requests").select("*", { count: "exact", head: true }).eq("status", "New"),
      client.from("projects").select("*", { count: "exact", head: true }).is("archived_at", null),
      client.from("properties").select("*", { count: "exact", head: true }).eq("status", "Available").is("archived_at", null),
      client.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(4),
      client.from("property_enquiries").select("*, properties(title)").order("created_at", { ascending: false }).limit(4),
      client.from("sell_property_requests").select("*").order("created_at", { ascending: false }).limit(4),
    ]);

    return {
      newQuotesCount: quotesCount || 0,
      newEnquiriesCount: enquiriesCount || 0,
      newSellRequestsCount: sellCount || 0,
      activeProjectsCount: projectsCount || 0,
      availablePropertiesCount: propsCount || 0,
      recentQuotes: (recentQuotes as QuoteRequest[]) || [],
      recentEnquiries: (recentEnquiries as PropertyEnquiry[]) || [],
      recentSellRequests: (recentSell as SellPropertyRequest[]) || [],
    };
  } catch {
    return fallback;
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const metricsCards = [
    {
      title: "New Quote Requests",
      count: data.newQuotesCount,
      href: "/admin/quotes?status=New",
      icon: FileText,
      badge: "Action Required",
      badgeColor: "bg-amber-100 text-amber-900",
    },
    {
      title: "Property Enquiries",
      count: data.newEnquiriesCount,
      href: "/admin/property-enquiries",
      icon: Mail,
      badge: "Buyer Leads",
      badgeColor: "bg-blue-100 text-blue-900",
    },
    {
      title: "Seller Intake Requests",
      count: data.newSellRequestsCount,
      href: "/admin/sell-requests",
      icon: Tag,
      badge: "Seller Leads",
      badgeColor: "bg-purple-100 text-purple-900",
    },
    {
      title: "Active Projects",
      count: data.activeProjectsCount,
      href: "/admin/projects",
      icon: FolderKanban,
      badge: "Site Logs",
      badgeColor: "bg-emerald-100 text-emerald-900",
    },
    {
      title: "Available Properties",
      count: data.availablePropertiesCount,
      href: "/admin/properties",
      icon: Building,
      badge: "Active Listings",
      badgeColor: "bg-emerald-100 text-emerald-900",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-poab-grey-border">
        <div>
          <h2 className="font-heading text-xl font-bold text-poab-navy">
            Site Management Overview
          </h2>
          <p className="text-xs text-poab-charcoal/70 mt-1 font-light">
            Live database records from public enquiries and site publication logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/projects/new"
            className="px-4 py-2.5 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold hover:bg-poab-navy-surface transition-colors flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4 text-poab-gold" />
            <span>Add Project</span>
          </Link>

          <Link
            href="/admin/properties/new"
            className="px-4 py-2.5 bg-poab-stone text-poab-navy border border-poab-grey-border text-xs uppercase tracking-wider font-semibold hover:bg-poab-stone-dark transition-colors flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4 text-poab-gold" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="p-5 bg-white border border-poab-grey-border hover:border-poab-navy/40 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                  <Icon className="w-4 h-4 text-poab-navy/60 group-hover:text-poab-gold transition-colors" />
                </div>
                <span className="font-heading text-3xl font-bold text-poab-navy block">
                  {card.count}
                </span>
                <span className="text-xs text-poab-charcoal/80 mt-1 block font-medium">
                  {card.title}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-poab-grey-border text-[11px] text-poab-charcoal/60 flex items-center justify-between">
                <span>View records</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Submissions Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Quotes */}
        <div className="bg-white border border-poab-grey-border p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-poab-grey-border mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-poab-gold" />
              <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                Recent Construction Quotes
              </h3>
            </div>
            <Link
              href="/admin/quotes"
              className="text-xs text-poab-navy hover:text-poab-gold font-semibold uppercase tracking-wider"
            >
              All Quotes →
            </Link>
          </div>

          {data.recentQuotes.length > 0 ? (
            <div className="space-y-3">
              {data.recentQuotes.map((q) => (
                <Link
                  key={q.id}
                  href={`/admin/quotes/${q.id}`}
                  className="p-3.5 bg-poab-stone-light/50 border border-poab-grey-border hover:bg-poab-stone-light transition-colors block text-xs"
                >
                  <div className="flex items-center justify-between font-mono text-[11px] text-poab-gold font-bold mb-1">
                    <span>{q.reference}</span>
                    <span className="text-poab-charcoal/60 font-sans font-normal">
                      {formatDate(q.created_at)}
                    </span>
                  </div>
                  <div className="font-bold text-poab-navy text-sm">{q.name}</div>
                  <div className="text-poab-charcoal/70 mt-0.5 truncate">
                    {q.project_type} • {q.location}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-poab-charcoal/60 font-light">
              No quote requests logged in database yet.
            </div>
          )}
        </div>

        {/* Recent Property Enquiries */}
        <div className="bg-white border border-poab-grey-border p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-poab-grey-border mb-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-poab-gold" />
              <h3 className="font-heading text-sm font-bold text-poab-navy uppercase tracking-wider">
                Recent Property Enquiries
              </h3>
            </div>
            <Link
              href="/admin/property-enquiries"
              className="text-xs text-poab-navy hover:text-poab-gold font-semibold uppercase tracking-wider"
            >
              All Enquiries →
            </Link>
          </div>

          {data.recentEnquiries.length > 0 ? (
            <div className="space-y-3">
              {data.recentEnquiries.map((enq) => (
                <Link
                  key={enq.id}
                  href={`/admin/property-enquiries/${enq.id}`}
                  className="p-3.5 bg-poab-stone-light/50 border border-poab-grey-border hover:bg-poab-stone-light transition-colors block text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-poab-charcoal/60 mb-1">
                    <span className="font-semibold text-poab-navy">{enq.name}</span>
                    <span>{formatDate(enq.created_at)}</span>
                  </div>
                  <p className="text-poab-charcoal/80 line-clamp-2 font-light">
                    {enq.message}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-poab-charcoal/60 font-light">
              No property enquiries recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
