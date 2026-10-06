import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  className,
  hoverEffect = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-poab-grey-border transition-all",
        hoverEffect && "hover:border-poab-navy/40 hover:shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
