-- Run this in Supabase SQL Editor to add missing columns to emergencies table
-- Go to: https://supabase.com/dashboard/project/mosuzgtsxlrfpzitpdup/sql/new

-- Add lat/lng columns to emergencies table (missing from original schema)
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- Verify the change
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'emergencies' ORDER BY ordinal_position;
