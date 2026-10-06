-- ==============================================================================
-- POAB GLOBAL CONSTRUCTION COMPANY LTD
-- Database Migration: 20261006000001_initial_poab_schema.sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. REFERENCE COUNTERS (Concurrency-Safe Sequences)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS reference_counters (
    prefix VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    last_value INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (prefix, year)
);

-- Concurrency-safe atomic reference generator function
-- Example: generate_reference('POAB-REQ') -> 'POAB-REQ-2026-0001'
CREATE OR REPLACE FUNCTION generate_reference(prefix_param TEXT)
RETURNS TEXT AS $$
DECLARE
    current_year INT := EXTRACT(YEAR FROM CURRENT_DATE);
    new_counter INT;
    formatted_ref TEXT;
BEGIN
    INSERT INTO reference_counters (prefix, year, last_value, updated_at)
    VALUES (prefix_param, current_year, 1, NOW())
    ON CONFLICT (prefix, year)
    DO UPDATE SET 
        last_value = reference_counters.last_value + 1,
        updated_at = NOW()
    RETURNING last_value INTO new_counter;

    formatted_ref := prefix_param || '-' || current_year || '-' || LPAD(new_counter::TEXT, 4, '0');
    RETURN formatted_ref;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. ADMIN PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_auth_user ON admin_profiles(auth_user_id);

-- Helper function to check if the current requester is an active admin
CREATE OR REPLACE FUNCTION is_active_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_profiles 
        WHERE auth_user_id = auth.uid() 
          AND active = true 
          AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. PROJECTS & STAGES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    project_type TEXT NOT NULL, -- e.g., 'Residential', 'Commercial', 'Renovation', 'Site Works'
    status TEXT NOT NULL DEFAULT 'Ongoing', -- 'Ongoing', 'Completed', 'Planning'
    scope TEXT,
    short_description TEXT NOT NULL,
    description TEXT,
    cover_image_path TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    published BOOLEAN NOT NULL DEFAULT false,
    start_date DATE,
    completion_date DATE,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published_featured ON projects(published, featured);

CREATE TABLE IF NOT EXISTS project_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    stage_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_stages_project ON project_stages(project_id, sort_order);

CREATE TABLE IF NOT EXISTS project_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_stage_id UUID REFERENCES project_stages(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    caption TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images(project_id, sort_order);

-- ==============================================================================
-- 4. PROPERTIES & PROPERTY IMAGES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    property_type TEXT NOT NULL, -- e.g., 'Land', 'Bungalow', 'Duplex', 'Commercial'
    location TEXT NOT NULL,
    price NUMERIC,
    price_public BOOLEAN NOT NULL DEFAULT true,
    bedrooms INT,
    bathrooms INT,
    size TEXT, -- e.g., '600 sqm'
    description TEXT NOT NULL,
    features TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Available', -- 'Available', 'Under Offer', 'Sold'
    featured BOOLEAN NOT NULL DEFAULT false,
    published BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_published_status ON properties(published, status);

CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property ON property_images(property_id, sort_order);

-- ==============================================================================
-- 5. QUOTE REQUESTS & ATTACHMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    project_type TEXT NOT NULL,
    location TEXT NOT NULL,
    land_size TEXT,
    floors TEXT,
    bedrooms TEXT,
    current_stage TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    timeline TEXT NOT NULL,
    has_building_plan BOOLEAN NOT NULL DEFAULT false,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    preferred_contact TEXT NOT NULL DEFAULT 'phone',
    privacy_acknowledged BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'New', -- 'New', 'Contacted', 'Site Assessment', 'Quotation Sent', 'Won', 'Lost', 'Closed'
    project_inspiration TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_reference ON quote_requests(reference);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);

CREATE TABLE IF NOT EXISTS quote_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_attachments_quote ON quote_attachments(quote_id);

-- ==============================================================================
-- 6. PROPERTY ENQUIRIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS property_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New', -- 'New', 'Contacted', 'Scheduled Inspection', 'Closed'
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_enquiries_property ON property_enquiries(property_id);

-- ==============================================================================
-- 7. SELL PROPERTY REQUESTS & ATTACHMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS sell_property_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    seller_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT,
    property_location TEXT NOT NULL,
    property_type TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_price TEXT,
    status TEXT NOT NULL DEFAULT 'New', -- 'New', 'Reviewing', 'Contacted', 'Accepted', 'Rejected', 'Closed'
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sell_property_reference ON sell_property_requests(reference);

