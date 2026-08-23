-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/mosuzgtsxlrfpzitpdup/sql/new

-- Create camp_bookings table to track which donor booked which camp
CREATE TABLE IF NOT EXISTS camp_bookings (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  camp_id       TEXT NOT NULL,
  donor_id      TEXT NOT NULL,
  donor_name    TEXT,
  blood_group   TEXT,
  camp_name     TEXT,
  camp_date     TEXT,
  camp_location TEXT,
  status        TEXT DEFAULT 'Booked',  -- Booked, Attended, Cancelled
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_camp_bookings_camp_id ON camp_bookings(camp_id);
CREATE INDEX IF NOT EXISTS idx_camp_bookings_donor_id ON camp_bookings(donor_id);

-- Verify table created
SELECT * FROM camp_bookings LIMIT 5;
