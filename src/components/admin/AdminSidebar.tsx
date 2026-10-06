"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Building,
  FileText,
  Mail,
  Tag,
  Settings,
  LogOut,
  X,
  HardHat,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/properties", label: "Properties", icon: Building },
  { href: "/admin/quotes", label: "Quote Requests", icon: FileText },
  { href: "/admin/property-enquiries", label: "Property Enquiries", icon: Mail },
  { href: "/admin/sell-requests", label: "Sell Requests", icon: Tag },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore
    } finally {
      router.push("/admin/login");
    }
  };

  const content = (
    <div className="h-full flex flex-col justify-between bg-poab-navy text-white p-5 border-r border-poab-navy-surface">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-poab-navy-surface">
          <Link href="/admin" onClick={onClose} className="block">
            <div className="flex items-center space-x-2">
              <HardHat className="w-5 h-5 text-poab-gold" />
              <span className="font-heading text-base font-bold tracking-wider text-white">
                POAB ADMIN
              </span>
            </div>
            <span className="text-[10px] text-poab-stone/60 uppercase tracking-widest block font-mono">
              Management Portal V1
            </span>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-poab-stone hover:text-white lg:hidden"
            aria-label="Close Admin Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1" aria-label="Admin Navigation">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-3.5 py-2.5 text-xs uppercase tracking-wider font-medium transition-colors ${
                  isActive
                    ? "bg-poab-navy-surface text-poab-gold border-l-2 border-poab-gold"
                    : "text-poab-stone hover:bg-poab-navy-surface/50 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout / Bottom Actions */}
      <div className="pt-6 border-t border-poab-navy-surface space-y-3">
        <Link
          href="/"
          target="_blank"
          className="text-[11px] text-poab-stone/70 hover:text-white block px-2 tracking-wide"
        >
          ↗ View Live Website
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs uppercase tracking-wider text-red-300 hover:text-red-200 hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer (Overlay with auto-close) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin Navigation Menu"
          className="fixed inset-0 z-50 lg:hidden flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-poab-navy/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="relative z-10 w-72 h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
