-- ==============================================================================
-- POAB GLOBAL CONSTRUCTION COMPANY LTD
-- Migration: 20261018000001_direct_video_upload.sql
-- Purpose: Implement direct video upload tables, validation constraints,
--          indexes, updated_at triggers, RLS policies, and idempotent bucket registration.
-- Non-destructive: Preserves all existing projects, properties, photographs, and YouTube links.
-- Idempotent: Safe to execute and retry in a single atomic transaction.
-- ==============================================================================

BEGIN;

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TRIGGER FUNCTION FOR UPDATED_AT
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_video_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. PROJECT VIDEOS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS project_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_stage_id UUID REFERENCES project_stages(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    title TEXT NOT NULL,
    caption TEXT,
    duration_seconds INT,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'video/mp4',
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    purge_failed BOOLEAN NOT NULL DEFAULT false,
    purge_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Data integrity constraints
    CONSTRAINT chk_project_videos_storage_path CHECK (char_length(trim(storage_path)) > 0),
    CONSTRAINT chk_project_videos_title CHECK (char_length(trim(title)) > 0),
    CONSTRAINT chk_project_videos_file_size CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800),
    CONSTRAINT chk_project_videos_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CONSTRAINT chk_project_videos_mime_type CHECK (mime_type IN ('video/mp4', 'video/quicktime', 'video/webm')),
    CONSTRAINT chk_project_videos_sort_order CHECK (sort_order >= 0)
);

-- Indexes for fast ordering and published filtering
CREATE INDEX IF NOT EXISTS idx_project_videos_project ON project_videos(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_project_videos_published ON project_videos(project_id, is_published);
CREATE INDEX IF NOT EXISTS idx_project_videos_stage ON project_videos(project_stage_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_project_videos_updated_at ON project_videos;
CREATE TRIGGER trg_project_videos_updated_at
    BEFORE UPDATE ON project_videos
    FOR EACH ROW
    EXECUTE FUNCTION set_video_updated_at();

-- ==============================================================================
-- 3. PROPERTY VIDEOS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS property_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    title TEXT NOT NULL,
    caption TEXT,
    duration_seconds INT,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    mime_type TEXT NOT NULL DEFAULT 'video/mp4',
    sort_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    purge_failed BOOLEAN NOT NULL DEFAULT false,
    purge_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Data integrity constraints
    CONSTRAINT chk_property_videos_storage_path CHECK (char_length(trim(storage_path)) > 0),
    CONSTRAINT chk_property_videos_title CHECK (char_length(trim(title)) > 0),
    CONSTRAINT chk_property_videos_file_size CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800),
    CONSTRAINT chk_property_videos_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CONSTRAINT chk_property_videos_mime_type CHECK (mime_type IN ('video/mp4', 'video/quicktime', 'video/webm')),
    CONSTRAINT chk_property_videos_sort_order CHECK (sort_order >= 0)
);

-- Indexes for fast ordering and published filtering
CREATE INDEX IF NOT EXISTS idx_property_videos_property ON property_videos(property_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_property_videos_published ON property_videos(property_id, is_published);

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_property_videos_updated_at ON property_videos;
CREATE TRIGGER trg_property_videos_updated_at
    BEFORE UPDATE ON property_videos
    FOR EACH ROW
    EXECUTE FUNCTION set_video_updated_at();

-- ==============================================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE project_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_videos ENABLE ROW LEVEL SECURITY;

-- Project Videos Public Policy: Only view published videos of published, non-archived projects
DROP POLICY IF EXISTS "Public can view published videos of published projects" ON project_videos;
CREATE POLICY "Public can view published videos of published projects" 
    ON project_videos FOR SELECT 
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_videos.project_id 
              AND projects.published = true 
              AND projects.archived_at IS NULL
        )
    );

-- Project Videos Admin Policy: Active admins have full CRUD access
DROP POLICY IF EXISTS "Admins have full access to project videos" ON project_videos;
CREATE POLICY "Admins have full access to project videos" 
    ON project_videos FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- Property Videos Public Policy: Only view published videos of published, non-archived properties
DROP POLICY IF EXISTS "Public can view published videos of published properties" ON property_videos;
CREATE POLICY "Public can view published videos of published properties" 
    ON property_videos FOR SELECT 
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = property_videos.property_id 
              AND properties.published = true 
              AND properties.archived_at IS NULL
        )
    );

-- Property Videos Admin Policy: Active admins have full CRUD access
DROP POLICY IF EXISTS "Admins have full access to property videos" ON property_videos;
CREATE POLICY "Admins have full access to property videos" 
    ON property_videos FOR ALL 
    USING (is_active_admin()) 
    WITH CHECK (is_active_admin());

-- ==============================================================================
-- 5. IDEMPOTENT PRIVATE STORAGE BUCKETS REGISTRATION
-- Note: Does NOT overwrite existing configuration if buckets already exist.
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
    ('project-videos', 'project-videos', false, 52428800, ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png']),
    ('property-videos', 'property-videos', false, 52428800, ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

COMMIT;
