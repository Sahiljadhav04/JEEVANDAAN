import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function ScheduleDonation() {
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);
  const [form, setForm] = useState({ campId: '', date: '', time: '09:00', reminder: 'sms' });
  const [submitted, setSubmitted] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    axios.get('/api/camps').then(r => setCamps(r.data.filter(c => c.status === 'Upcoming')));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBooking(true);
    const camp = camps.find(c => c.id === form.campId);
    if (camp) {
      await axios.post(`/api/camps/${camp.id}/book`).catch(() => {});
    }
    setTimeout(() => { setBooking(false); setSubmitted(true); }, 1000);
  };

  if (submitted) {
    const camp = camps.find(c => c.id === form.campId);
    return (
      <div className="page-container fade-in">
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'heartbeat 2s ease-in-out infinite' }}>🩸</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '32px', fontWeight: 800, color: '#F4F4F8', marginBottom: '12px' }}>Appointment Confirmed!</h1>
          <p style={{ fontSize: '16px', color: '#9999BB', marginBottom: '28px' }}>Your blood donation slot has been successfully booked. You'll receive a reminder via {form.reminder === 'sms' ? 'SMS' : 'WhatsApp'}.</p>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(0,208,132,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'grid', gap: '10px', fontSize: '14px', color: '#9999BB', lineHeight: 2 }}>
              <div>🏕️ Camp: <strong style={{ color: '#F4F4F8' }}>{camp?.name || 'Selected Camp'}</strong></div>
              <div>📍 Location: <strong style={{ color: '#F4F4F8' }}>{camp?.location}</strong></div>
              <div>📅 Date: <strong style={{ color: '#F4F4F8' }}>{camp?.date || form.date}</strong></div>
              <div>⏰ Time: <strong style={{ color: '#F4F4F8' }}>{form.time}</strong></div>
              <div>🔔 Reminder: <strong style={{ color: '#F4F4F8' }}>{form.reminder === 'sms' ? 'SMS' : 'WhatsApp'}</strong></div>
            </div>
          </div>
          <div className="alert alert-success">✅ Remember: Eat a good meal, stay hydrated, and wear loose clothing on donation day.</div>
          <button className="btn btn-primary mt-16" onClick={() => setSubmitted(false)}>Book Another Slot</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">📅 Schedule Donation</div>
          <div className="section-subtitle">Book your next blood donation appointment</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-header"><div className="card-title">📋 Appointment Details</div></div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Donation Camp</label>
                <select className="form-select" value={form.campId} onChange={e => setForm({ ...form, campId: e.target.value })} required>
                  <option value="">-- Select a Camp --</option>
                  {camps.map(c => (
                    <option key={c.id} value={c.id}>{c.name} · {c.date} · {c.city}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Preferred Date</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Time</label>
                  <select className="form-select" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reminder Preference</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['sms', 'whatsapp', 'email'].map(r => (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: form.reminder === r ? 'rgba(200,16,46,0.15)' : 'var(--bg-elevated)', border: `1px solid ${form.reminder === r ? 'rgba(200,16,46,0.4)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: form.reminder === r ? '#FF4D6D' : '#9999BB' }}>
                      <input type="radio" name="reminder" value={r} checked={form.reminder === r} onChange={() => setForm({ ...form, reminder: r })} style={{ display: 'none' }} />
                      {r === 'sms' ? '📱 SMS' : r === 'whatsapp' ? '💬 WhatsApp' : '📧 Email'}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={booking || !form.campId}>
                {booking ? '⏳ Booking...' : '✅ Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <div className="card-header"><div className="card-title">⛺ Available Camps</div></div>
            {camps.map(c => (
              <div key={c.id} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', border: form.campId === c.id ? '1px solid rgba(200,16,46,0.4)' : '1px solid transparent' }} onClick={() => setForm({ ...form, campId: c.id })}>
                <div style={{ fontWeight: 600, color: '#F4F4F8', marginBottom: '4px' }}>{c.name}</div>
                <div style={{ fontSize: '12px', color: '#9999BB', lineHeight: 1.8 }}>
                  <div>📅 {c.date} · 📍 {c.city}</div>
                  <div>👥 {c.slots - c.bookedSlots} slots remaining</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'rgba(200,16,46,0.06)', borderColor: 'rgba(200,16,46,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#FF4D6D', marginBottom: '12px' }}>📌 Before You Donate</div>
            {['Eat a nutritious meal 2 hours before', 'Drink plenty of water (at least 500ml extra)', 'Get a good night\'s sleep', 'Avoid fatty foods, alcohol for 24 hrs', 'Bring a valid photo ID proof', 'Wear loose, comfortable clothing'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#9999BB', padding: '5px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ color: '#00D084' }}>✓</span> {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
