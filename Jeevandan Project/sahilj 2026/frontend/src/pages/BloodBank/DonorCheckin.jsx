import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DonorCheckin() {
  const [tab, setTab] = useState('booked');   // 'booked' = camp donors, 'walkin' = new walk-in
  const [step, setStep] = useState(1);        // 1: select, 2: health check, 3: complete
  const [checking, setChecking] = useState(false);
  const [cert, setCert] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loadedCheckins, setLoadedCheckins] = useState(false);

  // --- Booked donors (from camp_bookings) ---
  const [bookedDonors, setBookedDonors] = useState([]);
  const [loadingBooked, setLoadingBooked] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // --- Walk-in donors (from donors table) ---
  const [walkinDonors, setWalkinDonors] = useState([]);
  const [loadingWalkin, setLoadingWalkin] = useState(true);
  const [selectedWalkinId, setSelectedWalkinId] = useState('');

  // Health form
  const [health, setHealth] = useState({ hemoglobin: '', bp: '', weight: '', location: 'LifeFlow Blood Bank' });

  // Load booked donors who haven't donated yet
  useEffect(() => {
    axios.get('/api/bloodbank/booked-donors')
      .then(r => { setBookedDonors(r.data || []); setLoadingBooked(false); })
      .catch(() => setLoadingBooked(false));
  }, []);

  // Load all eligible walk-in donors
  useEffect(() => {
    axios.get('/api/donors')
      .then(r => { setWalkinDonors((r.data || []).filter(d => d.isEligible !== false)); setLoadingWalkin(false); })
      .catch(() => setLoadingWalkin(false));
  }, []);

  const loadCheckins = () =>
    axios.get('/api/bloodbank/checkins').then(r => { setCheckins(r.data); setLoadedCheckins(true); });

  const healthOk = parseFloat(health.hemoglobin) >= 12.5 && health.bp && parseFloat(health.weight) >= 45;

  // Determine which donor is currently selected
  const activeDonor = tab === 'booked'
    ? selectedBooking
      ? { name: selectedBooking.donor_name, bloodGroup: selectedBooking.blood_group, donorId: selectedBooking.donor_id }
      : null
    : walkinDonors.find(d => d.id === selectedWalkinId) || null;

  const completeDonation = async () => {
    if (!activeDonor) return;
    setChecking(true);
    try {
      if (tab === 'booked' && selectedBooking) {
        // Approve through camp booking endpoint (records donation history, cert, notification)
        const r = await axios.post(`/api/camp-bookings/${selectedBooking.id}/approve-donation`);
        setCert({ ...r.data, type: 'camp' });
        // Refresh booked donors list
        setBookedDonors(prev => prev.filter(b => b.id !== selectedBooking.id));
        setSelectedBooking(null);
      } else {
        // Regular walk-in checkin
        const r = await axios.post('/api/bloodbank/checkin', {
          donorId: activeDonor.id,
          name: activeDonor.name,
          bloodGroup: activeDonor.bloodGroup,
          hemoglobin: health.hemoglobin,
          bp: health.bp,
          weight: health.weight,
          location: health.location,
        });
        setCert({ ...r.data, donorName: activeDonor.name, bloodGroup: activeDonor.bloodGroup, type: 'walkin' });
      }
      setStep(3);
      setHealth({ hemoglobin: '', bp: '', weight: '', location: 'LifeFlow Blood Bank' });
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally { setChecking(false); }
  };

  const resetFlow = () => { setStep(1); setCert(null); };

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">✅ Donor Check-in & Collection</div>
          <div className="section-subtitle">Verify donor health and record blood donation</div>
        </div>
        <button className="btn btn-secondary" onClick={loadCheckins}>
          {loadedCheckins ? '🔄 Refresh' : "📋 View Today's Checkins"}
        </button>
      </div>

      {/* Step Progress */}
      <div className="pipeline mb-24">
        {['Select Donor', 'Health Check', 'Donation Complete'].map((label, i) => (
          <div key={label} className="pipeline-step">
            <div className={`pipeline-dot ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <div className={`pipeline-label ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── STEP 1: SELECT DONOR ── */}
      {step === 1 && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><div className="card-title">👤 Select Donor</div></div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                className={`btn btn-sm ${tab === 'booked' ? 'btn-bank' : 'btn-secondary'}`}
                onClick={() => { setTab('booked'); setStep(1); }}
              >
                📅 Camp Booked Donors ({bookedDonors.length})
              </button>
              <button
                className={`btn btn-sm ${tab === 'walkin' ? 'btn-bank' : 'btn-secondary'}`}
                onClick={() => { setTab('walkin'); setStep(1); }}
              >
                🚶 Walk-in Donor
              </button>
            </div>

            {/* CAMP BOOKED DONORS */}
            {tab === 'booked' && (
              loadingBooked ? (
                <div className="loading-spinner" style={{ padding: '20px' }}><div className="spinner" /><span>Loading booked donors...</span></div>
              ) : bookedDonors.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <div className="empty-state-icon">📅</div>
                  <div className="empty-state-title">No booked donors pending</div>
                  <div className="empty-state-desc">All camp donors have been checked in, or no slots have been booked yet.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bookedDonors.map(b => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        background: selectedBooking?.id === b.id ? 'rgba(200,16,46,0.12)' : 'var(--bg-elevated)',
                        border: selectedBooking?.id === b.id ? '1px solid var(--blood-red)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{b.donor_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>⛺ {b.camp_name} · 📅 {b.camp_date}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>📍 {b.camp_location}</div>
                      </div>
                      <span className="blood-badge-sm">{b.blood_group}</span>
                    </div>
                  ))}
                  <button
                    className="btn btn-bank"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                    disabled={!selectedBooking}
                    onClick={() => setStep(2)}
                  >
                    Next: Health Check →
                  </button>
                </div>
              )
            )}

            {/* WALK-IN DONOR */}
            {tab === 'walkin' && (
              loadingWalkin ? (
                <div className="loading-spinner" style={{ padding: '20px' }}><div className="spinner" /><span>Loading donors...</span></div>
              ) : (
                <div>
                  <div className="form-group">
                    <label className="form-label">Select Registered Donor</label>
                    {walkinDonors.length === 0 ? (
                      <div style={{ color: 'var(--danger)', fontSize: '13px' }}>No eligible walk-in donors found</div>
                    ) : (
                      <select className="form-select" value={selectedWalkinId} onChange={e => setSelectedWalkinId(e.target.value)}>
                        <option value="">— Select a donor —</option>
                        {walkinDonors.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.bloodGroup}) · {d.badge || 'Donor'}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {selectedWalkinId && (
                    <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: '10px', marginBottom: '16px' }}>
                      {(() => { const d = walkinDonors.find(x => x.id === selectedWalkinId); return d ? (
                        <>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{d.name}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 2 }}>
                            <div>Blood Group: <strong style={{ color: 'var(--blood-red)' }}>{d.bloodGroup}</strong></div>
                            <div>Badge: {d.badge || '—'} · Points: {d.points || 0}</div>
                            <div>Last Donation: {d.lastDonation || 'Never'}</div>
                          </div>
                        </>
                      ) : null; })()}
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Collection Location</label>
                    <input className="form-input bank-focus" value={health.location} onChange={e => setHealth({ ...health, location: e.target.value })} />
                  </div>
                  <button
                    className="btn btn-bank"
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={!selectedWalkinId}
                    onClick={() => setStep(2)}
                  >
                    Next: Health Check →
                  </button>
                </div>
              )
            )}
          </div>

          {/* Pre-donation checklist */}
          <div className="card">
            <div className="card-header"><div className="card-title">🩺 Pre-Donation Checklist</div></div>
            {['Donor has eaten in last 4 hours', 'Donor has proper ID proof', 'Donor age 18–65 years', 'Weight ≥ 45 kg confirmed', 'No fever/illness currently', 'Not donated in last 90 days'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--border-color)' : 'none', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#00D084', fontWeight: 700 }}>✓</span> {item}
              </div>
            ))}
            {activeDonor && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,208,132,0.08)', borderRadius: '8px', border: '1px solid rgba(0,208,132,0.2)' }}>
                <div style={{ fontSize: '13px', color: '#00D084', fontWeight: 600 }}>Selected Donor</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{activeDonor.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Blood Group: <strong style={{ color: 'var(--blood-red)' }}>{activeDonor.bloodGroup}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: HEALTH CHECK ── */}
      {step === 2 && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <div className="card-title">🩺 Health Parameters for <span style={{ color: 'var(--blood-red)' }}>{activeDonor?.name}</span></div>
            </div>
            <div className="form-group">
              <label className="form-label">Hemoglobin Level (g/dL) — Minimum: 12.5</label>
              <input type="number" step="0.1" className="form-input bank-focus" placeholder="e.g. 13.5"
                value={health.hemoglobin} onChange={e => setHealth({ ...health, hemoglobin: e.target.value })} />
              {health.hemoglobin && parseFloat(health.hemoglobin) < 12.5 && (
                <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>⚠️ Below minimum — donor not eligible</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Blood Pressure (e.g. 120/80)</label>
              <input className="form-input bank-focus" placeholder="120/80"
                value={health.bp} onChange={e => setHealth({ ...health, bp: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input type="number" className="form-input bank-focus" placeholder="e.g. 70"
                value={health.weight} onChange={e => setHealth({ ...health, weight: e.target.value })} />
            </div>
            {tab === 'walkin' && (
              <div className="form-group">
                <label className="form-label">Collection Location</label>
                <input className="form-input bank-focus" value={health.location}
                  onChange={e => setHealth({ ...health, location: e.target.value })} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-bank" style={{ flex: 1, justifyContent: 'center' }}
                onClick={completeDonation} disabled={checking || !healthOk}>
                {checking ? '⏳ Recording...' : !healthOk ? '⚠️ Fill Valid Values' : '✅ Approve & Complete Donation'}
              </button>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(0,208,132,0.06)', borderColor: 'rgba(0,208,132,0.2)' }}>
            <div className="card-header"><div className="card-title" style={{ color: '#00D084' }}>📊 Reference Ranges</div></div>
            {[
              { param: 'Hemoglobin', range: '≥ 12.5 g/dL (Women), ≥ 13.0 (Men)', ok: parseFloat(health.hemoglobin) >= 12.5 },
              { param: 'Blood Pressure', range: 'Systolic 100–180 mmHg, Diastolic 50–100', ok: !!health.bp },
              { param: 'Pulse Rate', range: '60–100 beats/min', ok: true },
              { param: 'Temperature', range: '≤ 37.5°C', ok: true },
              { param: 'Weight', range: '≥ 45 kg', ok: parseFloat(health.weight) >= 45 },
            ].map(item => (
              <div key={item.param} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.param}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{item.range}</div>
                </div>
                <span style={{ fontSize: '18px' }}>{item.ok ? '✅' : '⏳'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: DONATION COMPLETE ── */}
      {step === 3 && cert && (
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div className="certificate">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🩸</div>
            <div className="cert-subtitle">Donation Recorded Successfully</div>
            <div className="cert-title">JeevanDaan Foundation</div>
            <div style={{ height: '1px', background: 'rgba(200,16,46,0.4)', margin: '16px 0' }} />
            <div className="cert-body">This is to certify that</div>
            <div className="cert-name" style={{ fontSize: '26px', color: 'var(--blood-red)', fontWeight: 800, margin: '10px 0' }}>
              {cert.donorName || activeDonor?.name}
            </div>
            <div className="cert-body">
              has generously donated <strong style={{ color: 'var(--text-primary)' }}>1 Unit</strong> of{' '}
              <strong style={{ color: 'var(--blood-red)' }}>{cert.bloodGroup}</strong> blood
            </div>
            <div style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 2 }}>
              {cert.type === 'camp' && <div>⛺ Camp: {cert.campName}</div>}
              {cert.type === 'camp' && <div>📍 {cert.campLocation}</div>}
              <div>📅 Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div>🆔 Certificate ID: <strong style={{ color: 'var(--text-primary)' }}>{cert.certificateId}</strong></div>
              <div style={{ color: '#00D084' }}>🏆 +500 Points Awarded</div>
            </div>
            <div className="cert-seal">🏅</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
            <button className="btn btn-bank" onClick={resetFlow}>✅ Next Donor</button>
            <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Print Certificate</button>
          </div>
        </div>
      )}

      {/* ── TODAY'S CHECKINS TABLE ── */}
      {loadedCheckins && (
        <div className="card mt-24">
          <div className="card-header"><div className="card-title">📋 Today's Check-ins ({checkins.length})</div></div>
          {checkins.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}><div className="empty-state-title">No check-ins yet today</div></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Donor</th><th>Blood Group</th><th>Time</th><th>Certificate ID</th><th>Location</th></tr></thead>
                <tbody>
                  {checkins.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td><span className="blood-badge-sm">{c.bloodGroup}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(c.timestamp).toLocaleTimeString('en-IN')}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{c.certificateId}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{c.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
