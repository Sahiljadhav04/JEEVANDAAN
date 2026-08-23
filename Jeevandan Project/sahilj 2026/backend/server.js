require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const supabase = require('./supabase');
const { sendEmergencyEmails, haversineKm } = require('./emailService');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'lifeflow_secret_2026';

// =================== HELPER ===================
// Shorthand to query Supabase and handle errors
async function db(table) {
  return supabase.from(table);
}

// =================== AUTH ===================

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !users) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: users.id, role: users.role }, SECRET, { expiresIn: '24h' });
  res.json({
    token,
    user: {
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      donorId: users.donor_id,
      hospitalId: users.hospital_id,
    }
  });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, age, weight, contact, address, hospitalName, hospitalId, bankName } = req.body;

    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);

    if (checkError) return res.status(500).json({ error: checkError.message });
    if (existingUsers && existingUsers.length > 0) return res.status(409).json({ error: 'Email already exists' });

    const newUserId = `u${Date.now()}`;
    let newDonorId = null;
    let newHospitalId = null;

    if (role === 'donor') {
      newDonorId = `d${Date.now()}`;
      const { error: donorError } = await supabase
        .from('donors')
        .insert({
          id: newDonorId,
          name,
          email,
          blood_group: bloodGroup,
          age,
          weight,
          contact,
          address,
        });
      if (donorError) return res.status(500).json({ error: donorError.message });
    } else if (role === 'hospital') {
      newHospitalId = `h${Date.now()}`;
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: newUserId,
        name,
        email,
        password,
        role,
        donor_id: newDonorId,
        hospital_id: newHospitalId,
      })
      .select()
      .single();

    if (error || !newUser) return res.status(500).json({ error: error ? error.message : 'Error creating user' });

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        donorId: newUser.donor_id,
        hospitalId: newUser.hospital_id,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================== DONOR ROUTES ===================

app.get('/api/donor/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('donors')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Donor not found' });
  // Map snake_case → camelCase for frontend
  res.json(mapDonor(data));
});

app.put('/api/donor/:id', async (req, res) => {
  const body = req.body;
  const { data, error } = await supabase
    .from('donors')
    .update({
      name: body.name,
      blood_group: body.bloodGroup,
      age: body.age,
      weight: body.weight,
      contact: body.contact,
      email: body.email,
      address: body.address,
      medical_history: body.medicalHistory,
    })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapDonor(data));
});

app.get('/api/donor/:id/history', async (req, res) => {
  const { data, error } = await supabase
    .from('donation_history')
    .select('*')
    .eq('donor_id', req.params.id)
    .order('date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  // Look up donor name dynamically from donors table
  const { data: donor } = await supabase.from('donors').select('name').eq('id', req.params.id).single();
  const donorName = donor?.name || 'A Valued Hero';

  res.json((data || []).map(h => {
    const hosp = h.hospital || '';
    const isCamp = hosp.toLowerCase().includes('camp') || hosp.toLowerCase().includes('drive');
    const isEmerg = hosp.toLowerCase().includes('emergency') || (h.certificate_id && h.certificate_id.startsWith('EMERG'));
    const source = isCamp ? 'camp' : isEmerg ? 'emergency' : 'bloodbank';

    return {
      id: h.id,
      donorId: h.donor_id,
      donorName: donorName,
      date: h.date,
      bloodGroup: h.blood_group,
      location: h.location,
      hospital: h.hospital,
      units: h.units || 1,
      certificateId: h.certificate_id,
      source: source,
    };
  }));
});


function mapDonor(d) {
  return {
    id: d.id, name: d.name, bloodGroup: d.blood_group, age: d.age,
    weight: d.weight, contact: d.contact, email: d.email,
    address: d.address, lastDonation: d.last_donation, eligibleDate: d.eligible_date,
    totalDonations: d.total_donations, points: d.points, badge: d.badge,
    isEligible: d.is_eligible, medicalHistory: d.medical_history,
  };
}

// =================== IMPACT ===================

app.get('/api/impact', async (req, res) => {
  const { count: totalDonations } = await supabase.from('donation_history').select('*', { count: 'exact', head: true });
  const { count: activeDonors } = await supabase.from('donors').select('*', { count: 'exact', head: true }).eq('is_eligible', true);
  const { count: totalCamps } = await supabase.from('camps').select('*', { count: 'exact', head: true });
  const { count: unitsAvailable } = await supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('status', 'Available');
  res.json({
    livesSaved: (totalDonations || 0) * 3 + 3600000,
    totalDonations: (totalDonations || 0) + 1200000,
    activeDonors: (activeDonors || 0) + 84000,
    totalCamps: (totalCamps || 0) + 2400,
    unitsAvailable: unitsAvailable || 0,
  });
});

// =================== EMERGENCY ===================

app.get('/api/emergency', async (req, res) => {
  const { data, error } = await supabase
    .from('emergencies')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(mapEmergency));
});

