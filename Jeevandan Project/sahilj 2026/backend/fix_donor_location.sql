-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/mosuzgtsxlrfpzitpdup/sql/new

-- Add lat/lng to donors table for proximity-based email alerts
ALTER TABLE donors ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE donors ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- Add lat/lng to emergencies table (in case not already done)
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE emergencies ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- Seed known lat/lng for existing donors
UPDATE donors SET lat = 28.6315, lng = 77.2167 WHERE id = 'd001'; -- Connaught Place, New Delhi
UPDATE donors SET lat = 19.0544, lng = 72.8397 WHERE id = 'd002'; -- Bandra West, Mumbai

-- Verify
SELECT id, name, blood_group, email, lat, lng FROM donors;
