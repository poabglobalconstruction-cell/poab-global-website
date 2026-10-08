# POAB Global Construction Company Ltd - Official Website & Management System (V1)

Official production-grade website and internal administration portal for **POAB Global Construction Company Ltd** (Incorporated in Nigeria, CAC / RC 9896965).

Built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

---

## 1. Verified Corporate Identity

- **Company Name**: POAB Global Construction Company Ltd
- **CAC / RC Number**: RC 9896965
- **Official Business Email**: info@poabglobalconstruction.com
- **Departmental Email Routing**:
  - General Enquiries: `info@poabglobalconstruction.com`
  - Building Projects & Quotes: `projects@poabglobalconstruction.com`
  - Properties & Land Acquisition: `properties@poabglobalconstruction.com`
  - Client Service & Site Support: `service@poabglobalconstruction.com`
- **Head Office**: Ibadan, Oyo State, Nigeria
- **Site Operations**: Lagos and Nationwide
- **Experience Statement**: 11 years of hands-on site engineering experience
- **Core Proposition**: Complete building delivery from foundation to finishing
- **Tagline**: *"Building Houses That Stand The Test Of Time."*
- **Positioning**: 80% Construction / 20% Property Services

---

## 2. Technology Stack

- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS (Navy `#071B2D`, Gold `#C89B3C`, Warm Stone `#F3F0E9`)
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth
- **Storage**: Supabase Storage (`project-images`, `property-images`, `quote-attachments`, `sell-property-attachments`)
- **Form Validation**: Zod with server-side validation & anti-spam honeypot
- **Testing**: Vitest with React Testing Library

---

## 3. Application Route Directory

### Public Routes
- `/` - Homepage (Tagline, Credibility Strip, What We Build, Foundation-to-Finish, Selected Projects, Philosophy, Workflow, Property Teaser, Project CTA)
- `/about` - About POAB (Site engineering origin, 11 years experience, verified credentials, construction ethics)
- `/services` - Services (Building Construction, Renovation & Finishing, Site & Perimeter Works, Property Services with contextual quote CTAs)
- `/projects` - Projects Gallery (Category filters, verified proof of work, empty state)
- `/projects/[slug]` - Project Details (Cover image, vertical stage story, scope, contextual quote CTA, 404 on invalid slug)
- `/properties` - Property Listings (Available / Under Offer / Sold filters, Sell With POAB integration)
- `/properties/[slug]` - Property Details (Image gallery, specifications, contextual WhatsApp CTA, property enquiry form, SOLD state handling)
- `/request-quote` - 6-Step Qualified Construction Quote Intake (Plans upload, concurrency-safe reference `POAB-REQ-2026-XXXX`)
- `/sell-property` - Dedicated Seller Intake (Title and beacon details, reference `POAB-SELL-2026-XXXX`, strictly manual review, never auto-published)
- `/contact` - Official Contact Directory (Verified head office, official email, no fake street address, no fake map)
- `/privacy` - Practical Privacy & Data Governance Policy
- `/not-found` - Branded Architectural 404 page

### Admin Routes (RBAC Protected)
- `/admin/login` - Secure Admin Login (Supabase Auth + active `admin_profiles` check)
- `/admin` - Operational Dashboard (Live database counts, recent quotes, recent property leads)
- `/admin/projects` - Project Management (List, publish/unpublish, archive, feature)
- `/admin/projects/new` - Create Project Log
- `/admin/projects/[id]` - Edit Project & Stage Timeline Management
- `/admin/properties` - Property Listings Management (List, status Available/Under Offer/Sold)
- `/admin/properties/new` - Create Property Listing
- `/admin/properties/[id]` - Edit Property (Price public toggle, status, details)
- `/admin/quotes` - Construction Quotes Lead Management (Status filters, search)
- `/admin/quotes/[id]` - Review Lead, Contact Shortcuts (Call, WhatsApp, Email), Internal Notes
- `/admin/property-enquiries` - Property Inquiries Queue
- `/admin/property-enquiries/[id]` - Inspection Notes & Status Update
- `/admin/sell-requests` - Seller Intake Audit Queue
- `/admin/sell-requests/[id]` - Title Audit Notes & Review (Acceptance never auto-publishes)
- `/admin/settings` - System Contact Settings (Public phone, WhatsApp number, email, social links; corporate CAC locked)

---

## 4. Local Development Setup

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/poabglobalconstruction-cell/poab-global-website.git
cd poab-global-website

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Environment Variables (`.env.local`)

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 6. Supabase Database & Migrations

The database migration is located in `supabase/migrations/20261006000001_initial_poab_schema.sql`.

### Applying Migrations
In your Supabase project:
1. Open the **SQL Editor**.
2. Paste the contents of `supabase/migrations/20261006000001_initial_poab_schema.sql`.
3. Click **Run**.

This will automatically create:
- `reference_counters` with the concurrency-safe `generate_reference(prefix)` function
- `admin_profiles` with `is_active_admin()` RLS helper
- `projects`, `project_stages`, `project_images`
- `properties`, `property_images`
- `quote_requests`, `quote_attachments`
- `property_enquiries`
- `sell_property_requests`, `sell_property_attachments`
- `site_settings` with initial verified company data
- Full Row Level Security (RLS) policies for public vs admin access

### Storage Buckets Setup
In Supabase Storage:
1. Create bucket **`project-images`** (Public)
2. Create bucket **`property-images`** (Public)
3. Create bucket **`quote-attachments`** (Private)
4. Create bucket **`sell-property-attachments`** (Private)

---

## 7. Secure Admin Bootstrap Procedure

No default admin credentials or hardcoded passwords exist in this codebase.

To create the first administrator:
1. Go to your Supabase Dashboard -> **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
3. Enter the administrator's email (e.g. `poabglobalconstruction@gmail.com`) and a strong password. Copy the generated User UID.
4. Go to Supabase **SQL Editor** and run:
   ```sql
   INSERT INTO admin_profiles (auth_user_id, name, role, active)
   VALUES ('<COPIED-USER-UID>', 'POAB Administrator', 'admin', true);
   ```
5. Log into the portal at `/admin/login`.

---

## 8. Testing & Production Verification

```bash
# Run automated tests
npm run test

# Run TypeScript typecheck
npm run typecheck

# Run production build
npm run build
```

---

## 9. Mobile Navigation Architecture Guarantee

To eliminate recurring mobile navigation scroll-lock and overlay bugs:
- Handled via `useMobileNav()` hook.
- Unconditionally closes on route/pathname change.
- Unconditionally closes on Escape key press.
- Automatically resets and restores body scroll on viewport resize to desktop breakpoint (`>= 1024px`).
- Always guarantees cleanup restoring `document.body.style.overflow = ""`.
- Verified with automated unit tests in `src/lib/hooks/__tests__/useMobileNav.test.ts`.

---

## 10. Assets & External Configuration Pending Launch

- Official brand logo asset (currently rendered cleanly via text/architectural slot)
- Official public phone line & WhatsApp business line (configurable via `/admin/settings`)
- Official social media URLs (configurable via `/admin/settings`)
- High-resolution real site photography for completed/ongoing building projects
- Production domain DNS assignment & SSL
Deployment triger: POAB production setup
