"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
}

export function MobileNav({ isOpen, onClose, navLinks }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="fixed inset-0 z-50 lg:hidden flex flex-col justify-between"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-poab-navy/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative z-10 w-full max-w-sm bg-poab-navy text-white h-full flex flex-col justify-between p-6 shadow-2xl border-r border-poab-navy-surface overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-poab-navy-surface">
            <Link href="/" onClick={onClose} className="focus:outline-none">
              <span className="font-heading text-lg font-bold tracking-wider text-white block">
                POAB GLOBAL
              </span>
              <span className="text-[10px] text-poab-gold uppercase tracking-widest block font-medium">
                Construction Company Ltd
              </span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-poab-stone hover:text-white focus:outline-none focus:ring-2 focus:ring-poab-gold"
              aria-label="Close Navigation Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 flex flex-col space-y-3" aria-label="Mobile Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`px-4 py-3 text-base font-medium tracking-wide flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-poab-navy-surface text-poab-gold border-l-2 border-poab-gold"
                      : "text-poab-stone hover:bg-poab-navy-surface/50 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-poab-navy-surface space-y-4">
          <Link
            href="/request-quote"
            onClick={onClose}
            className="w-full py-3.5 bg-poab-gold text-poab-navy font-semibold text-center block tracking-wide uppercase text-xs hover:bg-poab-gold-light active:bg-poab-gold-dark transition-colors"
          >
            Request a Quote
          </Link>

          <Link
            href="/sell-property"
            onClick={onClose}
            className="w-full py-3 text-poab-stone hover:text-white text-center block text-xs tracking-wide uppercase border border-poab-navy-surface"
          >
            Sell a Property
          </Link>

          <div className="text-center text-[11px] text-poab-stone/60 pt-2">
            <span>{COMPANY_INFO.rcNumber}</span> • <span>{COMPANY_INFO.headOffice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
