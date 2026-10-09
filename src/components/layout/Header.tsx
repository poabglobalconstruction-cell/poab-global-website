"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useMobileNav } from "@/lib/hooks/useMobileNav";
import { MobileNav } from "./MobileNav";
import { COMPANY_INFO } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/properties", label: "Properties" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { isOpen, open, close } = useMobileNav();

  return (
    <header className="sticky top-0 z-40 w-full bg-poab-navy border-b border-poab-navy-surface/80 text-white shadow-md">
      {/* Top Credentials Micro-bar */}
      <div className="bg-poab-navy-deep py-1.5 px-4 sm:px-8 border-b border-poab-navy-surface text-xs text-poab-stone/75 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-poab-gold text-[11px] tracking-wider uppercase">
            {COMPANY_INFO.rcNumber}
          </span>
          <span className="hidden sm:inline-block text-[11px]">
            {COMPANY_INFO.experienceStatement}
          </span>
        </div>
        <div className="text-[11px] text-poab-stone/80">
          <span>{COMPANY_INFO.operationsCoverage}</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo / Slot */}
        <Link
          href="/"
          className="flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poab-gold rounded-sm group"
        >
          <div className="relative w-10 h-12 flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/poab-pillar.svg"
              alt="POAB Global Monogram Pillar Logo"
              width={40}
              height={48}
              className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl sm:text-2xl font-bold tracking-wider text-white group-hover:text-poab-gold transition-colors leading-tight">
              POAB GLOBAL
            </span>
            <span className="text-[10px] sm:text-[11px] text-poab-gold uppercase tracking-[0.2em] font-medium leading-tight">
              Construction Company Ltd
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 text-sm font-medium tracking-wide transition-colors relative ${
                  isActive
                    ? "text-poab-gold"
                    : "text-poab-stone hover:text-white hover:bg-poab-navy-surface/40"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-poab-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link
            href="/request-quote"
            className="px-5 py-2.5 bg-poab-gold text-poab-navy text-xs font-semibold uppercase tracking-wider hover:bg-poab-gold-light active:bg-poab-gold-dark transition-colors border border-poab-gold-dark"
          >
            Request a Quote
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex lg:hidden items-center">
          <button
            type="button"
            onClick={open}
            aria-expanded={isOpen}
            aria-label="Open Navigation Menu"
            className="p-2.5 text-poab-stone hover:text-white hover:bg-poab-navy-surface transition-colors focus:outline-none focus:ring-2 focus:ring-poab-gold"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Render Mobile Navigation Drawer */}
      <MobileNav isOpen={isOpen} onClose={close} navLinks={NAV_LINKS} />
    </header>
  );
}
