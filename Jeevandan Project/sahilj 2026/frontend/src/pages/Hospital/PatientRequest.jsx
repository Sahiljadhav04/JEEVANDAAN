import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function PatientRequest() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    patientName: '', patientId: '', bloodGroup: 'A+', units: 1,
    urgency: 'Routine', doctor: '', ward: '', notes: '', hospitalId: user?.hospitalId || 'h001'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await axios.post('/api/hospital/requests', { ...form, units: Number(form.units) });
      setSubmitted(r.data);
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="page-container fade-in">
        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 800, color: '#F4F4F8', marginBottom: '12px' }}>Request Submitted!</h1>
          <p style={{ fontSize: '15px', color: '#9999BB', marginBottom: '24px' }}>Your blood request has been sent to the blood bank and is awaiting approval.</p>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(0,105,92,0.3)', borderRadius: '14px', padding: '20px', textAlign: 'left', marginBottom: '20px', fontSize: '14px', color: '#9999BB', lineHeight: 2.2 }}>
            <div>🏷️ Request ID: <strong style={{ color: '#4DB6AC', fontFamily: 'monospace' }}>{submitted.id}</strong></div>
            <div>👤 Patient: <strong style={{ color: '#F4F4F8' }}>{submitted.patientName}</strong></div>
            <div>🩸 Blood Group: <strong style={{ color: '#FF4D6D' }}>{submitted.bloodGroup}</strong></div>
            <div>📦 Units: <strong style={{ color: '#F4F4F8' }}>{submitted.units}</strong></div>
            <div>🚨 Urgency: <strong style={{ color: '#F4F4F8' }}>{submitted.urgency}</strong></div>
            <div>⏰ Submitted: <strong style={{ color: '#F4F4F8' }}>{new Date(submitted.createdAt).toLocaleString('en-IN')}</strong></div>
          </div>
          <div className="alert alert-info">ℹ️ The blood bank will review and approve your request. You can track the status in Request Tracker.</div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
            <a href="/hospital/tracker" className="btn btn-hospital">📡 Track Request</a>
            <button className="btn btn-secondary" onClick={() => { setSubmitted(null); setForm({ ...form, patientName: '', patientId: '', notes: '' }); }}>➕ New Request</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🩸 Patient Blood Request</div>
          <div className="section-subtitle">Raise a requisition for patient blood supply</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">📋 Request Form</div></div>
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Patient Name *</label>
                <input className="form-input hospital-focus" placeholder="Full name" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Patient ID / IPD No. *</label>
                <input className="form-input hospital-focus" placeholder="PAT-001" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Blood Group Required *</label>
                <select className="form-select" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units Required *</label>
                <input type="number" min="1" max="20" className="form-input hospital-focus" value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Urgency Level *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {['Routine', 'Moderate', 'Emergency', 'Critical'].map(u => (
                  <label key={u} style={{ padding: '10px', border: `1px solid ${form.urgency === u ? 'rgba(38,166,154,0.5)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: form.urgency === u ? 'rgba(0,105,92,0.2)' : 'var(--bg-elevated)', color: form.urgency === u ? '#4DB6AC' : '#9999BB', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' }}>
                    <input type="radio" style={{ display: 'none' }} checked={form.urgency === u} onChange={() => setForm({ ...form, urgency: u })} />
                    {u === 'Critical' ? '🔴' : u === 'Emergency' ? '🟠' : u === 'Moderate' ? '🟡' : '🟢'} {u}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Attending Doctor *</label>
                <input className="form-input hospital-focus" placeholder="Dr. Name" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Ward / Department *</label>
                <select className="form-select" value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} required>
                  <option value="">Select Ward</option>
                  {['ICU', 'Surgery', 'Oncology', 'Maternity', 'Emergency', 'General', 'Pediatrics', 'Cardiac'].map(w => <option key={w}>{w}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Clinical Notes</label>
              <textarea className="form-input hospital-focus" style={{ minHeight: '80px', resize: 'vertical' }} placeholder="Reason for transfusion, patient condition..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-hospital" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
              {submitting ? '⏳ Submitting...' : '📤 Submit Blood Request'}
            </button>
          </form>
        </div>

        <div>
          <div className="card mb-16" style={{ background: 'rgba(0,105,92,0.08)', borderColor: 'rgba(38,166,154,0.2)' }}>
            <div style={{ fontWeight: 700, color: '#4DB6AC', marginBottom: '12px', fontSize: '15px' }}>📌 Request Guidelines</div>
            {[
              'Fill in all mandatory fields marked with *',
              'For Critical/Emergency requests, immediately notify the blood bank by phone',
              'Ensure patient\'s blood type has been confirmed by lab',
              'Cross-match report to be submitted before transfusion',
              'Specify exact units — over-ordering leads to wastage',
              'Request can take 1-4 hours for routine, 30 min for emergencies',
            ].map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#9999BB', padding: '5px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ color: '#00D084', flexShrink: 0 }}>✓</span> {g}
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, color: '#F4F4F8', marginBottom: '12px', fontSize: '15px' }}>📞 Emergency Contacts</div>
            {[
              { label: 'LifeFlow Blood Bank', number: '1800-123-4567', type: 'Toll-Free' },
              { label: 'AIIMS Blood Bank', number: '011-26588500', type: '24×7 Emergency' },
              { label: 'National Blood Helpline', number: '104', type: 'Govt. Helpline' },
            ].map(c => (
              <div key={c.label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#F4F4F8', fontSize: '13px' }}>{c.label}</div>
                  <div style={{ fontSize: '11px', color: '#666688' }}>{c.type}</div>
                </div>
                <a href={`tel:${c.number}`} className="badge badge-green" style={{ cursor: 'pointer' }}>📞 {c.number}</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
