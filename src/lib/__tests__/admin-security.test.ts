import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PUT as updateQuote } from "@/app/api/admin/quotes/route";
import { PUT as updatePropertyEnquiry } from "@/app/api/admin/property-enquiries/route";
import { PUT as updateSellRequest } from "@/app/api/admin/sell-requests/route";
import { GET as getAttachment } from "@/app/api/admin/attachments/route";

// Mock Supabase Server, Admin, and Auth modules
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

describe("Batch 1: Admin Security & Document Access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Admin Authorization Guards on Enquiry & Lead Routes", () => {
    it("rejects unauthenticated requests to PUT /api/admin/quotes with HTTP 401", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/admin/quotes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "quote-123", status: "Contacted" }),
      });

      const res = await updateQuote(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });

    it("rejects non-admin role requests to PUT /api/admin/property-enquiries with HTTP 401", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "user-456",
        email: "user@example.com",
        role: "viewer", // not admin or super_admin
      });

      const req = new NextRequest("http://localhost:3000/api/admin/property-enquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "enq-123", status: "Contacted" }),
      });

      const res = await updatePropertyEnquiry(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });

    it("rejects unauthenticated requests to PUT /api/admin/sell-requests with HTTP 401", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/admin/sell-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "sell-123", status: "Reviewing" }),
      });

      const res = await updateSellRequest(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });
  });

  describe("2. Secure Private Attachment Access (GET /api/admin/attachments)", () => {
    it("rejects unauthenticated download requests with HTTP 401", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue(null);

      const req = new NextRequest(
        "http://localhost:3000/api/admin/attachments?type=quote&recordId=q-1&attachmentId=att-1"
      );

      const res = await getAttachment(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });

    it("rejects invalid attachment type with HTTP 400", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "admin-1",
        email: "admin@poab.com",
        role: "admin",
      });

      const req = new NextRequest(
        "http://localhost:3000/api/admin/attachments?type=invalid&recordId=q-1&attachmentId=att-1"
      );

      const res = await getAttachment(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Invalid attachment type");
    });

    it("rejects path traversal or malicious storage paths", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "admin-1",
        email: "admin@poab.com",
        role: "admin",
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: "att-1",
              quote_id: "q-1",
              storage_path: "../../../secret-env-file",
              file_name: "plan.pdf",
            },
            error: null,
          }),
        }),
      };

      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as any);

      const req = new NextRequest(
        "http://localhost:3000/api/admin/attachments?type=quote&recordId=q-1&attachmentId=att-1"
      );

      const res = await getAttachment(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Invalid attachment storage path");
    });

    it("returns 404 if attachment is not associated with the record", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "admin-1",
        email: "admin@poab.com",
        role: "admin",
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Row not found" },
          }),
        }),
      };

      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as any);

      const req = new NextRequest(
        "http://localhost:3000/api/admin/attachments?type=quote&recordId=q-wrong&attachmentId=att-1"
      );

      const res = await getAttachment(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toContain("Attachment not found");
    });

    it("generates a signed download URL for authorized admin with verified ownership", async () => {
      vi.mocked(verifyAdminSession).mockResolvedValue({
        userId: "admin-1",
        email: "admin@poab.com",
        role: "super_admin",
      });

      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: "https://supabase.co/storage/v1/object/sign/quote-attachments/quotes/q-1/file.pdf?token=exp60" },
        error: null,
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: "att-1",
              quote_id: "q-1",
              storage_path: "quotes/q-1/abc.pdf",
              file_name: "structural_drawing.pdf",
            },
            error: null,
          }),
        }),
        storage: {
          from: vi.fn().mockReturnValue({
            createSignedUrl: mockCreateSignedUrl,
          }),
        },
      };

      vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as any);

      const req = new NextRequest(
        "http://localhost:3000/api/admin/attachments?type=quote&recordId=q-1&attachmentId=att-1"
      );

      const res = await getAttachment(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.url).toContain("token=exp60");
      expect(data.fileName).toBe("structural_drawing.pdf");
      expect(mockCreateSignedUrl).toHaveBeenCalledWith(
        "quotes/q-1/abc.pdf",
        60,
        { download: "structural_drawing.pdf" }
      );
    });
  });
});
