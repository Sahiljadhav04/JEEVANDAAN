/**
 * Jeevandan — Supabase Seed Script
 * Run once: node seed.js
 * This inserts all initial data into Supabase tables
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

async function seed() {
  console.log('🌱 Seeding Jeevandan database...\n');

  // ===== USERS =====
  const { error: ue } = await supabase.from('users').upsert([
    { id: 'u001', name: 'Arjun Sharma',   email: 'arjun@example.com',  password: 'donor123',    role: 'donor',     donor_id: 'd001', hospital_id: null },
    { id: 'u002', name: 'Priya Patel',    email: 'priya@example.com',  password: 'donor123',    role: 'donor',     donor_id: 'd002', hospital_id: null },
    { id: 'u003', name: 'LifeFlow Staff', email: 'bb@lifeflow.com',    password: 'bank123',     role: 'bloodbank', donor_id: null,   hospital_id: null },
    { id: 'u004', name: 'AIIMS Hospital', email: 'hospital@aiims.com', password: 'hospital123', role: 'hospital',  donor_id: null,   hospital_id: 'h001' },
  ], { onConflict: 'id' });
  console.log(ue ? `❌ Users: ${ue.message}` : '✅ Users inserted');

  // ===== DONORS =====
  const { error: de } = await supabase.from('donors').upsert([
    { id: 'd001', name: 'Arjun Sharma', blood_group: 'B+', age: 28, weight: 72, contact: '+91-9876543210', email: 'arjun@example.com', address: 'Connaught Place, New Delhi', last_donation: '2026-05-01', eligible_date: '2026-08-01', total_donations: 8,  points: 4200, badge: 'Gold Hero',     is_eligible: true,  medical_history: 'None' },
    { id: 'd002', name: 'Priya Patel',  blood_group: 'O+', age: 24, weight: 58, contact: '+91-9988776655', email: 'priya@example.com', address: 'Bandra West, Mumbai',       last_donation: '2026-04-15', eligible_date: '2026-07-15', total_donations: 12, points: 6500, badge: 'Platinum Hero', is_eligible: true,  medical_history: 'None' },
  ], { onConflict: 'id' });
  console.log(de ? `❌ Donors: ${de.message}` : '✅ Donors inserted');

  // ===== DONATION HISTORY =====
  const { error: dhe } = await supabase.from('donation_history').upsert([
    { id: 'dh001', donor_id: 'd001', date: '2026-05-01', blood_group: 'B+', location: 'New Delhi', hospital: 'AIIMS Delhi',         units: 1, certificate_id: 'CERT-2026-1001' },
    { id: 'dh002', donor_id: 'd001', date: '2026-01-20', blood_group: 'B+', location: 'New Delhi', hospital: 'LifeFlow Camp, CP',   units: 1, certificate_id: 'CERT-2026-1002' },
    { id: 'dh003', donor_id: 'd001', date: '2025-10-15', blood_group: 'B+', location: 'Gurgaon',   hospital: 'Medanta Hospital',    units: 1, certificate_id: 'CERT-2025-1003' },
    { id: 'dh004', donor_id: 'd002', date: '2026-04-15', blood_group: 'O+', location: 'Mumbai',    hospital: 'Kokilaben Hospital',  units: 1, certificate_id: 'CERT-2026-2001' },
    { id: 'dh005', donor_id: 'd002', date: '2026-01-10', blood_group: 'O+', location: 'Mumbai',    hospital: 'Fortis Hospital',     units: 1, certificate_id: 'CERT-2026-2002' },
  ], { onConflict: 'id' });
  console.log(dhe ? `❌ Donation History: ${dhe.message}` : '✅ Donation History inserted');

  // ===== INVENTORY =====
  const { error: ie } = await supabase.from('inventory').upsert([
    { id: 'BU-0001', blood_group: 'A+',  volume: 450, collected_date: '2026-07-28', expiry_date: '2026-09-01', status: 'Available', batch_no: 'BAT-2026-001', hiv_test: 'Negative', hepatitis_b: 'Negative', hepatitis_c: 'Negative', malaria: 'Negative', syphilis: 'Negative' },
    { id: 'BU-0002', blood_group: 'O+',  volume: 450, collected_date: '2026-07-25', expiry_date: '2026-08-29', status: 'Available', batch_no: 'BAT-2026-002', hiv_test: 'Negative', hepatitis_b: 'Negative', hepatitis_c: 'Negative', malaria: 'Negative', syphilis: 'Negative' },
    { id: 'BU-0003', blood_group: 'B+',  volume: 450, collected_date: '2026-07-20', expiry_date: '2026-08-24', status: 'Tested',    batch_no: 'BAT-2026-003', hiv_test: 'Pending',  hepatitis_b: 'Pending',  hepatitis_c: 'Pending',  malaria: 'Pending',  syphilis: 'Pending'  },
    { id: 'BU-0004', blood_group: 'AB+', volume: 450, collected_date: '2026-07-15', expiry_date: '2026-08-19', status: 'Reserved',  batch_no: 'BAT-2026-004', hiv_test: 'Negative', hepatitis_b: 'Negative', hepatitis_c: 'Negative', malaria: 'Negative', syphilis: 'Negative' },
    { id: 'BU-0005', blood_group: 'O-',  volume: 450, collected_date: '2026-07-10', expiry_date: '2026-08-14', status: 'Available', batch_no: 'BAT-2026-005', hiv_test: 'Negative', hepatitis_b: 'Negative', hepatitis_c: 'Negative', malaria: 'Negative', syphilis: 'Negative' },
    { id: 'BU-0006', blood_group: 'A-',  volume: 450, collected_date: '2026-07-05', expiry_date: '2026-08-09', status: 'Available', batch_no: 'BAT-2026-006', hiv_test: 'Pending',  hepatitis_b: 'Pending',  hepatitis_c: 'Pending',  malaria: 'Pending',  syphilis: 'Pending'  },
    { id: 'BU-0007', blood_group: 'B-',  volume: 450, collected_date: '2026-08-01', expiry_date: '2026-09-05', status: 'Available', batch_no: 'BAT-2026-007', hiv_test: 'Negative', hepatitis_b: 'Negative', hepatitis_c: 'Negative', malaria: 'Negative', syphilis: 'Negative' },
    { id: 'BU-0008', blood_group: 'AB-', volume: 450, collected_date: '2026-08-02', expiry_date: '2026-09-06', status: 'Available', batch_no: 'BAT-2026-008', hiv_test: 'Negative', hepatitis_b: 'Negative', hepatitis_c: 'Negative', malaria: 'Negative', syphilis: 'Negative' },
    { id: 'BU-0009', blood_group: 'A+',  volume: 450, collected_date: '2026-07-30', expiry_date: '2026-09-03', status: 'Available', batch_no: 'BAT-2026-009', hiv_test: 'Pending',  hepatitis_b: 'Pending',  hepatitis_c: 'Pending',  malaria: 'Pending',  syphilis: 'Pending'  },
    { id: 'BU-0010', blood_group: 'O+',  volume: 450, collected_date: '2026-07-01', expiry_date: '2026-08-05', status: 'Available', batch_no: 'BAT-2026-010', hiv_test: 'Negative', hepatitis_b: 'Negative', hepatitis_c: 'Negative', malaria: 'Negative', syphilis: 'Negative' },
  ], { onConflict: 'id' });
  console.log(ie ? `❌ Inventory: ${ie.message}` : '✅ Inventory inserted (10 units)');

  // ===== CAMPS =====
  const { error: ce } = await supabase.from('camps').upsert([
    { id: 'c001', name: 'Independence Day Blood Drive', date: '2026-08-15', location: 'Red Fort Grounds, New Delhi',    city: 'New Delhi',  organizer: 'Jeevandan Blood Bank',    slots: 200, booked_slots: 78,  status: 'Upcoming',  contact: '011-23456789', description: 'Special camp on Independence Day. Free health checkup for all donors.', lat: 28.6562, lng: 77.2410 },
    { id: 'c002', name: 'Mumbai Marathon Blood Camp',   date: '2026-08-20', location: 'NSCI Dome, Worli, Mumbai',        city: 'Mumbai',     organizer: 'Rotary Club + Jeevandan', slots: 150, booked_slots: 62,  status: 'Upcoming',  contact: '022-98765432', description: 'Coincides with Mumbai Marathon. Open for all age groups.',             lat: 19.0176, lng: 72.8562 },
    { id: 'c003', name: 'College Campus Drive',         date: '2026-07-25', location: 'IIT Delhi, Hauz Khas',            city: 'New Delhi',  organizer: 'NSS + Jeevandan',         slots: 100, booked_slots: 100, status: 'Completed', contact: '011-26541234', description: 'Successfully conducted camp at IIT Delhi.',                             lat: 28.5459, lng: 77.1926 },
    { id: 'c004', name: 'Onam Donation Camp',           date: '2026-09-01', location: 'Ernakulam Town Hall, Kochi',      city: 'Kochi',      organizer: 'Kerala State Blood Bank', slots: 300, booked_slots: 45,  status: 'Upcoming',  contact: '0484-2345678', description: 'Onam special donation camp with cultural program.',                   lat: 9.9312,  lng: 76.2673 },
    { id: 'c005', name: 'Tech Park Initiative',         date: '2026-08-30', location: 'Manyata Tech Park, Bangalore',    city: 'Bangalore',  organizer: 'InfoSys + Jeevandan',     slots: 500, booked_slots: 187, status: 'Upcoming',  contact: '080-12345678', description: 'Corporate donation drive for tech employees.',                         lat: 13.0475, lng: 77.6201 },
  ], { onConflict: 'id' });
  console.log(ce ? `❌ Camps: ${ce.message}` : '✅ Camps inserted (5 camps)');

  // ===== EMERGENCIES =====
  const { error: ee } = await supabase.from('emergencies').upsert([
    { id: 'em001', patient_name: 'Rajesh Kumar', blood_group: 'AB-', hospital: 'AIIMS New Delhi',             distance: 2.5, urgency: 'Critical',  description: 'Emergency surgery - 2 units needed urgently for cardiac procedure.', contact: '011-26588500', units: 2, status: 'Active',    responded_donors: [] },
    { id: 'em002', patient_name: 'Meena Devi',   blood_group: 'O-',  hospital: 'Ram Manohar Lohia Hospital', distance: 5.1, urgency: 'Emergency', description: 'Accident victim - immediate transfusion required.',                  contact: '011-23365525', units: 3, status: 'Active',    responded_donors: [] },
    { id: 'em003', patient_name: 'Sunil Mishra', blood_group: 'B+',  hospital: 'Safdarjung Hospital',         distance: 7.8, urgency: 'Moderate',  description: 'Thalassemia patient - routine transfusion needed.',                  contact: '011-26730000', units: 1, status: 'Active',    responded_donors: [] },
    { id: 'em004', patient_name: 'Fatima Sheikh', blood_group: 'A+', hospital: 'Lok Nayak Hospital',          distance: 3.2, urgency: 'Emergency', description: 'Post-delivery complication - urgent blood needed.',                  contact: '011-23232400', units: 2, status: 'Fulfilled', responded_donors: ['d001'] },
  ], { onConflict: 'id' });
  console.log(ee ? `❌ Emergencies: ${ee.message}` : '✅ Emergencies inserted');

  // ===== HOSPITAL REQUESTS =====
  const now = new Date();
  const { error: hre } = await supabase.from('hospital_requests').upsert([
    { id: 'hr001', hospital_id: 'h001', patient_name: 'Ramesh Gupta', patient_id: 'PAT-1001', blood_group: 'A+', units: 2, urgency: 'Emergency', doctor: 'Dr. S. Sharma', ward: 'ICU',      notes: 'Post-surgery requirement', status: 'Pending',    approved_at: null, dispatched_at: null, received_at: null },
    { id: 'hr002', hospital_id: 'h001', patient_name: 'Sunita Rao',   patient_id: 'PAT-1002', blood_group: 'O+', units: 1, urgency: 'Routine',   doctor: 'Dr. A. Verma',  ward: 'Oncology', notes: 'Chemotherapy support',      status: 'Approved',   approved_at: new Date(now - 43200000).toISOString(), dispatched_at: null, received_at: null },
    { id: 'hr003', hospital_id: 'h001', patient_name: 'Deepak Singh', patient_id: 'PAT-1003', blood_group: 'B-', units: 3, urgency: 'Critical',  doctor: 'Dr. R. Mehta',  ward: 'Surgery',  notes: 'Road accident victim',      status: 'Dispatched', approved_at: new Date(now - 100000000).toISOString(), dispatched_at: new Date(now - 3600000).toISOString(), received_at: null },
    { id: 'hr004', hospital_id: 'h001', patient_name: 'Anita Joshi',  patient_id: 'PAT-1004', blood_group: 'AB+',units: 1, urgency: 'Moderate',  doctor: 'Dr. K. Iyer',   ward: 'Maternity',notes: 'Post-delivery anemia',      status: 'Received',   approved_at: new Date(now - 200000000).toISOString(), dispatched_at: new Date(now - 150000000).toISOString(), received_at: new Date(now - 100000000).toISOString() },
  ], { onConflict: 'id' });
  console.log(hre ? `❌ Hospital Requests: ${hre.message}` : '✅ Hospital Requests inserted');

  // ===== TRANSFUSIONS =====
  const { error: te } = await supabase.from('transfusions').upsert([
    { id: 'tf001', hospital_id: 'h001', patient_name: 'Deepak Singh', patient_id: 'PAT-1003', blood_unit: 'BU-0002', blood_group: 'B-',  doctor: 'Dr. R. Mehta', nurse: 'Nurse Radha', ward: 'Surgery',  reaction: 'None', units: 1 },
    { id: 'tf002', hospital_id: 'h001', patient_name: 'Anita Joshi',  patient_id: 'PAT-1004', blood_unit: 'BU-0005', blood_group: 'AB+', doctor: 'Dr. K. Iyer',  nurse: 'Nurse Priya', ward: 'Maternity', reaction: 'None', units: 1 },
  ], { onConflict: 'id' });
  console.log(te ? `❌ Transfusions: ${te.message}` : '✅ Transfusions inserted');

  // ===== NOTIFICATIONS =====
  const { error: ne } = await supabase.from('notifications').upsert([
    { id: 'n001', user_id: 'u001', type: 'emergency',   title: '🚨 Emergency: AB- needed!',   message: 'Rajesh Kumar at AIIMS needs AB- blood urgently. 2.5km from you.',         read: false },
    { id: 'n002', user_id: 'u001', type: 'eligibility', title: '✅ You can donate again!',     message: 'You are now eligible to donate blood. Book a slot today and save lives!', read: false },
    { id: 'n003', user_id: 'u001', type: 'camp',        title: '⛺ Camp nearby!',              message: 'Independence Day Blood Drive on Aug 15. Only 122 slots left!',            read: true  },
  ], { onConflict: 'id' });
  console.log(ne ? `❌ Notifications: ${ne.message}` : '✅ Notifications inserted');

  // ===== COMMUNITY POSTS =====
  const { error: cpe } = await supabase.from('community_posts').upsert([
    { id: 'cp001', donor_id: 'd001', donor_name: 'Arjun Sharma', blood_group: 'B+', badge: 'Gold Hero',     avatar: 'A', message: 'Just completed my 8th donation today! Feeling great. The staff at AIIMS are so professional. If you are healthy, please donate — it takes 10 minutes and saves 3 lives! 🩸❤️', likes: 24, comments: 7  },
    { id: 'cp002', donor_id: 'd002', donor_name: 'Priya Patel',  blood_group: 'O+', badge: 'Platinum Hero', avatar: 'P', message: 'To all first-time donors who are scared — I was too! But it is completely painless. I have now donated 12 times. The feeling of knowing you saved lives is irreplaceable. 🏆', likes: 56, comments: 14 },
    { id: 'cp003', donor_id: 'guest',donor_name: 'Rahul Mehta',  blood_group: 'A+', badge: 'Silver Hero',   avatar: 'R', message: 'The Jeevandan app notified me about an emergency O- request near me. Responded within 2 hours. The family called me personally to thank me. This is why we donate! 🙏', likes: 89, comments: 22 },
  ], { onConflict: 'id' });
  console.log(cpe ? `❌ Community Posts: ${cpe.message}` : '✅ Community Posts inserted');

  console.log('\n🎉 Jeevandan database seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Login credentials:');
  console.log('  Donor:     arjun@example.com   / donor123');
  console.log('  Donor:     priya@example.com   / donor123');
  console.log('  Blood Bank: bb@lifeflow.com    / bank123');
  console.log('  Hospital:  hospital@aiims.com  / hospital123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('💥 Seed failed:', err.message);
  process.exit(1);
});
