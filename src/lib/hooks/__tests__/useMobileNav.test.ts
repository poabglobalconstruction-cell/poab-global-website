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
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.documentElement.style.overflow = "";
    window.scrollY = 0;
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.documentElement.style.overflow = "";
    vi.restoreAllMocks();
  });

  it("initializes with closed state and unlocked body scroll", () => {
    const { result } = renderHook(() => useMobileNav());
    expect(result.current.isOpen).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
  });

  it("locks body scroll when opened and restores scroll when closed", () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.scrollY = 240;

    const { result } = renderHook(() => useMobileNav());

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-240px");

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
    expect(document.body.style.overflow).toBe("");
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
    expect(document.body.style.top).toBe("");
    expect(scrollToSpy).toHaveBeenCalledWith(0, 240);
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
    expect(document.body.style.position).toBe("");
  });

  it("resets scroll lock cleanly on unmount", () => {
    const { result, unmount } = renderHook(() => useMobileNav());

    act(() => {
      result.current.open();
    });
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");

    unmount();
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
  });
});