CREATE TABLE IF NOT EXISTS sell_property_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sell_request_id UUID NOT NULL REFERENCES sell_property_requests(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. CONTACT MESSAGES (General Inquiries)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New', -- 'New', 'Read', 'Replied', 'Archived'
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

-- ==============================================================================
-- 9. SITE SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial verified company settings
INSERT INTO site_settings (key, value, description, is_public) VALUES
('company_info', '{
    "name": "POAB Global Construction Company Ltd",
    "tagline": "Building Houses That Stand The Test Of Time",
    "cac_number": "9896965",
    "head_office": "Ibadan, Oyo State, Nigeria",
    "operations_coverage": "Lagos and Nationwide",
    "experience": "11 years of hands-on site engineering experience",
    "promise": "Affordable cost, honest quotation, and foundation to finish delivery."
}'::jsonb, 'Verified company legal and profile information', true),

('contact_channels', '{
    "official_email": "poabglobalconstruction@gmail.com",
    "public_phone": "",
    "whatsapp_number": "",
    "office_address": "Ibadan, Oyo State, Nigeria",
    "business_hours": ""
}'::jsonb, 'Configurable contact channels (phone/whatsapp pending genuine client input)', true),

('social_links', '{
    "facebook": "",
    "instagram": "",
    "linkedin": "",
    "twitter": ""
}'::jsonb, 'Social media profile URLs', true),

('quote_config', '{
    "budget_options": [
        "Below ₦15,000,000",
        "₦15,000,000 - ₦30,000,000",
        "₦30,000,000 - ₦60,000,000",
        "₦60,000,000 - ₦120,000,000",
        "Above ₦120,000,000",
        "Prefer to discuss"
    ],
    "timeline_options": [
        "Immediately / Within 1 month",
        "1 - 3 months",
        "3 - 6 months",
        "Planning stage / Flexible"
    ]
}'::jsonb, 'Configurable quote intake options', true)
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_property_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_property_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_counters ENABLE ROW LEVEL SECURITY;

-- ADMIN PROFILES RLS
CREATE POLICY "Admins can view their own profile" 
    ON admin_profiles FOR SELECT 
    USING (auth_user_id = auth.uid());

-- PROJECTS RLS
CREATE POLICY "Public can view published active projects" 
    ON projects FOR SELECT 
    USING (published = true AND archived_at IS NULL);

CREATE POLICY "Admins have full access to projects" 
    ON projects FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- PROJECT STAGES RLS
CREATE POLICY "Public can view stages of published projects" 
    ON project_stages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_stages.project_id 
          AND projects.published = true 
          AND projects.archived_at IS NULL
    ));

CREATE POLICY "Admins have full access to project stages" 
    ON project_stages FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- PROJECT IMAGES RLS
CREATE POLICY "Public can view images of published projects" 
    ON project_images FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_images.project_id 
          AND projects.published = true 
          AND projects.archived_at IS NULL
    ));

CREATE POLICY "Admins have full access to project images" 
    ON project_images FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- PROPERTIES RLS
CREATE POLICY "Public can view published active properties" 
    ON properties FOR SELECT 
    USING (published = true AND archived_at IS NULL);

CREATE POLICY "Admins have full access to properties" 
    ON properties FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- PROPERTY IMAGES RLS
CREATE POLICY "Public can view images of published properties" 
    ON property_images FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_images.property_id 
          AND properties.published = true 
          AND properties.archived_at IS NULL
    ));

CREATE POLICY "Admins have full access to property images" 
    ON property_images FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- QUOTE REQUESTS RLS
CREATE POLICY "Public can create quote requests" 
    ON quote_requests FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage quote requests" 
    ON quote_requests FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- QUOTE ATTACHMENTS RLS
CREATE POLICY "Public can insert quote attachments" 
    ON quote_attachments FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admins can view quote attachments" 
    ON quote_attachments FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- PROPERTY ENQUIRIES RLS
CREATE POLICY "Public can insert property enquiries" 
    ON property_enquiries FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage property enquiries" 
    ON property_enquiries FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- SELL PROPERTY REQUESTS RLS
CREATE POLICY "Public can insert sell property requests" 
    ON sell_property_requests FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage sell property requests" 
    ON sell_property_requests FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- SELL PROPERTY ATTACHMENTS RLS
CREATE POLICY "Public can insert sell property attachments" 
    ON sell_property_attachments FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admins can view sell property attachments" 
    ON sell_property_attachments FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- CONTACT MESSAGES RLS
CREATE POLICY "Public can insert contact messages" 
    ON contact_messages FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Admins can view and manage contact messages" 
    ON contact_messages FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- SITE SETTINGS RLS
CREATE POLICY "Public can read public settings" 
    ON site_settings FOR SELECT 
    USING (is_public = true);

CREATE POLICY "Admins can manage site settings" 
    ON site_settings FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- REFERENCE COUNTERS RLS
CREATE POLICY "Admins can manage reference counters" 
    ON reference_counters FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- ==============================================================================
-- 10. STORAGE BUCKETS SETUP & STORAGE RLS POLICIES
-- ==============================================================================
-- Create storage buckets:
-- Public: project-images, property-images
-- Private: quote-attachments, sell-property-attachments

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
    ('project-images', 'project-images', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('property-images', 'property-images', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('quote-attachments', 'quote-attachments', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
    ('sell-property-attachments', 'sell-property-attachments', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Public can view website project and property images
CREATE POLICY "Public can view project and property images"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('project-images', 'property-images'));

-- Storage RLS: Public can upload client attachments
CREATE POLICY "Public can upload client quote and sell attachments"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id IN ('quote-attachments', 'sell-property-attachments'));

-- Storage RLS: Admins have full access across all storage buckets
CREATE POLICY "Admins have full access to storage objects"
    ON storage.objects FOR ALL
    USING (is_active_admin())
    WITH CHECK (is_active_admin());
