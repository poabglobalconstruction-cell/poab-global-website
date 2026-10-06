import { describe, it, expect } from "vitest";
import {
  quoteSubmissionSchema,
  sellPropertySubmissionSchema,
  propertyEnquirySchema,
  isValidPhoneNumber,
} from "../validation";

describe("Validation Schemas & Anti-Spam", () => {
  it("validates valid quote submission with Nigerian phone number", () => {
    const validData = {
      project_type: "Residential",
      location: "Ibadan, Oyo State",
      current_stage: "Site Preparation",
      description: "Looking to build a 4-bedroom bungalow from foundation to finishing.",
      budget_range: "₦30,000,000 - ₦60,000,000",
      timeline: "1 - 3 months",
      has_building_plan: true,
      name: "Adewale Johnson",
      phone: "08012345678",
      email: "adewale@example.com",
      preferred_contact: "phone" as const,
      privacy_acknowledged: true,
      honeypot: "",
    };

    const result = quoteSubmissionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("validates Nigerian and international phone formats", () => {
    // Valid Nigerian local formats
    expect(isValidPhoneNumber("08012345678")).toBe(true);
    expect(isValidPhoneNumber("07033445566")).toBe(true);
    expect(isValidPhoneNumber("0812-345-6789")).toBe(true);
    expect(isValidPhoneNumber("090 9988 7766")).toBe(true);
    expect(isValidPhoneNumber("09112233445")).toBe(true);

    // Valid Nigerian international formats
    expect(isValidPhoneNumber("+2348012345678")).toBe(true);
    expect(isValidPhoneNumber("+234 803 123 4567")).toBe(true);
    expect(isValidPhoneNumber("2348012345678")).toBe(true);

    // Valid diaspora international formats
    expect(isValidPhoneNumber("+447911123456")).toBe(true);
    expect(isValidPhoneNumber("+12025550123")).toBe(true);

    // Invalid / obviously incomplete numbers
    expect(isValidPhoneNumber("1234")).toBe(false);
    expect(isValidPhoneNumber("08012")).toBe(false);
    expect(isValidPhoneNumber("")).toBe(false);
    expect(isValidPhoneNumber("not-a-number")).toBe(false);
  });

  it("rejects quote submission if honeypot is populated by bots", () => {
    const botData = {
      project_type: "Residential",
      location: "Lagos",
      current_stage: "Excavation",
      description: "Automated spam enquiry here.",
      budget_range: "Prefer to discuss",
      timeline: "Immediately",
      has_building_plan: false,
      name: "Bot Spammer",
      phone: "08012345678",
      email: "bot@spam.com",
      preferred_contact: "email" as const,
      privacy_acknowledged: true,
      honeypot: "http://spam-link.ru",
    };

    const result = quoteSubmissionSchema.safeParse(botData);
    expect(result.success).toBe(false);
  });

  it("requires privacy acknowledgment for quote requests", () => {
    const unacknowledged = {
      project_type: "Residential",
      location: "Lagos",
      current_stage: "Excavation",
      description: "Valid construction description here.",
      budget_range: "Prefer to discuss",
      timeline: "Immediately",
      has_building_plan: false,
      name: "Client",
      phone: "08012345678",
      email: "client@example.com",
      preferred_contact: "email" as const,
      privacy_acknowledged: false,
      honeypot: "",
    };

    const result = quoteSubmissionSchema.safeParse(unacknowledged);
    expect(result.success).toBe(false);
  });

  it("rejects short or invalid phone numbers in quote submission", () => {
    const invalidPhoneData = {
      project_type: "Residential",
      location: "Lagos",
      current_stage: "Excavation",
      description: "Valid construction description here.",
      budget_range: "Prefer to discuss",
      timeline: "Immediately",
      has_building_plan: false,
      name: "Client",
      phone: "12345",
      email: "client@example.com",
      preferred_contact: "email" as const,
      privacy_acknowledged: true,
      honeypot: "",
    };

    const result = quoteSubmissionSchema.safeParse(invalidPhoneData);
    expect(result.success).toBe(false);
  });

  it("validates sell property submission", () => {
    const validSell = {
      seller_name: "Adeyemi Folake",
      phone: "+2348098765432",
      email: "folake@example.com",
      property_location: "Alakia, Ibadan",
      property_type: "Land",
      description: "2 plots of fenced dry land with registered survey and deed of assignment.",
      honeypot: "",
    };

    const result = sellPropertySubmissionSchema.safeParse(validSell);
    expect(result.success).toBe(true);
  });

  it("rejects property enquiry without valid UUID property ID", () => {
    const invalidEnquiry = {
      property_id: "not-a-uuid",
      name: "Buyer",
      phone: "+2348000000000",
      email: "buyer@example.com",
      message: "Is this property still available for inspection?",
      honeypot: "",
    };

    const result = propertyEnquirySchema.safeParse(invalidEnquiry);
    expect(result.success).toBe(false);
  });
});
