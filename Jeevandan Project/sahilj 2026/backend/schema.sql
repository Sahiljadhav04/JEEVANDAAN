-- ============================================================
-- LifeFlow Blood Donation System — Supabase SQL Schema
-- Paste this ENTIRE file into Supabase SQL Editor and RUN IT
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================== USERS ===================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('donor', 'bloodbank', 'hospital')),
  donor_id TEXT,
  hospital_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================== DONORS ===================
CREATE TABLE IF NOT EXISTS donors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  age INTEGER,
  weight NUMERIC,
  contact TEXT,
  email TEXT,
  address TEXT,
  last_donation DATE,
  eligible_date DATE,
  total_donations INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  badge TEXT DEFAULT 'First Drop',
  is_eligible BOOLEAN DEFAULT TRUE,
  medical_history TEXT DEFAULT 'None',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================== DONATION HISTORY ===================
CREATE TABLE IF NOT EXISTS donation_history (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  donor_id TEXT REFERENCES donors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  blood_group TEXT NOT NULL,
  location TEXT,
  hospital TEXT,
  units INTEGER DEFAULT 1,
  certificate_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================== BLOOD INVENTORY ===================
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  blood_group TEXT NOT NULL,
  volume INTEGER DEFAULT 450,
  collected_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available','Tested','Reserved','Issued','Expired','Discarded')),
  batch_no TEXT,
  donor_id TEXT,
  hiv_test TEXT DEFAULT 'Pending' CHECK (hiv_test IN ('Pending','Negative','Positive')),
  hepatitis_b TEXT DEFAULT 'Pending' CHECK (hepatitis_b IN ('Pending','Negative','Positive')),
  hepatitis_c TEXT DEFAULT 'Pending' CHECK (hepatitis_c IN ('Pending','Negative','Positive')),
  malaria TEXT DEFAULT 'Pending' CHECK (malaria IN ('Pending','Negative','Positive')),
  syphilis TEXT DEFAULT 'Pending' CHECK (syphilis IN ('Pending','Negative','Positive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================== DONATION CAMPS ===================
CREATE TABLE IF NOT EXISTS camps (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  organizer TEXT,
  slots INTEGER DEFAULT 100,
  booked_slots INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Upcoming' CHECK (status IN ('Upcoming','Ongoing','Completed','Cancelled')),
  contact TEXT,
  description TEXT,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================== EMERGENCY REQUESTS ===================
CREATE TABLE IF NOT EXISTS emergencies (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  hospital TEXT NOT NULL,
  distance NUMERIC,
  urgency TEXT DEFAULT 'Emergency' CHECK (urgency IN ('Critical','Emergency','Moderate')),
  description TEXT,
  contact TEXT,
  units INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active','Fulfilled','Cancelled')),
  responded_donors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================== HOSPITAL REQUESTS ===================
CREATE TABLE IF NOT EXISTS hospital_requests (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  hospital_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  blood_group TEXT NOT NULL,
  units INTEGER DEFAULT 1,
  urgency TEXT DEFAULT 'Routine' CHECK (urgency IN ('Routine','Moderate','Emergency','Critical')),
  doctor TEXT,
  ward TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Dispatched','Received','Cancelled')),
  approved_at TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================== TRANSFUSION LOGS ===================
CREATE TABLE IF NOT EXISTS transfusions (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  hospital_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  blood_unit TEXT,
  blood_group TEXT NOT NULL,
  doctor TEXT,
  nurse TEXT,
  ward TEXT,
  reaction TEXT DEFAULT 'None',
  units INTEGER DEFAULT 1,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- =================== NOTIFICATIONS ===================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('emergency','eligibility','camp','info')),
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================== COMMUNITY POSTS ===================
CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  donor_id TEXT,
  donor_name TEXT NOT NULL,
  blood_group TEXT,
  badge TEXT,
  avatar TEXT,
  message TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================== CHECKINS ===================
CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  donor_id TEXT,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  hemoglobin NUMERIC,
  bp TEXT,
  weight NUMERIC,
  location TEXT,
  certificate_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED DATA — Initial records
-- ============================================================

-- Users
INSERT INTO users (id, name, email, password, role, donor_id, hospital_id) VALUES
  ('u001', 'Arjun Sharma',   'arjun@example.com',    'donor123',    'donor',     'd001', NULL),
  ('u002', 'Priya Patel',    'priya@example.com',    'donor123',    'donor',     'd002', NULL),
  ('u003', 'LifeFlow Staff', 'bb@lifeflow.com',      'bank123',     'bloodbank', NULL,  NULL),
  ('u004', 'AIIMS Hospital', 'hospital@aiims.com',   'hospital123', 'hospital',  NULL,  'h001')
ON CONFLICT (id) DO NOTHING;

-- Donors
INSERT INTO donors (id, name, blood_group, age, weight, contact, email, address, last_donation, eligible_date, total_donations, points, badge, is_eligible, medical_history) VALUES
  ('d001', 'Arjun Sharma', 'B+', 28, 72, '+91-9876543210', 'arjun@example.com', 'Connaught Place, New Delhi', '2026-05-01', '2026-08-01', 8,  4200, 'Gold Hero',     TRUE, 'None'),
  ('d002', 'Priya Patel',  'O+', 24, 58, '+91-9988776655', 'priya@example.com', 'Bandra West, Mumbai',       '2026-04-15', '2026-07-15', 12, 6500, 'Platinum Hero', TRUE, 'None')
ON CONFLICT (id) DO NOTHING;

-- Donation History
INSERT INTO donation_history (id, donor_id, date, blood_group, location, hospital, units, certificate_id) VALUES
  ('dh001', 'd001', '2026-05-01', 'B+', 'New Delhi', 'AIIMS Delhi',          1, 'CERT-2026-1001'),
  ('dh002', 'd001', '2026-01-20', 'B+', 'New Delhi', 'LifeFlow Camp, CP',    1, 'CERT-2026-1002'),
  ('dh003', 'd001', '2025-10-15', 'B+', 'Gurgaon',   'Medanta Hospital',     1, 'CERT-2025-1003'),
  ('dh004', 'd002', '2026-04-15', 'O+', 'Mumbai',    'Kokilaben Hospital',   1, 'CERT-2026-2001'),
  ('dh005', 'd002', '2026-01-10', 'O+', 'Mumbai',    'Fortis Hospital',      1, 'CERT-2026-2002')
ON CONFLICT (id) DO NOTHING;

-- Blood Inventory
INSERT INTO inventory (id, blood_group, volume, collected_date, expiry_date, status, batch_no, hiv_test, hepatitis_b, hepatitis_c, malaria, syphilis) VALUES
  ('BU-0001', 'A+',  450, '2026-07-28', '2026-09-01', 'Available', 'BAT-2026-001', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative'),
  ('BU-0002', 'O+',  450, '2026-07-25', '2026-08-29', 'Available', 'BAT-2026-002', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative'),
  ('BU-0003', 'B+',  450, '2026-07-20', '2026-08-24', 'Tested',    'BAT-2026-003', 'Pending',  'Pending',  'Pending',  'Pending',  'Pending'),
  ('BU-0004', 'AB+', 450, '2026-07-15', '2026-08-19', 'Reserved',  'BAT-2026-004', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative'),
  ('BU-0005', 'O-',  450, '2026-07-10', '2026-08-14', 'Available', 'BAT-2026-005', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative'),
  ('BU-0006', 'A-',  450, '2026-07-05', '2026-08-09', 'Available', 'BAT-2026-006', 'Pending',  'Pending',  'Pending',  'Pending',  'Pending'),
  ('BU-0007', 'B-',  450, '2026-08-01', '2026-09-05', 'Available', 'BAT-2026-007', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative'),
  ('BU-0008', 'AB-', 450, '2026-08-02', '2026-09-06', 'Available', 'BAT-2026-008', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative'),
  ('BU-0009', 'A+',  450, '2026-07-30', '2026-09-03', 'Available', 'BAT-2026-009', 'Pending',  'Pending',  'Pending',  'Pending',  'Pending'),
  ('BU-0010', 'O+',  450, '2026-07-01', '2026-08-05', 'Available', 'BAT-2026-010', 'Negative', 'Negative', 'Negative', 'Negative', 'Negative')
ON CONFLICT (id) DO NOTHING;

-- Donation Camps
INSERT INTO camps (id, name, date, location, city, organizer, slots, booked_slots, status, contact, description, lat, lng) VALUES
  ('c001', 'Independence Day Blood Drive',  '2026-08-15', 'Red Fort Grounds, New Delhi',    'New Delhi',  'LifeFlow Blood Bank',      200, 78,  'Upcoming',   '011-23456789', 'Special camp on Independence Day. Free health checkup for all donors.', 28.6562, 77.2410),
  ('c002', 'Mumbai Marathon Blood Camp',    '2026-08-20', 'NSCI Dome, Worli, Mumbai',        'Mumbai',     'Rotary Club + LifeFlow',   150, 62,  'Upcoming',   '022-98765432', 'Coincides with Mumbai Marathon. Open for all age groups.',             19.0176, 72.8562),
  ('c003', 'College Campus Drive',          '2026-07-25', 'IIT Delhi, Hauz Khas',            'New Delhi',  'NSS + LifeFlow',           100, 100, 'Completed',  '011-26541234', 'Successfully conducted camp at IIT Delhi.',                             28.5459, 77.1926),
  ('c004', 'Onam Donation Camp',            '2026-09-01', 'Ernakulam Town Hall, Kochi',      'Kochi',      'Kerala State Blood Bank',  300, 45,  'Upcoming',   '0484-2345678', 'Onam special donation camp with cultural program.',                     9.9312,  76.2673),
  ('c005', 'Tech Park Initiative',          '2026-08-30', 'Manyata Tech Park, Bangalore',    'Bangalore',  'InfoSys + LifeFlow',       500, 187, 'Upcoming',   '080-12345678', 'Corporate donation drive for tech employees.',                          13.0475, 77.6201)
ON CONFLICT (id) DO NOTHING;

-- Emergency Requests
INSERT INTO emergencies (id, patient_name, blood_group, hospital, distance, urgency, description, contact, units, status, responded_donors) VALUES
  ('em001', 'Rajesh Kumar', 'AB-', 'AIIMS New Delhi',               2.5, 'Critical',  'Emergency surgery - 2 units needed urgently for cardiac procedure.', '011-26588500', 2, 'Active',    '{}'),
  ('em002', 'Meena Devi',   'O-',  'Ram Manohar Lohia Hospital',    5.1, 'Emergency', 'Accident victim - immediate transfusion required.',                  '011-23365525', 3, 'Active',    '{}'),
  ('em003', 'Sunil Mishra', 'B+',  'Safdarjung Hospital',           7.8, 'Moderate',  'Thalassemia patient - routine transfusion needed.',                  '011-26730000', 1, 'Active',    '{}'),
  ('em004', 'Fatima Sheikh','A+',  'Lok Nayak Hospital',            3.2, 'Emergency', 'Post-delivery complication - urgent blood needed.',                  '011-23232400', 2, 'Fulfilled', '{d001}')
ON CONFLICT (id) DO NOTHING;

-- Hospital Requests
INSERT INTO hospital_requests (id, hospital_id, patient_name, patient_id, blood_group, units, urgency, doctor, ward, notes, status, approved_at, dispatched_at) VALUES
  ('hr001', 'h001', 'Ramesh Gupta', 'PAT-1001', 'A+', 2, 'Emergency', 'Dr. S. Sharma', 'ICU',      'Post-surgery requirement',  'Pending',    NULL, NULL),
  ('hr002', 'h001', 'Sunita Rao',   'PAT-1002', 'O+', 1, 'Routine',   'Dr. A. Verma',  'Oncology', 'Chemotherapy support',      'Approved',   NOW() - INTERVAL '12 hours', NULL),
  ('hr003', 'h001', 'Deepak Singh', 'PAT-1003', 'B-', 3, 'Critical',  'Dr. R. Mehta',  'Surgery',  'Road accident victim',      'Dispatched', NOW() - INTERVAL '27 hours', NOW() - INTERVAL '1 hour'),
  ('hr004', 'h001', 'Anita Joshi',  'PAT-1004', 'AB+',1, 'Moderate',  'Dr. K. Iyer',   'Maternity','Post-delivery anemia',      'Received',   NOW() - INTERVAL '55 hours', NOW() - INTERVAL '41 hours')
ON CONFLICT (id) DO NOTHING;

-- Transfusion Logs
INSERT INTO transfusions (id, hospital_id, patient_name, patient_id, blood_unit, blood_group, doctor, nurse, ward, reaction, units) VALUES
  ('tf001', 'h001', 'Deepak Singh', 'PAT-1003', 'BU-0002', 'B-',  'Dr. R. Mehta', 'Nurse Radha', 'Surgery',  'None', 1),
  ('tf002', 'h001', 'Anita Joshi',  'PAT-1004', 'BU-0005', 'AB+', 'Dr. K. Iyer',  'Nurse Priya', 'Maternity','None', 1)
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, user_id, type, title, message, read) VALUES
  ('n001', 'u001', 'emergency',   '🚨 Emergency: AB- needed!',    'Rajesh Kumar at AIIMS needs AB- blood urgently. 2.5km from you.',       FALSE),
  ('n002', 'u001', 'eligibility', '✅ You can donate again!',      'You are now eligible to donate blood. Book a slot today and save lives!', FALSE),
  ('n003', 'u001', 'camp',        '⛺ Camp nearby!',               'Independence Day Blood Drive on Aug 15 at Red Fort. Only 122 slots left!',TRUE)
ON CONFLICT (id) DO NOTHING;

-- Community Posts
INSERT INTO community_posts (id, donor_id, donor_name, blood_group, badge, avatar, message, likes, comments) VALUES
  ('cp001', 'd001', 'Arjun Sharma', 'B+', 'Gold Hero',     'A', 'Just completed my 8th donation today! Feeling great. The staff at AIIMS are so professional. If you are healthy, please donate - it takes 10 minutes and saves 3 lives! 🩸❤️', 24, 7),
  ('cp002', 'd002', 'Priya Patel',  'O+', 'Platinum Hero', 'P', 'To all first-time donors who are scared - I was too! But it is completely painless and the team takes amazing care. I have now donated 12 times. The feeling of knowing you saved lives is irreplaceable. 🏆', 56, 14),
  ('cp003', 'guest','Rahul Mehta',  'A+', 'Silver Hero',   'R', 'The LifeFlow app just notified me about an emergency O- request near me. Responded within 2 hours. The family called me personally to thank me. This is why we donate! 🙏', 89, 22)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Row Level Security (RLS) — Disable for backend server access
-- The Express backend uses the service_role key which bypasses RLS
-- ============================================================
ALTER TABLE users             DISABLE ROW LEVEL SECURITY;
ALTER TABLE donors            DISABLE ROW LEVEL SECURITY;
ALTER TABLE donation_history  DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory         DISABLE ROW LEVEL SECURITY;
ALTER TABLE camps             DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies       DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE transfusions      DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts   DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins          DISABLE ROW LEVEL SECURITY;

-- Done! All tables created and seeded.
SELECT 'LifeFlow schema installed successfully! 🩸' AS status;
