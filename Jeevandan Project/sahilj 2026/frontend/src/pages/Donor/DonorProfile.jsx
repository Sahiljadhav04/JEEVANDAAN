import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LocationPicker from '../../components/LocationPicker';


export default function DonorProfile() {
  const { user } = useAuth();
  const [donor, setDonor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.donorId) {
      axios.get(`/api/donor/${user.donorId}`).then(r => { setDonor(r.data); setForm(r.data); });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await axios.put(`/api/donor/${user.donorId}`, form);
      setDonor(r.data); setEditing(false); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (!donor) return <div className="loading-spinner"><div className="spinner" /><span>Loading profile...</span></div>;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">👤 My Profile</div>
          <div className="section-subtitle">Manage your donor information</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {editing ? (
            <>
              <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm(donor); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save Changes'}</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
          )}
        </div>
      </div>

      {saved && <div className="alert alert-success">✅ Profile updated successfully!</div>}

      <div className="grid-2">
        {/* Profile Card */}
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #C8102E, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 700, color: 'white', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(200,16,46,0.4)' }}>
              {donor.name?.[0]}
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{donor.name}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="blood-badge-sm">{donor.bloodGroup}</span>
              <span className="badge badge-purple">🏅 {donor.badge}</span>
              {donor.isEligible && <span className="badge badge-green">✅ Eligible</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Donations', value: donor.totalDonations, icon: '🩸' },
              { label: 'Lives Saved', value: donor.totalDonations * 3, icon: '❤️' },
              { label: 'Points', value: donor.points?.toLocaleString(), icon: '⭐' },
              { label: 'Age', value: `${donor.age} yrs`, icon: '👤' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{item.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div className="divider" />
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 2 }}>
            <div>📅 Last Donation: <strong style={{ color: 'var(--text-primary)' }}>{donor.lastDonation || 'N/A'}</strong></div>
            <div>📅 Next Eligible: <strong style={{ color: '#059669' }}>{donor.eligibleDate || 'N/A'}</strong></div>
            <div>📞 Contact: <strong style={{ color: 'var(--text-primary)' }}>{donor.contact}</strong></div>
            <div>📍 Address: <strong style={{ color: 'var(--text-primary)' }}>{donor.address}</strong></div>
          </div>
        </div>

        {/* Edit Form */}
        <div>
          <div className="card mb-16">
            <div className="card-header"><div className="card-title">📋 Personal Information</div></div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} disabled={!editing} />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" className="form-input" value={form.age || ''} onChange={e => setForm({ ...form, age: e.target.value })} disabled={!editing} />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-select" value={form.bloodGroup || ''} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} disabled={!editing}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" className="form-input" value={form.weight || ''} onChange={e => setForm({ ...form, weight: e.target.value })} disabled={!editing} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">📞 Contact & Medical</div></div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.contact || ''} onChange={e => setForm({ ...form, contact: e.target.value })} disabled={!editing} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!editing} />
            </div>
            {editing ? (
              <LocationPicker
                location={form.address || ''}
                lat={form.lat}
                lng={form.lng}
                label="My Location & Address"
                onChange={(locData) => {
                  setForm({
                    ...form,
                    address: locData.location,
                    lat: locData.lat,
                    lng: locData.lng
                  });
                }}
              />
            ) : (
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address || ''} disabled />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Medical History</label>
              <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={form.medicalHistory || ''} onChange={e => setForm({ ...form, medicalHistory: e.target.value })} disabled={!editing} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
