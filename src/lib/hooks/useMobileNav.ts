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

  // 4. Robust cross-browser and mobile Safari body scroll lock with scroll position preservation
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isOpen) {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      // Lock documentElement and fixed body with negative top offset for iOS Safari
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        window.scrollTo(0, scrollY);
      };
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    }
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
