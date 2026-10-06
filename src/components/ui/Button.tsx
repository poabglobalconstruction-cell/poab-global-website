import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      href,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-poab-gold disabled:opacity-50 disabled:pointer-events-none select-none";

    const variantStyles = {
      primary:
        "bg-poab-navy text-white hover:bg-poab-navy-surface border border-poab-navy active:bg-poab-navy-deep",
      secondary:
        "bg-poab-stone text-poab-navy hover:bg-poab-stone-dark border border-poab-grey-border",
      outline:
        "bg-transparent text-poab-navy hover:bg-poab-stone/50 border border-poab-navy/20",
      gold:
        "bg-poab-gold text-poab-navy font-semibold hover:bg-poab-gold-light border border-poab-gold-dark active:bg-poab-gold-dark",
      ghost:
        "bg-transparent text-poab-navy hover:bg-poab-stone/60 active:bg-poab-stone",
      danger:
        "bg-red-700 text-white hover:bg-red-800 border border-red-800",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs tracking-wider uppercase",
      md: "h-11 px-6 text-sm tracking-wide",
      lg: "h-13 px-8 text-base tracking-wide",
    };

    const combinedClassName = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (href) {
      return (
        <Link href={href} className={combinedClassName}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
