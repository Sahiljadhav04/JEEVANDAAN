require('dotenv').config();
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

async function test() {
  // Test 1: Geocode donor address
  console.log('\n=== TEST 1: NOMINATIM GEOCODING ===');
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&q=Connaught+Place+New+Delhi&limit=1';
    const r = await fetch(url, { headers: { 'User-Agent': 'JeevanDaan/1.0 (jeevandaan674@gmail.com)' } });
    const d = await r.json();
    if (d && d.length > 0) {
      console.log('✅ Geocode OK: lat=' + d[0].lat + ' lng=' + d[0].lon);
    } else {
      console.log('❌ No geocode result returned');
    }
  } catch(e) {
    console.log('❌ Geocode Error:', e.message);
  }

  // Test 2: SMTP Verify
  console.log('\n=== TEST 2: SMTP CONNECTION ===');
  const t = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD }
  });
  try {
    await t.verify();
    console.log('✅ SMTP Connected! User:', process.env.SMTP_EMAIL);
  } catch(e) {
    console.log('❌ SMTP Error:', e.message);
    console.log('   → If this says "Invalid login", you need a Gmail App Password (not your regular password)');
    console.log('   → Go to: myaccount.google.com/apppasswords to generate one');
    return;
  }

  // Test 3: Send actual test email
  console.log('\n=== TEST 3: SEND TEST EMAIL ===');
  try {
    const info = await t.sendMail({
      from: '"JeevanDaan Emergency 🩸" <' + process.env.SMTP_EMAIL + '>',
      to: process.env.SMTP_EMAIL,
      subject: '🧪 JeevanDaan SMTP Test',
      html: '<h2>SMTP Test Successful!</h2><p>Emergency email alerts are working.</p>'
    });
    console.log('✅ Email sent! ID:', info.messageId);
  } catch(e) {
    console.log('❌ Send Error:', e.message);
  }
}

test().catch(console.error);
