"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export interface MobileNavOptions {
  breakpoint?: number; // default: 1024 (Tailwind lg)
}

export function useMobileNav(options: MobileNavOptions = {}) {
  const { breakpoint = 1024 } = options;
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // 1. Unconditionally close when route/pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // 2. Listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // 3. Reset when viewport expands to desktop breakpoint
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= breakpoint) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, breakpoint]);

  // 4. Safely manage body scroll lock with cleanup guarantee
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle === "hidden" ? "" : originalStyle;
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
