import { z } from "zod";

/**
 * Validates Nigerian and international phone numbers.
 * Supports:
 * - Nigerian local 11-digit formats: 080..., 070..., 081..., 090..., 091...
 * - Nigerian international formats: +234..., 234...
 * - Diaspora / international format: +[country-code][10-15 digits]
 * Rejects obviously invalid, short, or malformed strings.
 */
export const isValidPhoneNumber = (val: string): boolean => {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;

  // Strip common format separators: spaces, dashes, parentheses, dots
  const cleaned = trimmed.replace(/[\s\-\(\)\.]/g, "");

  // 1. Nigerian local: 11 digits starting with 0 (e.g., 08012345678, 07033445566, 081..., 090..., 091...)
  if (/^0[789][01]\d{8}$/.test(cleaned) || /^0\d{10}$/.test(cleaned)) {
    return true;
  }

  // 2. Nigerian international: +234 or 234 followed by 10 digits
  if (/^\+?234[789][01]\d{8}$/.test(cleaned) || /^\+?234\d{10}$/.test(cleaned)) {
    return true;
  }

  // 3. General international with country code: + followed by 10 to 15 digits
  if (/^\+\d{10,15}$/.test(cleaned)) {
    return true;
  }

  return false;
};

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(isValidPhoneNumber, {
    message: "Please enter a valid phone number (e.g. 08012345678 or +234...)",
  });

export const optionalPhoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || isValidPhoneNumber(val), {
    message: "Please enter a valid phone number (e.g. 08012345678 or +234...)",
  });

export const emailSchema = z
  .string()
  .min(1, "Email address is required")
  .email("Please enter a valid email address (e.g. name@example.com)");

export const quoteSubmissionSchema = z.object({
  project_type: z.string().min(1, "Please select a project type"),
  location: z.string().min(2, "Project location is required"),
  land_size: z.string().optional(),
  floors: z.string().optional(),
  bedrooms: z.string().optional(),
  current_stage: z.string().min(1, "Please select the current stage"),
  description: z.string().min(10, "Please provide at least 10 characters describing the project"),
  budget_range: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select an estimated timeline"),
  has_building_plan: z.boolean().default(false),
  name: z.string().min(2, "Full name is required"),
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema,
  email: emailSchema,
  preferred_contact: z.enum(["phone", "whatsapp", "email"]).default("phone"),
  privacy_acknowledged: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge the privacy statement to submit",
  }),
  project_inspiration: z.string().optional(),
  honeypot: z.string().max(0, "Anti-spam verification triggered").optional().or(z.literal("")),
});

export const sellPropertySubmissionSchema = z.object({
  seller_name: z.string().min(2, "Full name is required"),
  phone: phoneSchema,
  email: emailSchema,
  whatsapp: optionalPhoneSchema,
  property_location: z.string().min(2, "Property location is required"),
  property_type: z.string().min(1, "Please select the property type"),
  description: z.string().min(10, "Please provide details about the property"),
  expected_price: z.string().optional(),
  honeypot: z.string().max(0, "Anti-spam verification triggered").optional().or(z.literal("")),
});

export const propertyEnquirySchema = z.object({
  property_id: z.string().uuid("Invalid property identifier"),
  name: z.string().min(2, "Full name is required"),
  phone: phoneSchema,
  email: emailSchema,
  whatsapp: optionalPhoneSchema,
  message: z.string().min(5, "Please enter your enquiry message"),
  honeypot: z.string().max(0, "Anti-spam verification triggered").optional().or(z.literal("")),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: emailSchema,
  phone: optionalPhoneSchema,
  subject: z.string().optional(),
  message: z.string().min(10, "Please enter your message (at least 10 characters)"),
  honeypot: z.string().max(0, "Anti-spam verification triggered").optional().or(z.literal("")),
});

export type QuoteSubmissionInput = z.infer<typeof quoteSubmissionSchema>;
export type SellPropertySubmissionInput = z.infer<typeof sellPropertySubmissionSchema>;
export type PropertyEnquiryInput = z.infer<typeof propertyEnquirySchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
