import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMobileNav } from "../useMobileNav";

// Mock next/navigation usePathname
let currentPathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

describe("useMobileNav hook", () => {
  beforeEach(() => {
    currentPathname = "/";
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
    vi.restoreAllMocks();
  });

  it("initializes with closed state and unlocked body scroll", () => {
    const { result } = renderHook(() => useMobileNav());
    expect(result.current.isOpen).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("locks body scroll when opened and restores scroll when closed", () => {
    const { result } = renderHook(() => useMobileNav());

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("closes when Escape key is pressed", () => {
    const { result } = renderHook(() => useMobileNav());

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.isOpen).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("resets scroll lock cleanly on unmount", () => {
    const { result, unmount } = renderHook(() => useMobileNav());

    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
