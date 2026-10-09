"use client";

import React from "react";
import { Menu, ShieldCheck } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  isOpen?: boolean;
  onOpenMobileMenu: () => void;
}

export function AdminHeader({ title, isOpen = false, onOpenMobileMenu }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-poab-grey-border h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-expanded={isOpen}
          className="p-2 text-poab-navy hover:bg-poab-stone lg:hidden"
          aria-label="Open Admin Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-heading text-lg sm:text-xl font-bold text-poab-navy tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-poab-stone-light border border-poab-grey-border text-poab-navy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/poab-pillar.svg"
            alt="POAB"
            width={14}
            height={16}
            className="w-3.5 h-4 object-contain"
          />
          <span className="font-semibold uppercase tracking-wider text-[10px]">
            Admin Session
          </span>
        </div>
      </div>
    </header>
  );
}
