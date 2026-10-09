import { SITE_URL, COMPANY_INFO } from "@/lib/constants";

/**
 * Escapes characters that have special meaning in HTML to prevent HTML injection in emails.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface EmailSendOptions {
  to?: string;
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Sends an email via the Resend HTTPS REST API.
 * Server-only execution. Guaranteed not to throw: catches errors and returns an EmailSendResult.
 */
export async function sendEmail(options: EmailSendOptions): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const configuredFrom = process.env.EMAIL_FROM || "POAB Website <notifications@poabglobalconstruction.com>";
  const configuredRecipient = process.env.NOTIFICATION_EMAIL || "poabglobalconstruction@gmail.com";

  if (!apiKey || apiKey.trim() === "") {
    // Safe server-side warning without exposing secrets or failing the caller
    console.warn("[EMAIL] RESEND_API_KEY is not configured. Email notification skipped.");
    return { success: false, skipped: true, error: "RESEND_API_KEY not configured" };
  }

  const recipient = options.to || configuredRecipient;
  const sender = options.from || configuredFrom;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout for serverless

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[EMAIL] Resend API responded with status ${res.status}:`, errorText.slice(0, 300));
      return { success: false, error: `Resend HTTP ${res.status}` };
    }

    const data = (await res.json()) as { id?: string };
    return { success: true, id: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[EMAIL] Failed to dispatch email via Resend:", message);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// HTML Email Layout Wrapper (Navy #0A1931 & Gold #D4AF37 Visual Identity)
// ---------------------------------------------------------------------------

function renderEmailLayout(params: {
  badgeText: string;
  title: string;
  subtitle?: string;
  contentHtml: string;
  actionUrl?: string;
  actionText?: string;
}): string {
  const adminButton = params.actionUrl
    ? `
      <div style="margin: 28px 0 12px; text-align: left;">
        <a href="${escapeHtml(params.actionUrl)}" style="display: inline-block; background-color: #D4AF37; color: #0A1931; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 24px; text-decoration: none; border-radius: 2px;">
          ${escapeHtml(params.actionText || "Review in Admin Portal")} &rarr;
        </a>
      </div>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(params.title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F0E9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F0E9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Top Header Strip (Navy & Gold Accent) -->
          <tr>
            <td style="background-color: #0A1931; padding: 22px 28px; border-bottom: 3px solid #D4AF37;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; width: 48px; padding-right: 16px;">
                    <a href="${SITE_URL}" style="display: block; text-decoration: none;">
                      <img src="${SITE_URL}/brand/poab-pillar.svg" alt="POAB Global" width="40" height="48" style="display: block; width: 40px; height: 48px; border: 0;" />
                    </a>
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="color: #D4AF37; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 3px;">
                      ${escapeHtml(params.badgeText)}
                    </div>
                    <div style="color: #FFFFFF; font-size: 18px; font-weight: 700; letter-spacing: 0.02em; line-height: 1.2;">
                      POAB GLOBAL CONSTRUCTION COMPANY LTD
                    </div>
                    <div style="color: #94A3B8; font-size: 11px; margin-top: 3px; letter-spacing: 0.05em;">
                      RC 9896965 &bull; Official Management Notification
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading Area -->
          <tr>
            <td style="padding: 24px 28px 12px; border-bottom: 1px solid #F1F5F9;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0A1931; line-height: 1.3;">
                ${escapeHtml(params.title)}
              </h1>
              ${
                params.subtitle
                  ? `<p style="margin: 6px 0 0; font-size: 13px; color: #64748B;">${escapeHtml(params.subtitle)}</p>`
                  : ""
              }
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 20px 28px;">
              ${params.contentHtml}
              ${adminButton}
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 18px 28px; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 11px; line-height: 1.5;">
              <div style="font-weight: 600; color: #0A1931; margin-bottom: 2px;">POAB Global Construction Company Ltd</div>
              <div>Head Office: Ibadan, Oyo State &bull; Site Operations: Lagos & Nationwide</div>
              <div style="margin-top: 6px; color: #94A3B8;">
                This is an automated notification from your website. Do not reply to this system message directly; use the customer contact details provided above.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderFieldRow(label: string, value: string | null | undefined, isHighlight = false): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9; width: 38%; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; color: ${isHighlight ? "#D4AF37" : "#64748B"}; vertical-align: top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #0A1931; font-weight: ${isHighlight ? "700" : "500"}; vertical-align: top;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

// ---------------------------------------------------------------------------
// 1. NEW QUOTE REQUEST NOTIFICATION
// ---------------------------------------------------------------------------

export interface QuoteNotificationData {
  quoteId: string;
  reference: string;
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  preferred_contact: "phone" | "whatsapp" | "email";
  project_type: string;
  location: string;
  land_size?: string;
  floors?: string;
  bedrooms?: string;
  current_stage: string;
  budget_range: string;
  timeline: string;
  has_building_plan: boolean;
  description: string;
  project_inspiration?: string;
  filesCount?: number;
}

export async function sendQuoteNotification(data: QuoteNotificationData): Promise<EmailSendResult> {
  const adminUrl = `${SITE_URL}/admin/quotes/${data.quoteId}`;
  const now = new Date().toUTCString();

  const contentHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      ${renderFieldRow("Reference", data.reference, true)}
      ${renderFieldRow("Client Name", data.name)}
      ${renderFieldRow("Phone Number", data.phone)}
      ${renderFieldRow("WhatsApp", data.whatsapp || "Not provided")}
      ${renderFieldRow("Email Address", data.email)}
      ${renderFieldRow("Preferred Contact", data.preferred_contact.toUpperCase())}
      ${renderFieldRow("Project Type", data.project_type)}
      ${renderFieldRow("Project Location", data.location)}
      ${renderFieldRow("Land Size", data.land_size)}
      ${renderFieldRow("Floors / Storeys", data.floors)}
      ${renderFieldRow("Bedrooms", data.bedrooms)}
      ${renderFieldRow("Current Site Stage", data.current_stage)}
      ${renderFieldRow("Budget Range", data.budget_range, true)}
      ${renderFieldRow("Target Timeline", data.timeline)}
      ${renderFieldRow("Has Building Plan", data.has_building_plan ? "Yes (Plan Available)" : "No")}
      ${renderFieldRow("Files Uploaded", data.filesCount ? `${data.filesCount} file(s) attached` : "None")}
      ${renderFieldRow("Submission Time", now)}
    </table>

    <div style="margin-top: 16px; padding: 14px 16px; background-color: #F8FAFC; border-left: 3px solid #0A1931; font-size: 13px; color: #1E293B; line-height: 1.6;">
      <strong style="color: #0A1931; display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Project Description / Scope:</strong>
      ${escapeHtml(data.description)}
    </div>

    ${
      data.project_inspiration
        ? `
      <div style="margin-top: 12px; padding: 12px 16px; background-color: #FFFDF8; border-left: 3px solid #D4AF37; font-size: 12px; color: #64748B; line-height: 1.5;">
        <strong style="color: #D4AF37; display: block; margin-bottom: 2px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">Client Inspiration Note:</strong>
        ${escapeHtml(data.project_inspiration)}
      </div>
    `
        : ""
    }

    ${
      data.filesCount && data.filesCount > 0
        ? `
      <div style="margin-top: 14px; padding: 10px 14px; background-color: #F1F5F9; border-radius: 2px; font-size: 12px; color: #475569;">
        &#128206; <strong>Attachments Available:</strong> ${data.filesCount} document(s) uploaded. View and download securely from the admin portal.
      </div>
    `
        : ""
    }
  `;

  const html = renderEmailLayout({
    badgeText: "Lead Intake System",
    title: `New Quote Request: ${data.reference}`,
    subtitle: `Submitted by ${data.name} for ${data.project_type} in ${data.location}`,
    contentHtml,
    actionUrl: adminUrl,
    actionText: "Open Quote in Admin Portal",
  });

  const text = `
[POAB GLOBAL CONSTRUCTION COMPANY LTD]
NEW QUOTE REQUEST: ${data.reference}

Submitted: ${now}

CLIENT DETAILS:
- Name: ${data.name}
- Phone: ${data.phone}
- WhatsApp: ${data.whatsapp || "N/A"}
- Email: ${data.email}
- Preferred Contact: ${data.preferred_contact}

PROJECT DETAILS:
- Project Type: ${data.project_type}
- Location: ${data.location}
- Land Size: ${data.land_size || "N/A"}
- Floors: ${data.floors || "N/A"}
- Bedrooms: ${data.bedrooms || "N/A"}
- Current Stage: ${data.current_stage}
- Budget Range: ${data.budget_range}
- Timeline: ${data.timeline}
- Has Building Plan: ${data.has_building_plan ? "Yes" : "No"}
- Attachments: ${data.filesCount || 0} file(s)

PROJECT SCOPE:
${data.description}

${data.project_inspiration ? `INSPIRATION NOTE:\n${data.project_inspiration}\n` : ""}
MANAGE RECORD SECURELY:
${adminUrl}
  `.trim();

  return sendEmail({
    subject: `[POAB] New Quote Request - ${data.reference} (${data.name})`,
    replyTo: data.email,
    html,
    text,
  });
}

// ---------------------------------------------------------------------------
// 2. NEW CONTACT MESSAGE NOTIFICATION
// ---------------------------------------------------------------------------

export interface ContactNotificationData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function sendContactNotification(data: ContactNotificationData): Promise<EmailSendResult> {
  const adminUrl = `${SITE_URL}/admin`;
  const now = new Date().toUTCString();

  const contentHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      ${renderFieldRow("Sender Name", data.name)}
      ${renderFieldRow("Email Address", data.email)}
      ${renderFieldRow("Phone Number", data.phone || "Not provided")}
      ${renderFieldRow("Subject", data.subject || "General Inquiry")}
      ${renderFieldRow("Submission Time", now)}
    </table>

    <div style="margin-top: 16px; padding: 16px; background-color: #F8FAFC; border-left: 3px solid #0A1931; font-size: 13px; color: #1E293B; line-height: 1.6;">
      <strong style="color: #0A1931; display: block; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Message Content:</strong>
      ${escapeHtml(data.message)}
    </div>
  `;

  const html = renderEmailLayout({
    badgeText: "Contact System",
    title: `New Contact Message: ${data.subject || "General Inquiry"}`,
    subtitle: `Received from ${data.name} (${data.email})`,
    contentHtml,
    actionUrl: adminUrl,
    actionText: "View in Admin Dashboard",
  });

  const text = `
[POAB GLOBAL CONSTRUCTION COMPANY LTD]
NEW CONTACT MESSAGE

Submitted: ${now}

SENDER:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone || "N/A"}
- Subject: ${data.subject || "General Inquiry"}

MESSAGE:
${data.message}

ADMIN PORTAL:
${adminUrl}
  `.trim();

  return sendEmail({
    subject: `[POAB] New Contact Message - ${data.subject || "General Inquiry"} (${data.name})`,
    replyTo: data.email,
    html,
    text,
  });
}

// ---------------------------------------------------------------------------
// 3. NEW PROPERTY ENQUIRY NOTIFICATION
// ---------------------------------------------------------------------------

export interface PropertyEnquiryNotificationData {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  message: string;
  propertyTitle?: string;
  propertyReference?: string;
  propertyId?: string;
}

export async function sendPropertyEnquiryNotification(data: PropertyEnquiryNotificationData): Promise<EmailSendResult> {
  const adminUrl = `${SITE_URL}/admin/property-enquiries`;
  const now = new Date().toUTCString();

  const contentHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      ${renderFieldRow("Property Title", data.propertyTitle || "Property Inquiry", true)}
      ${renderFieldRow("Property Reference", data.propertyReference || "N/A")}
      ${renderFieldRow("Enquirer Name", data.name)}
      ${renderFieldRow("Phone Number", data.phone)}
      ${renderFieldRow("WhatsApp", data.whatsapp || "Not provided")}
      ${renderFieldRow("Email Address", data.email)}
      ${renderFieldRow("Submission Time", now)}
    </table>

    <div style="margin-top: 16px; padding: 16px; background-color: #F8FAFC; border-left: 3px solid #D4AF37; font-size: 13px; color: #1E293B; line-height: 1.6;">
      <strong style="color: #0A1931; display: block; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Client Inquiry Message:</strong>
      ${escapeHtml(data.message)}
    </div>
  `;

  const html = renderEmailLayout({
    badgeText: "Property Division",
    title: `New Property Enquiry: ${data.propertyReference || data.propertyTitle || "Listing"}`,
    subtitle: `From ${data.name} regarding ${data.propertyTitle || "a property listing"}`,
    contentHtml,
    actionUrl: adminUrl,
    actionText: "Manage Enquiries in Admin",
  });

  const text = `
[POAB GLOBAL CONSTRUCTION COMPANY LTD]
NEW PROPERTY ENQUIRY

Submitted: ${now}

PROPERTY:
- Reference: ${data.propertyReference || "N/A"}
- Title: ${data.propertyTitle || "Property Listing"}

ENQUIRER:
- Name: ${data.name}
- Phone: ${data.phone}
- WhatsApp: ${data.whatsapp || "N/A"}
- Email: ${data.email}

MESSAGE:
${data.message}

ADMIN PORTAL:
${adminUrl}
  `.trim();

  const refLabel = data.propertyReference || data.propertyTitle || "Listing";
  return sendEmail({
    subject: `[POAB] New Property Enquiry - ${refLabel} (${data.name})`,
    replyTo: data.email,
    html,
    text,
  });
}

// ---------------------------------------------------------------------------
// 4. NEW SELL-PROPERTY REQUEST NOTIFICATION
// ---------------------------------------------------------------------------

export interface SellPropertyNotificationData {
  requestId: string;
  reference: string;
  seller_name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  property_location: string;
  property_type: string;
  expected_price?: string;
  description: string;
  filesCount?: number;
}

export async function sendSellPropertyNotification(data: SellPropertyNotificationData): Promise<EmailSendResult> {
  const adminUrl = `${SITE_URL}/admin/sell-requests/${data.requestId}`;
  const now = new Date().toUTCString();

  const contentHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      ${renderFieldRow("Reference", data.reference, true)}
      ${renderFieldRow("Seller Name", data.seller_name)}
      ${renderFieldRow("Phone Number", data.phone)}
      ${renderFieldRow("WhatsApp", data.whatsapp || "Not provided")}
      ${renderFieldRow("Email Address", data.email)}
      ${renderFieldRow("Property Type", data.property_type)}
      ${renderFieldRow("Property Location", data.property_location)}
      ${renderFieldRow("Expected Price", data.expected_price || "Open / Negotiable")}
      ${renderFieldRow("Attached Documents", data.filesCount ? `${data.filesCount} file(s) uploaded` : "None")}
      ${renderFieldRow("Submission Time", now)}
    </table>

    <div style="margin-top: 16px; padding: 16px; background-color: #F8FAFC; border-left: 3px solid #0A1931; font-size: 13px; color: #1E293B; line-height: 1.6;">
      <strong style="color: #0A1931; display: block; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Property & Title Details:</strong>
      ${escapeHtml(data.description)}
    </div>

    ${
      data.filesCount && data.filesCount > 0
        ? `
      <div style="margin-top: 14px; padding: 10px 14px; background-color: #F1F5F9; border-radius: 2px; font-size: 12px; color: #475569;">
        &#128206; <strong>Seller Title Documents:</strong> ${data.filesCount} file(s) uploaded. Review title deeds and survey plans in the secure admin review queue.
      </div>
    `
        : ""
    }
  `;

  const html = renderEmailLayout({
    badgeText: "Seller Review Queue",
    title: `New Property Sale Request: ${data.reference}`,
    subtitle: `Submitted by ${data.seller_name} for ${data.property_type} in ${data.property_location}`,
    contentHtml,
    actionUrl: adminUrl,
    actionText: "Review Seller Submission in Admin",
  });

  const text = `
[POAB GLOBAL CONSTRUCTION COMPANY LTD]
NEW PROPERTY SALE REQUEST: ${data.reference}

Submitted: ${now}

SELLER DETAILS:
- Name: ${data.seller_name}
- Phone: ${data.phone}
- WhatsApp: ${data.whatsapp || "N/A"}
- Email: ${data.email}

PROPERTY DETAILS:
- Type: ${data.property_type}
- Location: ${data.property_location}
- Expected Price: ${data.expected_price || "Open / Negotiable"}
- Documents Attached: ${data.filesCount || 0} file(s)

PROPERTY DESCRIPTION & TITLE DETAILS:
${data.description}

REVIEW SECURELY IN ADMIN PORTAL:
${adminUrl}
  `.trim();

  return sendEmail({
    subject: `[POAB] New Property Sale Request - ${data.reference} (${data.seller_name})`,
    replyTo: data.email,
    html,
    text,
  });
}
