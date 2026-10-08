import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sanitizeContactSettings,
  fetchRawContactSettings,
  getPublicContactSettings,
  DEFAULT_CONTACT_SETTINGS,
} from "../contact-settings";
import { COMPANY_INFO, DEPARTMENT_EMAILS } from "../constants";
import { sendEmail } from "../email";
import { PUT as handleSettingsPut } from "@/app/api/admin/settings/route";
import { NextRequest } from "next/server";
import * as authModule from "@/lib/supabase/auth";
import * as serverSupabase from "@/lib/supabase/server";
import * as adminSupabase from "@/lib/supabase/admin";
import * as cacheModule from "next/cache";

vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((fn) => fn),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

describe("Admin-Managed Public Contact Settings Architecture", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("1. Sanitization & Untrusted Input Protection", () => {
    it("returns safe defaults when input is null, undefined, or non-object", () => {
      expect(sanitizeContactSettings(null)).toEqual(DEFAULT_CONTACT_SETTINGS);
      expect(sanitizeContactSettings(undefined)).toEqual(DEFAULT_CONTACT_SETTINGS);
      expect(sanitizeContactSettings("string")).toEqual(DEFAULT_CONTACT_SETTINGS);
      expect(sanitizeContactSettings(123)).toEqual(DEFAULT_CONTACT_SETTINGS);
    });

    it("falls back to default official_email when provided email is invalid format", () => {
      const sanitized = sanitizeContactSettings({
        official_email: "invalid-not-an-email",
        office_address: "Custom Lagos Office",
      });

      expect(sanitized.official_email).toBe("info@poabglobalconstruction.com");
      expect(sanitized.office_address).toBe("Custom Lagos Office");
    });

    it("accepts valid email and custom contact details from database", () => {
      const sanitized = sanitizeContactSettings({
        official_email: "hello@poabglobalconstruction.com",
        public_phone: "+234 801 234 5678",
        whatsapp_number: "+234 809 999 8888",
        office_address: "Plot 12, Ring Road, Ibadan",
        business_hours: "Mon - Sat: 8:00 AM - 6:00 PM",
      });

      expect(sanitized.official_email).toBe("hello@poabglobalconstruction.com");
      expect(sanitized.public_phone).toBe("+234 801 234 5678");
      expect(sanitized.whatsapp_number).toBe("+234 809 999 8888");
      expect(sanitized.office_address).toBe("Plot 12, Ring Road, Ibadan");
      expect(sanitized.business_hours).toBe("Mon - Sat: 8:00 AM - 6:00 PM");
    });

    it("distinguishes intentionally blank optional fields without creating broken values", () => {
      const sanitized = sanitizeContactSettings({
        official_email: "info@poabglobalconstruction.com",
        public_phone: "",
        whatsapp_number: "   ",
        business_hours: null,
      });

      expect(sanitized.public_phone).toBe("");
      expect(sanitized.whatsapp_number).toBe("");
      expect(sanitized.business_hours).toBe("");
      expect(sanitized.office_address).toBe(COMPANY_INFO.headOffice);
    });
  });

  describe("2. Database Reader & Fallback Resilience", () => {
    it("reads custom contact values from Supabase mock client", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          value: {
            official_email: "admin-updated@poabglobalconstruction.com",
            public_phone: "+234 803 000 0000",
            whatsapp_number: "+234 803 000 0000",
            office_address: "Ibadan Head Office, Bodija",
            business_hours: "8am - 5pm",
          },
        },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockClient = { from: mockFrom };

      const result = await fetchRawContactSettings(mockClient);

      expect(result.official_email).toBe("admin-updated@poabglobalconstruction.com");
      expect(result.public_phone).toBe("+234 803 000 0000");
      expect(result.office_address).toBe("Ibadan Head Office, Bodija");
    });

    it("survives missing database row without throwing and returns safe defaults", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Row not found" },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      const mockClient = { from: mockFrom };

      const result = await fetchRawContactSettings(mockClient);

      expect(result).toEqual(DEFAULT_CONTACT_SETTINGS);
    });

    it("survives network / database exceptions without throwing", async () => {
      const mockFrom = vi.fn().mockImplementation(() => {
        throw new Error("Connection timed out to Supabase host");
      });
      const mockClient = { from: mockFrom };

      const result = await fetchRawContactSettings(mockClient);

      expect(result).toEqual(DEFAULT_CONTACT_SETTINGS);
    });

    it("getPublicContactSettings uses raw fetcher in test environment", async () => {
      const settings = await getPublicContactSettings();
      expect(settings).toBeDefined();
      expect(settings.official_email).toBeDefined();
    });
  });

  describe("3. Admin Settings API Security & Revalidation", () => {
    it("rejects unauthenticated requests with 401 Unauthorized", async () => {
      vi.spyOn(authModule, "verifyAdminSession").mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "contact_channels",
          value: { official_email: "hacked@example.com" },
        }),
      });

      const res = await handleSettingsPut(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toContain("Active administrator privileges required");
      expect(cacheModule.revalidateTag).not.toHaveBeenCalled();
      expect(cacheModule.revalidatePath).not.toHaveBeenCalled();
    });

    it("rejects locked corporate identity modifications (company_info) with 403 Forbidden", async () => {
      vi.spyOn(authModule, "verifyAdminSession").mockResolvedValue({
        userId: "admin-uuid-1",
        email: "admin@poabglobalconstruction.com",
        role: "admin",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "company_info",
          value: { name: "Different Name" },
        }),
      });

      const res = await handleSettingsPut(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain("Legal corporate identity settings are locked");
      expect(cacheModule.revalidateTag).not.toHaveBeenCalled();
      expect(cacheModule.revalidatePath).not.toHaveBeenCalled();
    });

    it("rejects invalid email format with 400 Bad Request", async () => {
      vi.spyOn(authModule, "verifyAdminSession").mockResolvedValue({
        userId: "admin-uuid-1",
        email: "admin@poabglobalconstruction.com",
        role: "admin",
      });

      const req = new NextRequest("http://localhost:3000/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "contact_channels",
          value: { official_email: "not-an-email" },
        }),
      });

      const res = await handleSettingsPut(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain("Invalid email format");
      expect(cacheModule.revalidateTag).not.toHaveBeenCalled();
      expect(cacheModule.revalidatePath).not.toHaveBeenCalled();
    });

    it("does NOT invalidate caches if database upsert fails", async () => {
      vi.spyOn(authModule, "verifyAdminSession").mockResolvedValue({
        userId: "admin-uuid-1",
        email: "admin@poabglobalconstruction.com",
        role: "admin",
      });

      const mockUpsert = vi.fn().mockResolvedValue({
        error: { message: "Database connection failed" },
      });
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          upsert: mockUpsert,
        }),
      };
      vi.spyOn(serverSupabase, "createServerSupabaseClient").mockResolvedValue(mockClient as any);
      vi.spyOn(adminSupabase, "createAdminSupabaseClient").mockReturnValue(mockClient as any);

      const req = new NextRequest("http://localhost:3000/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "contact_channels",
          value: { official_email: "new@poabglobalconstruction.com" },
        }),
      });

      const res = await handleSettingsPut(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe("Database connection failed");
      expect(cacheModule.revalidateTag).not.toHaveBeenCalled();
      expect(cacheModule.revalidatePath).not.toHaveBeenCalled();
    });

    it("authorizes valid admin, merges existing values, persists to Supabase, and revalidates caches", async () => {
      vi.spyOn(authModule, "verifyAdminSession").mockResolvedValue({
        userId: "admin-uuid-1",
        email: "admin@poabglobalconstruction.com",
        role: "admin",
      });

      // Mock database clients
      let upsertedRecord: any = null;
      const mockUpsert = vi.fn().mockImplementation((payload) => {
        upsertedRecord = payload;
        return { error: null };
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          value: {
            official_email: "poabglobalconstruction@gmail.com",
            legacy_custom_field: "preserve_me",
          },
        },
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
        upsert: mockUpsert,
      });

      const mockClient = { from: mockFrom };
      vi.spyOn(serverSupabase, "createServerSupabaseClient").mockResolvedValue(mockClient as any);
      vi.spyOn(adminSupabase, "createAdminSupabaseClient").mockReturnValue(mockClient as any);

      const req = new NextRequest("http://localhost:3000/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "contact_channels",
          value: {
            official_email: "info@poabglobalconstruction.com",
            public_phone: "+234 801 111 2222",
          },
        }),
      });

      const res = await handleSettingsPut(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify upsert merged and preserved existing fields
      expect(upsertedRecord.key).toBe("contact_channels");
      expect(upsertedRecord.value.official_email).toBe("info@poabglobalconstruction.com");
      expect(upsertedRecord.value.public_phone).toBe("+234 801 111 2222");
      expect(upsertedRecord.value.legacy_custom_field).toBe("preserve_me");

      // Verify cache invalidation occurred
      expect(cacheModule.revalidateTag).toHaveBeenCalledWith("contact-channels");
      expect(cacheModule.revalidateTag).toHaveBeenCalledWith("site-settings");
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith("/", "layout");
      expect(cacheModule.revalidatePath).toHaveBeenCalledWith("/contact", "page");
    });
  });

  describe("4. Preservation of Notifications & Departmental Routing", () => {
    it("ensures internal Resend notification recipient remains poabglobalconstruction@gmail.com", async () => {
      delete process.env.NOTIFICATION_EMAIL;
      process.env.RESEND_API_KEY = "re_mock_key_999";

      let capturedBody: any = null;
      const mockFetch = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
        capturedBody = JSON.parse(init.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: "msg_ok" }),
        };
      });
      vi.stubGlobal("fetch", mockFetch);

      await sendEmail({
        subject: "Test Dispatch",
        html: "<p>Test</p>",
        text: "Test",
      });

      expect(capturedBody.to).toEqual(["poabglobalconstruction@gmail.com"]);
    });

    it("preserves fixed departmental addresses in DEPARTMENT_EMAILS constants", () => {
      expect(DEPARTMENT_EMAILS.general).toBe("info@poabglobalconstruction.com");
      expect(DEPARTMENT_EMAILS.service).toBe("service@poabglobalconstruction.com");
      expect(DEPARTMENT_EMAILS.projects).toBe("projects@poabglobalconstruction.com");
      expect(DEPARTMENT_EMAILS.properties).toBe("properties@poabglobalconstruction.com");
    });
  });
});
