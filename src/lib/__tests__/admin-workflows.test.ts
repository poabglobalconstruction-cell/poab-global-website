// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveUniqueSlug, slugify } from "@/lib/slug";
import { POST as createProject } from "@/app/api/admin/projects/route";
import { POST as createProperty } from "@/app/api/admin/properties/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/auth", () => ({
  verifyAdminSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(),
}));

import { verifyAdminSession } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Batch 2 & 3: Project/Property Workflows and Media", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Slug Resolution & Automatic De-duplication", () => {
    it("generates a clean URL slug from title", () => {
      expect(slugify("Residential Apartment Development")).toBe("residential-apartment-development");
      expect(slugify("  2 Plots of Land, Ibadan!  ")).toBe("2-plots-of-land-ibadan");
    });

    it("returns base slug if no collision exists in database", async () => {
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };

      const result = await resolveUniqueSlug(
        mockClient as any,
        "projects",
        "Residential Apartment Development"
      );

      expect(result).toBe("residential-apartment-development");
    });

    it("automatically suffixes -2 when base slug already exists", async () => {
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col, val) => ({
            maybeSingle: vi.fn().mockImplementation(async () => {
              if (val === "residential-apartment-development") {
                return { data: { id: "existing-proj-1" }, error: null };
              }
              return { data: null, error: null };
            }),
          })),
        }),
      };

      const result = await resolveUniqueSlug(
        mockClient as any,
        "projects",
        "Residential Apartment Development"
      );

      expect(result).toBe("residential-apartment-development-2");
    });
  });

  describe("2. Project Creation with Initial Stage Support", () => {
    it("creates project and initial stage when initial_stage_title is provided", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "admin-1",
        email: "admin@poab.com",
        role: "admin",
      });

      const mockProjectInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "new-proj-uuid", slug: "residential-apartment-development" },
            error: null,
          }),
        }),
      });

      const mockStageInsert = vi.fn().mockResolvedValue({ data: null, error: null });

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "projects") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              insert: mockProjectInsert,
            };
          }
          if (table === "project_stages") {
            return {
              insert: mockStageInsert,
            };
          }
          return {};
        }),
      };

      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as any);

      const req = new NextRequest("http://localhost:3000/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Residential Apartment Development",
          location: "Ogun State, Nigeria",
          short_description: "Three mini-flats upstairs and one self-contained apartment downstairs.",
          status: "Ongoing",
          initial_stage_title: "Awaiting plastering",
          initial_stage_description: "Blockwork completed, ready for plastering",
        }),
      });

      const res = await createProject(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockProjectInsert).toHaveBeenCalled();
      expect(mockStageInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: "new-proj-uuid",
          title: "Awaiting plastering",
        })
      );
    });
  });

  describe("3. Media Upload Validation (POST /api/admin/media/upload)", () => {
    it("rejects unauthenticated media upload requests", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue(null);

      const { POST: uploadMedia } = await import("@/app/api/admin/media/upload/route");

      const formData = new FormData();
      formData.append("bucket", "project-images");

      const req = new NextRequest(
        new Request("http://localhost:3000/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })
      );

      const res = await uploadMedia(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });

    it("rejects invalid storage bucket with HTTP 400", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "admin-1",
        email: "admin@poab.com",
        role: "admin",
      });

      const { POST: uploadMedia } = await import("@/app/api/admin/media/upload/route");

      const file = new File(["test image content"], "test.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "unauthorized-bucket");

      const req = new NextRequest(
        new Request("http://localhost:3000/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })
      );

      const res = await uploadMedia(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Invalid storage bucket");
    });

    it("rejects unsupported MIME types with HTTP 400", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "admin-1",
        email: "admin@poab.com",
        role: "admin",
      });

      const { POST: uploadMedia } = await import("@/app/api/admin/media/upload/route");

      const file = new File(["fake pdf content"], "doc.pdf", { type: "application/pdf" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "project-images");

      const req = new NextRequest(
        new Request("http://localhost:3000/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })
      );

      const res = await uploadMedia(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Unsupported image format");
    });

    it("rejects files exceeding 15MB with HTTP 400", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "admin-1",
        email: "admin@poab.com",
        role: "admin",
      });

      const { POST: uploadMedia } = await import("@/app/api/admin/media/upload/route");

      // Real 16MB buffer so undici stream retains accurate size (>15MB)
      const file = new File([new Uint8Array(16 * 1024 * 1024)], "giant.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "project-images");

      const req = new NextRequest(
        new Request("http://localhost:3000/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })
      );

      const res = await uploadMedia(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("File exceeds 15MB limit");
    });

    it("uploads valid image and returns public URL", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "admin-1",
        email: "admin@poab.com",
        role: "admin",
      });

      const mockUpload = vi.fn().mockResolvedValue({ data: { path: "gallery/abc.jpg" }, error: null });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: "https://supabase.co/storage/v1/object/public/project-images/gallery/abc.jpg" },
      });

      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload,
            getPublicUrl: mockGetPublicUrl,
          }),
        },
      };

      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as any);

      const { POST: uploadMedia } = await import("@/app/api/admin/media/upload/route");

      const file = new File(["valid image content"], "site_photo.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "project-images");
      formData.append("folder", "gallery");

      const req = new NextRequest(
        new Request("http://localhost:3000/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })
      );

      const res = await uploadMedia(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.publicUrl).toContain("project-images/gallery/abc.jpg");
      expect(mockUpload).toHaveBeenCalled();
    });
  });
});