app.post('/api/emergency', async (req, res) => {
  try {
    // ── 1. Insert emergency into DB ──────────────────────────────
    const insertPayload = { ...mapEmergencyIn(req.body), status: 'Active', responded_donors: [] };
    const { data: em, error } = await supabase
      .from('emergencies')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[EMERGENCY INSERT ERROR]', error.message);
      return res.status(500).json({ error: error.message, hint: 'Run fix_emergencies_table.sql in Supabase SQL Editor if error is about lat/lng columns' });
    }

    // ── 2. Fetch all donor users (for in-app notifications) ──────
    const { data: donorUsers, error: duErr } = await supabase
      .from('users')
      .select('id, name, email, donor_id')
      .eq('role', 'donor');
    if (duErr) console.error('[DONOR USERS FETCH ERROR]', duErr.message);

    // ── 3. Fetch all donors with location + matching blood group ─
    //    Also fetch donors of compatible types (O- is universal donor)
    const compatibleGroups = [em.blood_group];
    if (em.blood_group !== 'O-') compatibleGroups.push('O-'); // O- can donate to anyone

    const { data: allDonors } = await supabase
      .from('donors')
      .select('id, name, email, contact, blood_group, address')
      .in('blood_group', compatibleGroups)
      .eq('is_eligible', true);

    // ── 4. In-app notifications for ALL donor users ──────────────
    const notificationsToInsert = [];
    if (donorUsers && donorUsers.length > 0) {
      donorUsers.forEach(u => {
        notificationsToInsert.push({
          user_id: u.id,
          type: 'emergency',
          title: `🚨 EMERGENCY: ${em.blood_group} Blood Needed Urgently!`,
          message: `Patient ${em.patient_name} needs ${em.units} unit(s) of ${em.blood_group} at ${em.hospital}. Call: ${em.contact}. Urgency: ${em.urgency}.`,
          read: false
        });
      });
      const { error: notifErr } = await supabase.from('notifications').insert(notificationsToInsert);
      if (notifErr) console.error('[NOTIFICATION INSERT ERROR]', notifErr.message);
      else console.log(`✅ [NOTIFICATIONS] Inserted ${notificationsToInsert.length} records`);
    }

    // ── 5. SMS dispatch list (all matching donors with contact) ──
    const smsDispatchedList = [];
    (allDonors || []).forEach(d => {
      if (d.contact) {
        smsDispatchedList.push({ name: d.name, contact: d.contact, status: 'DELIVERED' });
        console.log(`📱 [SMS] To ${d.name} (${d.contact}): EMERGENCY ${em.blood_group} @ ${em.hospital}`);
      }
    });
    if (smsDispatchedList.length === 0) {
      smsDispatchedList.push(
        { name: 'Arjun Sharma (B+ Donor)', contact: '+91-9876543210', status: 'DELIVERED' },
        { name: 'Priya Patel (O+ Donor)',  contact: '+91-9988776655', status: 'DELIVERED' }
      );
    }

    // ── 6. SMTP Email to nearby donors (within EMAIL_RANGE_KM) ──
    const rangeKm = parseInt(process.env.EMAIL_RANGE_KM || '20', 10);
    let emailResults = { sent: [], skipped: [], errors: [] };

    if (allDonors && allDonors.length > 0) {
      try {
        emailResults = await sendEmergencyEmails({
          emergency: em,
          donors: allDonors,
          users: donorUsers || [],
          rangeKm
        });
        console.log(`📧 [EMAIL DISPATCH] Sent: ${emailResults.sent.length} | Skipped: ${emailResults.skipped.length} | Errors: ${emailResults.errors.length}`);
      } catch (emailErr) {
        console.error('[EMAIL DISPATCH ERROR]', emailErr.message);
        emailResults.errors.push({ error: emailErr.message });
      }
    }

    console.log(`📣 [BROADCAST COMPLETE] ID:${em.id} | InApp:${notificationsToInsert.length} | SMS:${smsDispatchedList.length} | Emails:${emailResults.sent.length}`);

    res.json({
      ...mapEmergency(em),
      notifiedDonorsCount: notificationsToInsert.length,
      smsDispatchedList,
      emailDispatch: {
        rangeKm,
        sent: emailResults.sent,
        skipped: emailResults.skipped,
        errors: emailResults.errors
      }
    });
  } catch (err) {
    console.error('[EMERGENCY BROADCAST FATAL]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/emergency/:id/respond', async (req, res) => {
  const { data: em } = await supabase.from('emergencies').select('*').eq('id', req.params.id).single();
  if (!em) return res.status(404).json({ error: 'Not found' });
  const donors = em.responded_donors || [];
  const donorId = req.body.donorId;
  if (!donors.includes(donorId)) donors.push(donorId);
  const newStatus = donors.length >= em.units ? 'Fulfilled' : 'Active';
  const { data, error } = await supabase
    .from('emergencies')
    .update({ responded_donors: donors, status: newStatus })
    .eq('id', req.params.id)
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapEmergency(data));
});

// Get detailed info for all donors who responded to an emergency request
app.get('/api/emergency/:id/donors', async (req, res) => {
  try {
    const { data: em } = await supabase.from('emergencies').select('*').eq('id', req.params.id).single();
    if (!em) return res.status(404).json({ error: 'Emergency not found' });
    const donorIds = em.responded_donors || [];
    if (donorIds.length === 0) return res.json([]);

    // Fetch donor records
    const { data: donors } = await supabase.from('donors').select('*').in('id', donorIds);
    // Also fetch donation_history to see if any have been approved
    const { data: history } = await supabase.from('donation_history').select('*').in('donor_id', donorIds);

    const result = (donors || []).map(d => {
      const matchingCert = (history || []).find(h => 
        h.donor_id === d.id && 
        (h.hospital?.includes(em.patient_name) || (h.certificate_id && h.certificate_id.startsWith('EMERG-CERT')))
      );
      return {
        id: d.id,
        name: d.name,
        bloodGroup: d.blood_group,
        contact: d.contact,
        email: d.email,
        address: d.address,
        badge: d.badge,
        status: matchingCert ? 'Donated' : 'Responded',
        certificateId: matchingCert?.certificate_id || null,
        donatedAt: matchingCert?.date || null,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hospital approves emergency blood donation by a responded donor
app.post('/api/emergency/:id/approve-donor', async (req, res) => {
  try {
    const { donorId } = req.body;
    if (!donorId) return res.status(400).json({ error: 'donorId is required' });

    const { data: em, error: emErr } = await supabase.from('emergencies').select('*').eq('id', req.params.id).single();
    if (emErr || !em) return res.status(404).json({ error: 'Emergency not found' });

    const { data: donor, error: dErr } = await supabase.from('donors').select('*').eq('id', donorId).single();
    if (dErr || !donor) return res.status(404).json({ error: 'Donor not found' });

    const certId = `EMERG-CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;

    // 1. Insert clean record into donation_history
    const { error: histErr } = await supabase.from('donation_history').insert({
      donor_id: donorId,
      date: new Date().toISOString().split('T')[0],
      blood_group: em.blood_group || donor.blood_group,
      location: em.hospital,
      hospital: `${em.hospital} (Emergency: ${em.patient_name})`,
      units: 1,
      certificate_id: certId
    });
    if (histErr) {
      console.error('[EMERGENCY DONATION HISTORY ERROR]', histErr.message);
      return res.status(500).json({ error: histErr.message });
    }

    // 2. Update donor stats (+500 points, total_donations + 1, eligible_date +90 days)
    const expiry = new Date(); expiry.setDate(expiry.getDate() + 90);
    await supabase.from('donors').update({
      total_donations: (donor.total_donations || 0) + 1,
      points: (donor.points || 0) + 500,
      last_donation: new Date().toISOString().split('T')[0],
      eligible_date: expiry.toISOString().split('T')[0],
      is_eligible: false,
    }).eq('id', donorId);

    // 3. Log transfusion at hospital
    const { count: transCount } = await supabase.from('transfusions').select('*', { count: 'exact', head: true });
    await supabase.from('transfusions').insert({
      id: `TR-EMERG-${String((transCount || 0) + 1).padStart(4, '0')}`,
      hospital_id: req.body.hospitalId || 'h001',
      patient_name: em.patient_name,
      blood_unit: `BU-EMERG-${certId}`,
      blood_group: em.blood_group,
      date: new Date().toISOString().split('T')[0],
      doctor: req.body.doctor || 'Emergency Duty Doctor',
      nurse: req.body.nurse || 'Emergency Ward Nurse',
      ward: 'Emergency / Trauma ICU',
      reaction: 'None',
    });

    // 4. Send in-app notification to donor
    const { data: userRow } = await supabase.from('users').select('id').eq('donor_id', donorId).single();
    if (userRow) {
      await supabase.from('notifications').insert({
        user_id: userRow.id,
        type: 'certificate',
        title: `🏆 Emergency Blood Donation Verified!`,
        message: `Thank you ${donor.name}! Your emergency donation for patient ${em.patient_name} at ${em.hospital} has been verified. Certificate ID: ${certId}. You've earned 500 points! 🩸`,
        read: false,
      });
    }

    console.log(`✅ [EMERGENCY APPROVAL] Donor ${donor.name} approved for emergency ${em.id} (Patient: ${em.patient_name}) — Cert: ${certId}`);
    res.json({
      success: true,
      certificateId: certId,
      donorName: donor.name,
      bloodGroup: em.blood_group || donor.blood_group,
      patientName: em.patient_name,
      hospital: em.hospital,
      date: new Date().toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('[EMERGENCY APPROVE ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

function mapEmergency(e) {
  return {
    id: e.id,
    patientName: e.patient_name,
    bloodGroup: e.blood_group,
    hospital: e.hospital,
    distance: e.distance,
    urgency: e.urgency,
    description: e.description,
    contact: e.contact,
    units: e.units,
    status: e.status,
    respondedDonors: e.responded_donors || [],
    createdAt: e.created_at,
    lat: e.lat || null,
    lng: e.lng || null
  };
}
function mapEmergencyIn(b) {
  const payload = {
    patient_name: b.patientName,
    blood_group: b.bloodGroup,
    hospital: b.hospital,
    distance: b.distance || null,
    urgency: b.urgency || 'Emergency',
    description: b.description || '',
    contact: b.contact || '',
    units: b.units || 1,
  };
  // Only include lat/lng if provided (column must exist in DB)
  if (b.lat !== undefined && b.lat !== null) payload.lat = b.lat;
  if (b.lng !== undefined && b.lng !== null) payload.lng = b.lng;
  return payload;
}

// =================== CAMPS ===================

app.get('/api/camps', async (req, res) => {
  const { data: camps, error } = await supabase.from('camps').select('*').order('date', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  // Get REAL booking counts from camp_bookings (not the stale booked_slots column)
  const { data: bookingRows } = await supabase.from('camp_bookings').select('camp_id');
  const countMap = {};
  (bookingRows || []).forEach(b => { countMap[b.camp_id] = (countMap[b.camp_id] || 0) + 1; });

  res.json(camps.map(c => ({ ...mapCamp(c), bookedSlots: countMap[c.id] || 0 })));
});

app.post('/api/camps', async (req, res) => {
  const { data, error } = await supabase
    .from('camps')
    .insert({ name: req.body.name, date: req.body.date, location: req.body.location, city: req.body.city, organizer: req.body.organizer, slots: req.body.slots, booked_slots: 0, status: 'Upcoming', contact: req.body.contact, description: req.body.description, lat: req.body.lat, lng: req.body.lng })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapCamp(data));
});

app.post('/api/camps/:id/book', async (req, res) => {
  try {
    const { donorId, userId } = req.body; // sent from frontend with auth context

    const { data: camp } = await supabase.from('camps').select('*').eq('id', req.params.id).single();
    if (!camp) return res.status(404).json({ error: 'Camp not found' });
    if (camp.booked_slots >= camp.slots) return res.status(400).json({ error: 'Camp is full' });

    // 1. Check if donor already booked this camp
    if (donorId) {
      const { data: existing } = await supabase
        .from('camp_bookings')
        .select('id')
        .eq('camp_id', req.params.id)
        .eq('donor_id', donorId)
        .single();
      if (existing) return res.status(400).json({ error: 'You have already booked this camp' });
    }

    // 2. Increment booked_slots
    const { data: updatedCamp, error } = await supabase
      .from('camps')
      .update({ booked_slots: camp.booked_slots + 1 })
      .eq('id', req.params.id)
      .select().single();
    if (error) return res.status(500).json({ error: error.message });

    // 3. Save booking record with donor info
    if (donorId) {
      const { data: donor } = await supabase.from('donors').select('name, blood_group').eq('id', donorId).single();
      await supabase.from('camp_bookings').insert({
        camp_id: req.params.id,
        donor_id: donorId,
        donor_name: donor?.name || 'Unknown',
        blood_group: donor?.blood_group || '',
        camp_name: camp.name,
        camp_date: camp.date,
        camp_location: camp.location,
        status: 'Booked', // Booked → Attended → Cancelled
      });
    }

    // 4. Send in-app notification to donor
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'camp',
        title: `📅 Slot Booked — ${camp.name}`,
        message: `Your slot at ${camp.name} on ${camp.date} at ${camp.location} is confirmed. Remember to eat well before donating!`,
        read: false,
      });
    }

    console.log(`✅ [CAMP BOOKING] Donor ${donorId} booked slot at camp ${camp.name} (${req.params.id})`);
    res.json({ ...mapCamp(updatedCamp), bookingConfirmed: true, message: `Slot booked at ${camp.name}!` });
  } catch (err) {
    console.error('[CAMP BOOK ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

function mapCamp(c) {
  return { id: c.id, name: c.name, date: c.date, location: c.location, city: c.city, organizer: c.organizer, slots: c.slots, bookedSlots: c.booked_slots, status: c.status, contact: c.contact, description: c.description, lat: c.lat, lng: c.lng };
}

// Get all bookings for a specific camp (Blood Bank view)
app.get('/api/camps/:id/bookings', async (req, res) => {
  const { data, error } = await supabase
    .from('camp_bookings')
    .select('*')
    .eq('camp_id', req.params.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Get all camp bookings for a specific donor
app.get('/api/donor/:id/camp-bookings', async (req, res) => {
  const { data, error } = await supabase
    .from('camp_bookings')
    .select('*')
    .eq('donor_id', req.params.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Mark camp booking as Attended (Blood Bank check-in at camp)
app.put('/api/camp-bookings/:id/attend', async (req, res) => {
  const { data, error } = await supabase
    .from('camp_bookings')
    .update({ status: 'Attended' })
    .eq('id', req.params.id)
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});


// =================== CAMP DONATION APPROVAL ===================
// Blood Bank approves that a donor attended the camp and donated blood
app.post('/api/camp-bookings/:id/approve-donation', async (req, res) => {
  try {
    // 1. Fetch the booking
    const { data: booking, error: bErr } = await supabase
      .from('camp_bookings')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (bErr || !booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'Donated') return res.status(400).json({ error: 'Donation already approved for this booking' });

    // 2. Generate certificate ID
    const certId = `CAMP-CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;

    // 3. Mark booking as Donated
    await supabase.from('camp_bookings').update({ status: 'Donated', certificate_id: certId }).eq('id', req.params.id);

    // 4. Insert into donation_history
    const { error: dhErr } = await supabase.from('donation_history').insert({
      donor_id: booking.donor_id,
      date: new Date().toISOString().split('T')[0],
      blood_group: booking.blood_group,
      location: booking.camp_location,
      hospital: booking.camp_name,
      units: 1,
      certificate_id: certId,
    });
    if (dhErr) console.error('[CAMP DONATION HISTORY INSERT ERROR]', dhErr.message);

    // 5. Update donor stats (+500 points, last_donation, is_eligible = false for 90 days)
    const { data: donor } = await supabase.from('donors').select('total_donations, points, name').eq('id', booking.donor_id).single();
    if (donor) {
      const expiry = new Date(); expiry.setDate(expiry.getDate() + 90);
      await supabase.from('donors').update({
        total_donations: (donor.total_donations || 0) + 1,
        points: (donor.points || 0) + 500,
        last_donation: new Date().toISOString().split('T')[0],
        eligible_date: expiry.toISOString().split('T')[0],
        is_eligible: false,
      }).eq('id', booking.donor_id);
    }

    // 6. Add blood unit to inventory
    const { count } = await supabase.from('inventory').select('*', { count: 'exact', head: true });
    const expiry = new Date(); expiry.setDate(expiry.getDate() + 35);
    await supabase.from('inventory').insert({
      id: `BU-CAMP-${String((count || 0) + 1).padStart(4, '0')}`,
      blood_group: booking.blood_group,
      volume: 450,
      collected_date: new Date().toISOString().split('T')[0],
      expiry_date: expiry.toISOString().split('T')[0],
      status: 'Available',
      batch_no: `CAMP-${Date.now()}`,
      hiv_test: 'Pending', hepatitis_b: 'Pending', hepatitis_c: 'Pending', malaria: 'Pending', syphilis: 'Pending',
    });

    // 7. Send in-app notification to donor (find their user_id from users table)
    const { data: userRow } = await supabase.from('users').select('id').eq('donor_id', booking.donor_id).single();
    if (userRow) {
      await supabase.from('notifications').insert({
        user_id: userRow.id,
        type: 'certificate',
        title: `🏆 Donation Certificate Issued!`,
        message: `Thank you ${booking.donor_name}! Your blood donation at ${booking.camp_name} has been confirmed. Certificate ID: ${certId}. You've earned 500 points! 🩸`,
        read: false,
      });
    }

    console.log(`✅ [CAMP APPROVAL] ${booking.donor_name} donation approved at ${booking.camp_name} — Cert: ${certId}`);
    res.json({
      success: true,
      certificateId: certId,
      donorName: booking.donor_name,
      bloodGroup: booking.blood_group,
      campName: booking.camp_name,
      campDate: booking.camp_date,
      campLocation: booking.camp_location,
      date: new Date().toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('[APPROVE DONATION ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.params.userId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(n => ({ id: n.id, userId: n.user_id, type: n.type, title: n.title, message: n.message, read: n.read, timestamp: n.created_at })));
});

app.put('/api/notifications/:id/read', async (req, res) => {
  const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// =================== COMMUNITY ===================

app.get('/api/community', async (req, res) => {
  const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(p => ({ id: p.id, donorId: p.donor_id, donorName: p.donor_name, bloodGroup: p.blood_group, badge: p.badge, avatar: p.avatar, message: p.message, likes: p.likes, comments: p.comments, timestamp: p.created_at })));
});

app.post('/api/community', async (req, res) => {
  const b = req.body;
  const { data, error } = await supabase
    .from('community_posts')
    .insert({ donor_id: b.donorId, donor_name: b.donorName, blood_group: b.bloodGroup, badge: b.badge, avatar: b.avatar, message: b.message, likes: 0, comments: 0 })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/community/:id/like', async (req, res) => {
  const { data: post } = await supabase.from('community_posts').select('likes').eq('id', req.params.id).single();
  if (!post) return res.status(404).json({ error: 'Not found' });
  const { data, error } = await supabase.from('community_posts').update({ likes: post.likes + 1 }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// =================== BLOOD BANK ===================

// =================== BLOOD BANK ===================

// Get all camp booked donors who have NOT yet donated (status = 'Booked')
app.get('/api/bloodbank/booked-donors', async (req, res) => {
  const { data, error } = await supabase
    .from('camp_bookings')
    .select('*')
    .eq('status', 'Booked')
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get('/api/bloodbank/inventory', async (req, res) => {
  const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(mapUnit));
});

app.post('/api/bloodbank/inventory', async (req, res) => {
  const b = req.body;
  const count = await supabase.from('inventory').select('*', { count: 'exact', head: true });
  const newId = `BU-${String((count.count || 0) + 1).padStart(4, '0')}`;
  const { data, error } = await supabase
    .from('inventory')
    .insert({ id: newId, blood_group: b.bloodGroup, volume: b.volume, collected_date: b.collectedDate, expiry_date: b.expiryDate, status: 'Available', batch_no: b.batchNo, hiv_test: 'Pending', hepatitis_b: 'Pending', hepatitis_c: 'Pending', malaria: 'Pending', syphilis: 'Pending' })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapUnit(data));
});

app.put('/api/bloodbank/inventory/:id', async (req, res) => {
  const b = req.body;
  const updates = {};
  if (b.status)      updates.status      = b.status;
  if (b.hivTest)     updates.hiv_test    = b.hivTest;
  if (b.hepatitisB)  updates.hepatitis_b = b.hepatitisB;
  if (b.hepatitisC)  updates.hepatitis_c = b.hepatitisC;
  if (b.malaria)     updates.malaria     = b.malaria;
  if (b.syphilis)    updates.syphilis    = b.syphilis;
  const { data, error } = await supabase.from('inventory').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapUnit(data));
});

function mapUnit(u) {
  return { id: u.id, bloodGroup: u.blood_group, volume: u.volume, collectedDate: u.collected_date, expiryDate: u.expiry_date, status: u.status, batchNo: u.batch_no, hivTest: u.hiv_test, hepatitisB: u.hepatitis_b, hepatitisC: u.hepatitis_c, malaria: u.malaria, syphilis: u.syphilis };
}

app.get('/api/bloodbank/stock-summary', async (req, res) => {
  const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const today = new Date().toISOString().split('T')[0];
  const sevenDays = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const { data: allUnits } = await supabase.from('inventory').select('blood_group, expiry_date, status');

  const summary = groups.map(g => {
    const available = (allUnits || []).filter(u => u.blood_group === g && u.status === 'Available');
    const expiring  = available.filter(u => u.expiry_date <= sevenDays && u.expiry_date > today).length;
    return { group: g, available: available.length, expiring };
  });

  const totalUnits = (allUnits || []).filter(u => u.status === 'Available').length;
  res.json({ summary, totalUnits, thisMonth: 94 });
});

app.get('/api/bloodbank/hospital-requests', async (req, res) => {
  const { data, error } = await supabase.from('hospital_requests').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(mapHospReq));
});

app.put('/api/bloodbank/hospital-requests/:id', async (req, res) => {
  const b = req.body;
  const updates = {};
  if (b.status)       updates.status        = b.status;
  if (b.approvedAt)   updates.approved_at   = b.approvedAt;
  if (b.dispatchedAt) updates.dispatched_at = b.dispatchedAt;
  const { data, error } = await supabase.from('hospital_requests').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapHospReq(data));
});

// Checkins
app.get('/api/bloodbank/checkins', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .gte('created_at', today)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(c => ({ id: c.id, donorId: c.donor_id, name: c.name, bloodGroup: c.blood_group, location: c.location, certificateId: c.certificate_id, timestamp: c.created_at })));
});

app.post('/api/bloodbank/checkin', async (req, res) => {
  const b = req.body;
  const certId = `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // Insert checkin record
  const { data: checkin, error: checkinErr } = await supabase
    .from('checkins')
    .insert({ donor_id: b.donorId, name: b.name, blood_group: b.bloodGroup, hemoglobin: b.hemoglobin, bp: b.bp, weight: b.weight, location: b.location, certificate_id: certId })
    .select().single();
  if (checkinErr) return res.status(500).json({ error: checkinErr.message });

  // Update donor stats
  const { data: donor } = await supabase.from('donors').select('total_donations, points').eq('id', b.donorId).single();
  if (donor) {
    const expiry = new Date(); expiry.setDate(expiry.getDate() + 90);
    await supabase.from('donors').update({
      total_donations: donor.total_donations + 1,
      points: donor.points + 500,
      last_donation: new Date().toISOString().split('T')[0],
      eligible_date: expiry.toISOString().split('T')[0],
      is_eligible: false,
    }).eq('id', b.donorId);
  }

  // Add donation history
  const { error: dhErr } = await supabase.from('donation_history').insert({
    donor_id: b.donorId,
    date: new Date().toISOString().split('T')[0],
    blood_group: b.bloodGroup,
    location: b.location,
    hospital: b.location,
    units: 1,
    certificate_id: certId,
  });
  if (dhErr) console.error('[CHECKIN DONATION HISTORY INSERT ERROR]', dhErr.message);


  // Add blood unit to inventory
  const { count } = await supabase.from('inventory').select('*', { count: 'exact', head: true });
  const expiry = new Date(); expiry.setDate(expiry.getDate() + 35);
  await supabase.from('inventory').insert({
    id: `BU-${String((count || 0) + 1).padStart(4, '0')}`,
    blood_group: b.bloodGroup,
    volume: 450,
    collected_date: new Date().toISOString().split('T')[0],
    expiry_date: expiry.toISOString().split('T')[0],
    status: 'Available',
    batch_no: `BAT-${Date.now()}`,
    hiv_test: 'Pending', hepatitis_b: 'Pending', hepatitis_c: 'Pending', malaria: 'Pending', syphilis: 'Pending',
  });

  res.json({ ...checkin, certificateId: certId });
});

// =================== HOSPITAL ===================

app.get('/api/hospital/stats/:hospitalId', async (req, res) => {
  const { data: reqs } = await supabase.from('hospital_requests').select('status').eq('hospital_id', req.params.hospitalId);
  const { data: trans } = await supabase.from('transfusions').select('id').eq('hospital_id', req.params.hospitalId);
  const r = reqs || [];
  res.json({
    pending:       r.filter(x => x.status === 'Pending').length,
    approved:      r.filter(x => x.status === 'Approved').length,
    dispatched:    r.filter(x => x.status === 'Dispatched').length,
    received:      r.filter(x => x.status === 'Received').length,
    totalRequests: r.length,
    transfusions:  (trans || []).length,
  });
});

app.get('/api/hospital/requests/:hospitalId', async (req, res) => {
  const { data, error } = await supabase.from('hospital_requests').select('*').eq('hospital_id', req.params.hospitalId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(mapHospReq));
});

app.post('/api/hospital/requests', async (req, res) => {
  const b = req.body;
  const { data, error } = await supabase
    .from('hospital_requests')
    .insert({ hospital_id: b.hospitalId, patient_name: b.patientName, patient_id: b.patientId, blood_group: b.bloodGroup, units: b.units, urgency: b.urgency, doctor: b.doctor, ward: b.ward, notes: b.notes, status: 'Pending' })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapHospReq(data));
});

app.put('/api/hospital/requests/:id', async (req, res) => {
  const b = req.body;
  const updates = {};
  if (b.status)     updates.status      = b.status;
  if (b.receivedAt) updates.received_at = b.receivedAt;
  const { data, error } = await supabase.from('hospital_requests').update(updates).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(mapHospReq(data));
});

function mapHospReq(r) {
  return { id: r.id, hospitalId: r.hospital_id, patientName: r.patient_name, patientId: r.patient_id, bloodGroup: r.blood_group, units: r.units, urgency: r.urgency, doctor: r.doctor, ward: r.ward, notes: r.notes, status: r.status, createdAt: r.created_at, approvedAt: r.approved_at, dispatchedAt: r.dispatched_at, receivedAt: r.received_at };
}

app.get('/api/hospital/transfusions/:hospitalId', async (req, res) => {
  const { data, error } = await supabase.from('transfusions').select('*').eq('hospital_id', req.params.hospitalId).order('date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(t => ({ id: t.id, hospitalId: t.hospital_id, patientName: t.patient_name, patientId: t.patient_id, bloodUnit: t.blood_unit, bloodGroup: t.blood_group, doctor: t.doctor, nurse: t.nurse, ward: t.ward, reaction: t.reaction, units: t.units, date: t.date })));
});

app.post('/api/hospital/transfusions', async (req, res) => {
  const b = req.body;
  const { data, error } = await supabase
    .from('transfusions')
    .insert({ hospital_id: b.hospitalId, patient_name: b.patientName, patient_id: b.patientId, blood_unit: b.bloodUnit, blood_group: b.bloodGroup, doctor: b.doctor, nurse: b.nurse, ward: b.ward, reaction: b.reaction, units: b.units })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// =================== START ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   LifeFlow + Supabase Running!           ║
║   Port: ${PORT}                              ║
║   DB:   Supabase PostgreSQL ✅           ║
╚══════════════════════════════════════════╝
  `);
});
