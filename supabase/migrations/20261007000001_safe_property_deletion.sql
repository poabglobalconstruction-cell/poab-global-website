-- ==============================================================================
-- POAB GLOBAL CONSTRUCTION COMPANY LTD
-- Migration: 20261007000001_safe_property_deletion.sql
-- Purpose: Protect customer property enquiries when a property is permanently deleted
-- ==============================================================================

-- 1. Add property reference and title snapshot columns to property_enquiries
ALTER TABLE property_enquiries ADD COLUMN IF NOT EXISTS property_reference TEXT;
ALTER TABLE property_enquiries ADD COLUMN IF NOT EXISTS property_title TEXT;

-- 2. Drop existing foreign key constraint if it exists
ALTER TABLE property_enquiries DROP CONSTRAINT IF EXISTS property_enquiries_property_id_fkey;

-- 3. Make property_id nullable so enquiries can persist even if property is deleted
ALTER TABLE property_enquiries ALTER COLUMN property_id DROP NOT NULL;

-- 4. Re-add foreign key with ON DELETE SET NULL instead of ON DELETE CASCADE
ALTER TABLE property_enquiries 
    ADD CONSTRAINT property_enquiries_property_id_fkey 
    FOREIGN KEY (property_id) 
    REFERENCES properties(id) 
    ON DELETE SET NULL;
