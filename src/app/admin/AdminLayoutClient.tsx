"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useMobileNav } from "@/lib/hooks/useMobileNav";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen, open, close } = useMobileNav();

  // If on login page, render full-screen without sidebar/header
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-poab-navy">{children}</div>;
  }

  // Determine current page title
  const getPageTitle = () => {
    if (pathname === "/admin") return "Operational Dashboard";
    if (pathname.startsWith("/admin/projects")) return "Project Management";
    if (pathname.startsWith("/admin/properties")) return "Property Management";
    if (pathname.startsWith("/admin/quotes")) return "Quote Requests";
    if (pathname.startsWith("/admin/property-enquiries")) return "Property Enquiries";
    if (pathname.startsWith("/admin/sell-requests")) return "Seller Requests";
    if (pathname.startsWith("/admin/settings")) return "System Settings";
    return "Admin Portal";
  };

  return (
    <div className="min-h-screen bg-poab-stone-light/60 flex">
      <AdminSidebar isOpen={isOpen} onClose={close} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AdminHeader title={getPageTitle()} isOpen={isOpen} onOpenMobileMenu={open} />
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
