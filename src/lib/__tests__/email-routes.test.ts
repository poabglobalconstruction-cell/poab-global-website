import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST as handleContactPost } from "@/app/api/contact/route";
import { POST as handlePropertyEnquiryPost } from "@/app/api/property-enquiry/route";
import { NextRequest } from "next/server";
import * as emailModule from "@/lib/email";
import * as serverSupabase from "@/lib/supabase/server";

describe("Email & API Routes Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Contact Route API", () => {
    it("persists to database and sends notification email on successful submission", async () => {
      // Mock Supabase
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      vi.spyOn(serverSupabase, "createServerSupabaseClient").mockResolvedValue({
        from: mockFrom,
      } as any);

      // Spy email notification
      const sendEmailSpy = vi.spyOn(emailModule, "sendContactNotification").mockResolvedValue({
        success: true,
        id: "msg_test_123",
      });

      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Taiwo Hassan",
          email: "taiwo@example.com",
          phone: "+234 802 000 1111",
          subject: "Inquiry on Building Plan",
          message: "Please let us know how you handle building approval and architectural plans.",
        }),
      });

      const response = await handleContactPost(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledWith({
        name: "Taiwo Hassan",
        email: "taiwo@example.com",
        phone: "+234 802 000 1111",
        subject: "Inquiry on Building Plan",
        message: "Please let us know how you handle building approval and architectural plans.",
      });
    });

    it("still returns HTTP 200 success if email dispatch fails (Database is Source of Truth)", async () => {
      // Mock Supabase success
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.spyOn(serverSupabase, "createServerSupabaseClient").mockResolvedValue({
        from: vi.fn().mockReturnValue({ insert: mockInsert }),
      } as any);

      // Email dispatch fails / throws network error
      const sendEmailSpy = vi.spyOn(emailModule, "sendContactNotification").mockRejectedValue(
        new Error("Resend rate limit exceeded / network timeout")
      );

      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Kehinde Hassan",
          email: "kehinde@example.com",
          phone: "+234 802 000 2222",
          message: "A quick question about boundary fencing.",
        }),
      });

      const response = await handleContactPost(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
    });

    it("does NOT attempt to send email if database persistence fails", async () => {
      // Mock Supabase failure
      const mockInsert = vi.fn().mockResolvedValue({ error: { message: "Database connection failed" } });
      vi.spyOn(serverSupabase, "createServerSupabaseClient").mockResolvedValue({
        from: vi.fn().mockReturnValue({ insert: mockInsert }),
      } as any);

      const sendEmailSpy = vi.spyOn(emailModule, "sendContactNotification");

      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Failed Submitter",
          email: "fail@example.com",
          message: "This will fail on database insert.",
        }),
      });

      const response = await handleContactPost(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBeDefined();
      expect(sendEmailSpy).not.toHaveBeenCalled();
    });
  });

  describe("Property Enquiry Route API", () => {
    it("persists to database and sends notification with property context", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockPropertySelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { title: "Executive Villa in Ibadan", reference: "POAB-PROP-2026-0001" },
          }),
        }),
      });

      const mockFrom = vi.fn().mockImplementation((table: string) => {
        if (table === "property_enquiries") return { insert: mockInsert };
        if (table === "properties") return { select: mockPropertySelect };
        return {};
      });

      vi.spyOn(serverSupabase, "createServerSupabaseClient").mockResolvedValue({
        from: mockFrom,
      } as any);

      const sendEmailSpy = vi.spyOn(emailModule, "sendPropertyEnquiryNotification").mockResolvedValue({
        success: true,
      });

      const req = new NextRequest("http://localhost:3000/api/property-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: "a0000000-0000-0000-0000-000000000001",
          name: "Mrs. Alabi",
          email: "alabi@example.com",
          phone: "+234 803 555 7777",
          message: "Please schedule an inspection.",
        }),
      });

      const response = await handlePropertyEnquiryPost(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledWith({
        name: "Mrs. Alabi",
        email: "alabi@example.com",
        phone: "+234 803 555 7777",
        whatsapp: undefined,
        message: "Please schedule an inspection.",
        propertyTitle: "Executive Villa in Ibadan",
        propertyReference: "POAB-PROP-2026-0001",
        propertyId: "a0000000-0000-0000-0000-000000000001",
      });
    });

    it("survives email delivery errors and returns 200 success", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.spyOn(serverSupabase, "createServerSupabaseClient").mockResolvedValue({
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            }),
          }),
        }),
      } as any);

      vi.spyOn(emailModule, "sendPropertyEnquiryNotification").mockRejectedValue(
        new Error("Connection reset by peer")
      );

      const req = new NextRequest("http://localhost:3000/api/property-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: "a0000000-0000-0000-0000-000000000001",
          name: "Mr. Alabi",
          email: "alabi@example.com",
          phone: "+234 803 555 7777",
          message: "Checking availability.",
        }),
      });

      const response = await handlePropertyEnquiryPost(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });
});
