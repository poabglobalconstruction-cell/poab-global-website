import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  escapeHtml,
  sendEmail,
  sendQuoteNotification,
  sendContactNotification,
  sendPropertyEnquiryNotification,
  sendSellPropertyNotification,
} from "../email";
import { COMPANY_INFO, DEPARTMENT_EMAILS } from "../constants";

describe("Email Utility & Resend Integration", () => {
  describe("Company & Department Email Constants", () => {
    it("configures officialEmail as info@poabglobalconstruction.com", () => {
      expect(COMPANY_INFO.officialEmail).toBe("info@poabglobalconstruction.com");
    });

    it("configures the 4 professional departmental forwarding addresses", () => {
      expect(DEPARTMENT_EMAILS.general).toBe("info@poabglobalconstruction.com");
      expect(DEPARTMENT_EMAILS.service).toBe("service@poabglobalconstruction.com");
      expect(DEPARTMENT_EMAILS.projects).toBe("projects@poabglobalconstruction.com");
      expect(DEPARTMENT_EMAILS.properties).toBe("properties@poabglobalconstruction.com");
    });
  });
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("HTML Escaping", () => {
    it("escapes dangerous HTML characters to prevent injection", () => {
      const malicious = '<script>alert("xss")</script> & \'test\'';
      const escaped = escapeHtml(malicious);
      expect(escaped).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;test&#39;");
      expect(escaped).not.toContain("<script>");
    });

    it("handles null, undefined, and empty strings gracefully", () => {
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
      expect(escapeHtml("")).toBe("");
    });
  });

  describe("sendEmail Core Dispatcher", () => {
    it("skips dispatch and returns safe status when RESEND_API_KEY is not configured", async () => {
      delete process.env.RESEND_API_KEY;

      const result = await sendEmail({
        subject: "Test Subject",
        html: "<p>Test</p>",
        text: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.error).toContain("RESEND_API_KEY not configured");
    });

    it("sends email with correct Resend headers, payload, and configured sender/recipient", async () => {
      process.env.RESEND_API_KEY = "re_mock_test_key_12345";
      process.env.EMAIL_FROM = "POAB Website <notifications@poabglobalconstruction.com>";
      process.env.NOTIFICATION_EMAIL = "poabglobalconstruction@gmail.com";

      let capturedUrl = "";
      let capturedInit: RequestInit | undefined;

      const mockFetch = vi.fn().mockImplementation(async (url: string, init: RequestInit) => {
        capturedUrl = url;
        capturedInit = init;
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: "msg_mock_resend_id_999" }),
        };
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await sendEmail({
        subject: "[POAB] New Lead Notification",
        replyTo: "client@example.com",
        html: "<p>Lead content</p>",
        text: "Lead content",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("msg_mock_resend_id_999");
      expect(capturedUrl).toBe("https://api.resend.com/emails");

      const headers = capturedInit?.headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer re_mock_test_key_12345");
      expect(headers["Content-Type"]).toBe("application/json");

      const body = JSON.parse(capturedInit?.body as string);
      expect(body.from).toBe("POAB Website <notifications@poabglobalconstruction.com>");
      expect(body.to).toEqual(["poabglobalconstruction@gmail.com"]);
      expect(body.reply_to).toBe("client@example.com");
      expect(body.subject).toBe("[POAB] New Lead Notification");
    });

    it("falls back to internal official Gmail when NOTIFICATION_EMAIL is not explicitly set", async () => {
      process.env.RESEND_API_KEY = "re_mock_test_key_12345";
      delete process.env.NOTIFICATION_EMAIL;

      let capturedInit: RequestInit | undefined;
      const mockFetch = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
        capturedInit = init;
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: "msg_fallback_id" }),
        };
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await sendEmail({
        subject: "[POAB] Internal Notification",
        html: "<p>Internal</p>",
        text: "Internal",
      });

      expect(result.success).toBe(true);
      const body = JSON.parse(capturedInit?.body as string);
      expect(body.to).toEqual(["poabglobalconstruction@gmail.com"]);
    });

    it("safely handles Resend HTTP error responses without throwing", async () => {
      process.env.RESEND_API_KEY = "re_mock_test_key_12345";

      const mockFetch = vi.fn().mockImplementation(async () => {
        return {
          ok: false,
          status: 403,
          text: async () => JSON.stringify({ message: "Domain not verified" }),
        };
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await sendEmail({
        subject: "Test",
        html: "<p>Test</p>",
        text: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Resend HTTP 403");
    });

    it("safely handles network exceptions or timeouts without throwing", async () => {
      process.env.RESEND_API_KEY = "re_mock_test_key_12345";

      const mockFetch = vi.fn().mockRejectedValue(new Error("Network connection reset"));
      vi.stubGlobal("fetch", mockFetch);

      const result = await sendEmail({
        subject: "Test",
        html: "<p>Test</p>",
        text: "Test",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network connection reset");
    });
  });

  describe("Notification Templates & Workflow Triggers", () => {
    let capturedBody: any = null;

    beforeEach(() => {
      process.env.RESEND_API_KEY = "re_test_key";
      process.env.EMAIL_FROM = "POAB Website <notifications@poabglobalconstruction.com>";
      process.env.NOTIFICATION_EMAIL = "poabglobalconstruction@gmail.com";

      const mockFetch = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
        capturedBody = JSON.parse(init.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: "msg_success_123" }),
        };
      });
      vi.stubGlobal("fetch", mockFetch);
    });

    it("1. Quote Request Notification: formats correct subject, fields, admin link, and escapes HTML", async () => {
      await sendQuoteNotification({
        quoteId: "quote-uuid-101",
        reference: "POAB-REQ-2026-0042",
        name: "Babajide Sanwo <script>alert(1)</script>",
        phone: "+234 803 123 4567",
        email: "babajide@example.com",
        whatsapp: "+234 803 123 4567",
        preferred_contact: "whatsapp",
        project_type: "Duplex",
        location: "Bodija, Ibadan",
        land_size: "600 sqm",
        floors: "2",
        bedrooms: "5",
        current_stage: "Site Preparation & Securing",
        budget_range: "₦30,000,000 - ₦60,000,000",
        timeline: "1 - 3 months",
        has_building_plan: true,
        description: "Complete 5-bedroom duplex foundation-to-finish & structural work.",
        project_inspiration: "Modern minimalist facade with stone finishes.",
        filesCount: 2,
      });

      expect(capturedBody.subject).toBe("[POAB] New Quote Request - POAB-REQ-2026-0042 (Babajide Sanwo <script>alert(1)</script>)");
      expect(capturedBody.reply_to).toBe("babajide@example.com");
      expect(capturedBody.to).toEqual(["poabglobalconstruction@gmail.com"]);
      expect(capturedBody.from).toBe("POAB Website <notifications@poabglobalconstruction.com>");

      // HTML contains escaped content and doesn't execute raw script
      expect(capturedBody.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
      expect(capturedBody.html).not.toContain("<script>alert(1)</script>");
      expect(capturedBody.html).toContain("POAB-REQ-2026-0042");
      expect(capturedBody.html).toContain("Bodija, Ibadan");
      expect(capturedBody.html).toContain("admin/quotes/quote-uuid-101");
      expect(capturedBody.html).toContain("2 file(s) attached");

      // Text version contains plain-text details
      expect(capturedBody.text).toContain("POAB-REQ-2026-0042");
      expect(capturedBody.text).toContain("Babajide Sanwo");
      expect(capturedBody.text).toContain("admin/quotes/quote-uuid-101");
    });

    it("2. Contact Message Notification: formats correct subject, fields, admin link, and escapes HTML", async () => {
      await sendContactNotification({
        name: "Adewale Adeleke",
        email: "adewale@example.com",
        phone: "+234 802 987 6543",
        subject: "Structural Consultation Request",
        message: "We need an engineer to inspect an ongoing foundation in Lekki Phase 1.",
      });

      expect(capturedBody.subject).toBe("[POAB] New Contact Message - Structural Consultation Request (Adewale Adeleke)");
      expect(capturedBody.reply_to).toBe("adewale@example.com");
      expect(capturedBody.to).toEqual(["poabglobalconstruction@gmail.com"]);

      expect(capturedBody.html).toContain("Structural Consultation Request");
      expect(capturedBody.html).toContain("Adewale Adeleke");
      expect(capturedBody.html).toContain("adewale@example.com");
      expect(capturedBody.html).toContain("Lekki Phase 1");
      expect(capturedBody.html).toContain("/admin");

      expect(capturedBody.text).toContain("Structural Consultation Request");
      expect(capturedBody.text).toContain("Adewale Adeleke");
    });

    it("3. Property Enquiry Notification: formats correct subject, property ref/title, and customer details", async () => {
      await sendPropertyEnquiryNotification({
        name: "Folake Daniels",
        email: "folake@example.com",
        phone: "+234 809 111 2222",
        whatsapp: "+234 809 111 2222",
        message: "Is this property still available for physical inspection this Saturday?",
        propertyTitle: "4-Bedroom Detached Duplex in Jericho",
        propertyReference: "POAB-PROP-2026-0005",
        propertyId: "prop-uuid-99",
      });

      expect(capturedBody.subject).toBe("[POAB] New Property Enquiry - POAB-PROP-2026-0005 (Folake Daniels)");
      expect(capturedBody.reply_to).toBe("folake@example.com");
      expect(capturedBody.to).toEqual(["poabglobalconstruction@gmail.com"]);

      expect(capturedBody.html).toContain("POAB-PROP-2026-0005");
      expect(capturedBody.html).toContain("4-Bedroom Detached Duplex in Jericho");
      expect(capturedBody.html).toContain("Folake Daniels");
      expect(capturedBody.html).toContain("physical inspection this Saturday");
      expect(capturedBody.html).toContain("/admin/property-enquiries");

      expect(capturedBody.text).toContain("POAB-PROP-2026-0005");
      expect(capturedBody.text).toContain("Folake Daniels");
    });

    it("4. Sell Property Notification: formats correct subject, seller details, property info, and admin link", async () => {
      await sendSellPropertyNotification({
        requestId: "sell-req-uuid-55",
        reference: "POAB-SELL-2026-0012",
        seller_name: "Chief Olatunji",
        phone: "+234 805 444 3333",
        email: "olatunji@example.com",
        whatsapp: "+234 805 444 3333",
        property_location: "Alalubosa GRA, Ibadan",
        property_type: "Residential Land",
        expected_price: "₦75,000,000",
        description: "1,200 sqm dry land with registered Certificate of Occupancy (C of O).",
        filesCount: 3,
      });

      expect(capturedBody.subject).toBe("[POAB] New Property Sale Request - POAB-SELL-2026-0012 (Chief Olatunji)");
      expect(capturedBody.reply_to).toBe("olatunji@example.com");
      expect(capturedBody.to).toEqual(["poabglobalconstruction@gmail.com"]);

      expect(capturedBody.html).toContain("POAB-SELL-2026-0012");
      expect(capturedBody.html).toContain("Chief Olatunji");
      expect(capturedBody.html).toContain("Alalubosa GRA, Ibadan");
      expect(capturedBody.html).toContain("₦75,000,000");
      expect(capturedBody.html).toContain("Certificate of Occupancy");
      expect(capturedBody.html).toContain("3 file(s) uploaded");
      expect(capturedBody.html).toContain("admin/sell-requests/sell-req-uuid-55");

      expect(capturedBody.text).toContain("POAB-SELL-2026-0012");
      expect(capturedBody.text).toContain("Chief Olatunji");
      expect(capturedBody.text).toContain("admin/sell-requests/sell-req-uuid-55");
    });
  });
});
