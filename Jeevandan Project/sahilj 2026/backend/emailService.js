/**
 * JeevanDaan — Email Service (SMTP via Nodemailer)
 * Sends emergency blood request emails to nearby donors
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

// ────────────────────────────────────────────────────────────
// Haversine formula — distance in KM between two coordinates
// ────────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ────────────────────────────────────────────────────────────
// SMTP Transporter (Gmail)
// Always create fresh — reads latest creds from process.env
// ────────────────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// ────────────────────────────────────────────────────────────
// Build the HTML email body
// ────────────────────────────────────────────────────────────
function buildEmailHtml({ donorName, bloodGroup, patientName, hospital, units, urgency, contact, description, distanceKm, emergencyId }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Emergency Blood Request — JeevanDaan</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#C8102E,#8B0000);padding:32px 28px 24px;text-align:center;">
      <div style="font-size:42px;margin-bottom:8px;">🚨</div>
      <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px;">
        Jeevan<span style="color:#FAF9F6;">Daan</span>
      </div>
      <div style="font-size:14px;color:rgba(255,255,255,0.85);margin-top:4px;">Emergency Blood Alert — Immediate Response Required</div>
    </div>

    <!-- Urgency Banner -->
    <div style="background:${urgency === 'Critical' ? '#FF0000' : urgency === 'Emergency' ? '#FF6600' : '#FF9900'};padding:10px 28px;text-align:center;">
      <span style="color:#fff;font-weight:800;font-size:15px;letter-spacing:1px;">⚡ ${urgency.toUpperCase()} PRIORITY</span>
    </div>

    <!-- Greeting -->
    <div style="padding:28px 28px 0;">
      <p style="margin:0 0 6px;font-size:17px;font-weight:700;color:#1a1a1a;">Dear ${donorName},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;">
        A hospital near you (<strong>${(distanceKm).toFixed(1)} km away</strong>) urgently needs <strong style="color:#C8102E;">${bloodGroup}</strong> blood. 
        You are registered as a <strong>${bloodGroup}</strong> donor and can help save a life today.
      </p>
    </div>

    <!-- Details Card -->
    <div style="margin:0 28px 24px;background:#FFF5F5;border:2px solid #C8102E;border-radius:12px;padding:20px;">
      <div style="font-size:13px;font-weight:800;color:#C8102E;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">🩸 Emergency Request Details</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:7px 0;color:#666;width:40%;">🏥 Hospital</td>
          <td style="padding:7px 0;color:#1a1a1a;font-weight:700;">${hospital}</td>
        </tr>
        <tr style="border-top:1px solid #FFD5D5;">
          <td style="padding:7px 0;color:#666;">👤 Patient Name</td>
          <td style="padding:7px 0;color:#1a1a1a;font-weight:700;">${patientName}</td>
        </tr>
        <tr style="border-top:1px solid #FFD5D5;">
          <td style="padding:7px 0;color:#666;">🩸 Blood Group</td>
          <td style="padding:7px 0;">
            <span style="display:inline-block;background:#C8102E;color:#fff;font-weight:900;font-size:15px;padding:3px 12px;border-radius:6px;">${bloodGroup}</span>
          </td>
        </tr>
        <tr style="border-top:1px solid #FFD5D5;">
          <td style="padding:7px 0;color:#666;">📦 Units Needed</td>
          <td style="padding:7px 0;color:#1a1a1a;font-weight:700;">${units} bag(s) (450ml each)</td>
        </tr>
        <tr style="border-top:1px solid #FFD5D5;">
          <td style="padding:7px 0;color:#666;">📍 Your Distance</td>
          <td style="padding:7px 0;color:#C8102E;font-weight:700;">${(distanceKm).toFixed(1)} km from hospital</td>
        </tr>
        ${description ? `<tr style="border-top:1px solid #FFD5D5;">
          <td style="padding:7px 0;color:#666;">📋 Details</td>
          <td style="padding:7px 0;color:#444;">${description}</td>
        </tr>` : ''}
      </table>
    </div>

    <!-- Call to Action -->
    <div style="padding:0 28px 24px;text-align:center;">
      <p style="margin:0 0 16px;font-size:14px;color:#555;">
        📞 Call the hospital coordination number immediately to confirm your visit:
      </p>
      <a href="tel:${contact}" style="display:inline-block;background:linear-gradient(135deg,#C8102E,#8B0000);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:800;letter-spacing:0.5px;margin-bottom:12px;">
        📞 Call ${contact}
      </a>
      <br/>
      <a href="http://localhost:3000/donor/emergency" style="display:inline-block;margin-top:10px;background:#fff;color:#C8102E;border:2px solid #C8102E;text-decoration:none;padding:11px 28px;border-radius:10px;font-size:14px;font-weight:700;">
        🩸 View on JeevanDaan App
      </a>
    </div>

    <!-- Important Note -->
    <div style="margin:0 28px 24px;background:#FFF8E1;border-left:4px solid #FFA000;border-radius:0 8px 8px 0;padding:14px 16px;">
      <div style="font-size:13px;color:#555;line-height:1.6;">
        ⚠️ <strong>Before you go:</strong> Eat a light meal, drink water, and carry a government-issued ID. 
        You must be feeling well and not have donated blood in the past 3 months.
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F8F8F8;border-top:1px solid #EEE;padding:20px 28px;text-align:center;">
      <div style="font-size:13px;font-weight:700;color:#C8102E;margin-bottom:4px;">JeevanDaan — Donate Blood, Save Lives</div>
      <div style="font-size:11px;color:#999;">This alert was sent because you are a registered donor within ${process.env.EMAIL_RANGE_KM || 20} km of the requesting hospital.</div>
      <div style="font-size:11px;color:#bbb;margin-top:6px;">Emergency ID: ${emergencyId}</div>
    </div>

  </div>
</body>
</html>`;
}

// ────────────────────────────────────────────────────────────
// Geocode address → lat/lng using Nominatim (free, no API key)
// ────────────────────────────────────────────────────────────
const geocodeCache = {};
async function geocodeAddress(address) {
  if (!address) return null;
  if (geocodeCache[address]) return geocodeCache[address];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'JeevanDaan/1.0 (jeevandaan674@gmail.com)' } });
    const data = await resp.json();
    if (data && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[address] = coords;
      return coords;
    }
  } catch (e) {
    console.warn('[GEOCODE ERROR]', address, e.message);
  }
  return null;
}

// ────────────────────────────────────────────────────────────
// Main export: sendEmergencyEmails
// Filters donors by distance and blood group, sends emails
// ────────────────────────────────────────────────────────────
async function sendEmergencyEmails({ emergency, donors, users, rangeKm = 20 }) {
  const {
    id: emergencyId,
    blood_group: bloodGroup,
    patient_name: patientName,
    hospital,
    units,
    urgency,
    contact,
    description,
    lat: hospLat,
    lng: hospLng,
  } = emergency;

  // If hospital has no GPS coords, skip distance filtering (email all matching-group donors)
  const hasHospitalCoords = hospLat != null && hospLng != null;

  const results = { sent: [], skipped: [], errors: [] };
  const mailer = getTransporter();

  // Build a map of donorId → email from users table
  const donorEmailMap = {};
  (users || []).forEach(u => {
    if (u.donor_id) donorEmailMap[u.donor_id] = u.email;
  });

  for (const donor of donors || []) {
    const donorEmail = donor.email || donorEmailMap[donor.id];
    if (!donorEmail) {
      results.skipped.push({ id: donor.id, name: donor.name, reason: 'No email' });
      continue;
    }

    // Distance check — use stored coordinates OR geocode the address
    let distanceKm = 0;
    let donorLat = donor.lat;
    let donorLng = donor.lng;

    // Auto-geocode address if no stored coordinates
    if (hasHospitalCoords && (donorLat == null || donorLng == null) && donor.address) {
      const coords = await geocodeAddress(donor.address);
      if (coords) { donorLat = coords.lat; donorLng = coords.lng; }
    }

    if (hasHospitalCoords && donorLat != null && donorLng != null) {
      distanceKm = haversineKm(hospLat, hospLng, donorLat, donorLng);
      if (distanceKm > rangeKm) {
        results.skipped.push({ id: donor.id, name: donor.name, reason: `${distanceKm.toFixed(1)} km > ${rangeKm} km range` });
        continue;
      }
    } else if (hasHospitalCoords && donor.lat == null) {
      // Donor has no coordinates — still send the email (proximity unknown)
      distanceKm = 0;
    }

    const html = buildEmailHtml({
      donorName: donor.name,
      bloodGroup,
      patientName,
      hospital,
      units,
      urgency,
      contact,
      description,
      distanceKm,
      emergencyId,
    });

    try {
      const info = await mailer.sendMail({
        from: `"JeevanDaan Emergency Alert 🩸" <${process.env.SMTP_EMAIL}>`,
        to: donorEmail,
        subject: `🚨 URGENT: ${bloodGroup} Blood Needed at ${hospital} — ${urgency} Priority`,
        html,
      });
      console.log(`📧 [EMAIL SENT] ${donor.name} <${donorEmail}> — ${info.messageId} — ${distanceKm.toFixed(1)} km`);
      results.sent.push({ name: donor.name, email: donorEmail, distanceKm: +distanceKm.toFixed(1), messageId: info.messageId });
    } catch (err) {
      console.error(`❌ [EMAIL ERROR] ${donor.name} <${donorEmail}>:`, err.message);
      results.errors.push({ name: donor.name, email: donorEmail, error: err.message });
    }
  }

  return results;
}

module.exports = { sendEmergencyEmails, haversineKm };
