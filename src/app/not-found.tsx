import React from "react";
import Link from "next/link";
import { Compass, Home, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-poab-stone-light flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="max-w-md bg-white border border-poab-grey-border p-8 sm:p-12 shadow-xs">
        <div className="w-12 h-12 bg-poab-stone text-poab-navy mx-auto flex items-center justify-center mb-6">
          <ShieldAlert className="w-6 h-6 text-poab-gold" />
        </div>

        <span className="font-mono text-xs uppercase tracking-widest text-poab-charcoal/60 font-semibold block mb-2">
          Error 404
        </span>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-poab-navy mb-4">
          This page isn&apos;t part of the plan.
        </h1>

        <p className="text-xs sm:text-sm text-poab-charcoal/80 font-light leading-relaxed mb-8">
          The requested coordinate or project resource does not exist or may have been relocated during our site archive updates.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-poab-navy text-white text-xs uppercase tracking-wider font-semibold hover:bg-poab-navy-surface transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4 text-poab-gold" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/projects"
            className="px-6 py-3 bg-white border border-poab-grey-border text-poab-navy text-xs uppercase tracking-wider font-semibold hover:bg-poab-stone transition-colors flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4" />
            <span>View Projects</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
