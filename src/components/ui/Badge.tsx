import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "navy" | "gold" | "stone" | "success" | "warning" | "sold" | "withdrawn" | "outline";
}

export function Badge({
  className,
  variant = "stone",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    navy: "bg-poab-navy text-white border-poab-navy",
    gold: "bg-poab-gold/15 text-poab-navy border-poab-gold/40 font-semibold",
    stone: "bg-poab-stone text-poab-charcoal border-poab-grey-border",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    sold: "bg-red-900 text-white border-red-900 font-bold tracking-widest",
    withdrawn: "bg-slate-100 text-slate-700 border-slate-300 font-medium",
    outline: "bg-transparent text-poab-charcoal border-poab-grey-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium border uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
