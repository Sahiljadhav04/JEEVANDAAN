import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LocationPicker from '../../components/LocationPicker';

// ─── Emergency Certificate Modal for Hospital ───
function EmergencyCertModal({ cert, onClose }) {
  if (!cert) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🏆 Emergency Donation Certificate</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="certificate">
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🩸</div>
            <div className="cert-subtitle">Emergency Life Saver Certificate</div>
            <div className="cert-title">JeevanDaan Emergency Network</div>
            <div style={{ height: '1px', background: 'rgba(200,16,46,0.4)', margin: '16px 0' }} />
            <div className="cert-body">This is to proudly certify that</div>
            <div className="cert-name" style={{ fontSize: '26px', color: 'white', fontWeight: 800, margin: '10px 0' }}>
              {cert.donorName}
            </div>
            <div className="cert-body">
              has courageously donated <strong style={{ color: 'white' }}>1 Unit</strong> of{' '}
              <strong style={{ color: '#FF4D6D' }}>{cert.bloodGroup}</strong> blood for patient{' '}
              <strong style={{ color: 'white' }}>{cert.patientName}</strong>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap' }}>
              <span>📅 {cert.date}</span>
              <span>🏥 {cert.hospital}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
              Certificate ID: <strong style={{ color: 'white' }}>{cert.certificateId}</strong>
            </div>
            <div className="cert-seal">🏅</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Certificate</button>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmergencyBroadcast() {
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: 'O-',
    units: 1,
    hospital: 'AIIMS New Delhi',
    lat: 28.5672,
    lng: 77.2100,
    urgency: 'Critical',
    description: '',
    contact: '+91-9876543210'
  });

  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcasted, setBroadcasted] = useState(null);

  // Active emergencies list & donor inspection
  const [emergencies, setEmergencies] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(true);
  const [expandedEmergencyId, setExpandedEmergencyId] = useState(null);
  const [emergencyDonors, setEmergencyDonors] = useState({});
  const [loadingDonors, setLoadingDonors] = useState({});
  const [approvingDonorId, setApprovingDonorId] = useState(null);
  const [certModal, setCertModal] = useState(null);

  const loadEmergencies = () => {
    setLoadingEmergencies(true);
    axios.get('/api/emergency')
      .then(r => { setEmergencies(r.data || []); setLoadingEmergencies(false); })
      .catch(() => setLoadingEmergencies(false));
  };

  useEffect(() => {
    loadEmergencies();
  }, []);

  const broadcast = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      const r = await axios.post('/api/emergency', { ...form, units: Number(form.units) });
      setBroadcasted(r.data);
      loadEmergencies();
    } finally {
      setBroadcasting(false);
    }
  };

  // Toggle expand emergency to see responded donors
  const toggleEmergency = async (emId) => {
    if (expandedEmergencyId === emId) {
      setExpandedEmergencyId(null);
      return;
    }
    setExpandedEmergencyId(emId);
    if (!emergencyDonors[emId]) {
      setLoadingDonors(prev => ({ ...prev, [emId]: true }));
      try {
        const r = await axios.get(`/api/emergency/${emId}/donors`);
        setEmergencyDonors(prev => ({ ...prev, [emId]: r.data }));
      } catch {
        setEmergencyDonors(prev => ({ ...prev, [emId]: [] }));
      } finally {
        setLoadingDonors(prev => ({ ...prev, [emId]: false }));
      }
    }
  };

  // Hospital approves donation for a responded donor
  const approveEmergencyDonation = async (em, donor) => {
    if (!window.confirm(`Approve blood donation for ${donor.name} (${donor.bloodGroup}) for patient ${em.patientName}?`)) return;
    setApprovingDonorId(donor.id);
    try {
      const r = await axios.post(`/api/emergency/${em.id}/approve-donor`, { donorId: donor.id });
      // Update local state
      setEmergencyDonors(prev => ({
        ...prev,
        [em.id]: (prev[em.id] || []).map(d => d.id === donor.id ? { ...d, status: 'Donated', certificateId: r.data.certificateId } : d)
      }));
      setCertModal(r.data);
      loadEmergencies();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setApprovingDonorId(null);
    }
  };

  // SUCCESS / CONFIRMATION VIEW (after sending broadcast)
  if (broadcasted) {
    return (
      <div className="page-container fade-in">
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px', animation: 'pulse-dot 1s infinite' }}>📣</div>
          
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Emergency Alert & SMS Broadcast Sent!
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
            Real-time SMS alerts and in-app notifications have been generated for all registered <strong style={{ color: 'var(--blood-red)' }}>{broadcasted.bloodGroup}</strong> donors near <strong>{broadcasted.hospital}</strong>.
          </p>

          {/* Details Summary Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'left', fontSize: '14px', lineHeight: 2.0, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--blood-red)', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              🚨 Broadcast Case Overview (ID: <span style={{ fontFamily: 'monospace' }}>{broadcasted.id}</span>)
            </div>
            <div>🩸 <strong>Blood Group Needed:</strong> <span className="blood-badge-sm" style={{ fontSize: '13px' }}>{broadcasted.bloodGroup}</span></div>
            <div>👤 <strong>Patient Name:</strong> {broadcasted.patientName}</div>
            <div>📦 <strong>Units Required:</strong> {broadcasted.units} bag(s)</div>
            <div>🚨 <strong>Urgency Priority:</strong> <span className="badge badge-red">{broadcasted.urgency}</span></div>
            <div>🏥 <strong>Hospital Location:</strong> {broadcasted.hospital}</div>
            <div>📞 <strong>Coordination Contact:</strong> <strong style={{ color: 'var(--blood-red)' }}>{broadcasted.contact}</strong></div>
          </div>

          {/* Email Dispatch Log */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📧 Email Alerts Dispatched to Nearby Donors</span>
              <span className="badge badge-green">WITHIN {broadcasted.emailDispatch?.rangeKm || 20} KM</span>
            </div>

            {broadcasted.emailDispatch?.sent?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {broadcasted.emailDispatch.sent.map((item, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', background: '#F0FFF4', border: '1px solid #86EFAC', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#166534' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#4ADE80' }}>📍 {item.distanceKm} km away · {item.email}</div>
                    </div>
                    <span className="badge badge-green" style={{ fontSize: '10px' }}>✓ Email Sent</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                ⚠️ No donors with GPS coordinates in {broadcasted.emailDispatch?.rangeKm || 20} km range yet. Donors need to set their location in their profile for proximity emails.
              </div>
            )}

            {broadcasted.emailDispatch?.skipped?.length > 0 && (
              <details style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '6px' }}>
                  {broadcasted.emailDispatch.skipped.length} donor(s) out of range / skipped
                </summary>
                {broadcasted.emailDispatch.skipped.map((s, i) => (
                  <div key={i} style={{ padding: '4px 8px' }}>• {s.name} — {s.reason}</div>
                ))}
              </details>
            )}
          </div>

          <div className="alert alert-info mb-20" style={{ textAlign: 'left' }}>
            ℹ️ <strong>What Happens Next:</strong> When a donor clicks <strong>"I Can Donate"</strong> on their mobile screen, they will appear below under <strong>"Active Broadcasts & Responded Donors"</strong>. You can verify and approve their donation to issue an official certificate!
          </div>

          <button className="btn btn-primary" onClick={() => setBroadcasted(null)} style={{ padding: '12px 28px', fontSize: '15px' }}>
            📣 Return to Emergency Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">📣 Emergency Broadcast & Donor Approval</div>
          <div className="section-subtitle">Broadcast critical blood needs and approve arriving emergency donors</div>
        </div>
        <button className="btn btn-secondary" onClick={loadEmergencies}>🔄 Refresh</button>
      </div>

      {/* Warning Banner */}
      <div style={{ padding: '16px', background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.3)', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', color: 'var(--blood-red)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '24px', flexShrink: 0 }}>⚠️</span>
        <div>
          <strong>Emergency Protocol:</strong> Submitting this broadcast dispatches immediate SMS, in-app push alerts, and proximity emails (within 20 km) to all matching registered donors.
        </div>
      </div>

      {/* ── BROADCAST FORM + GUIDANCE ── */}
      <div className="grid-2 mb-24">
        
        {/* BROADCAST FORM */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--blood-red)' }}>🚨 Emergency Broadcast Requisition</div>
          </div>
          
          <form onSubmit={broadcast}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Patient Name *</label>
                <input
                  className="form-input"
                  placeholder="Full name of patient"
                  value={form.patientName}
                  onChange={e => setForm({ ...form, patientName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Critical Blood Group *</label>
                <select className="form-select" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Units Required (Bags) *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  value={form.units}
                  onChange={e => setForm({ ...form, units: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Priority *</label>
                <select className="form-select" value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>
                  {['Critical', 'Emergency', 'Moderate'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* GPS Location Picker */}
            <LocationPicker
              location={form.hospital}
              lat={form.lat}
              lng={form.lng}
              label="Hospital Ward Name & GPS Location *"
              onChange={(locData) => {
                setForm({
                  ...form,
                  hospital: locData.location || form.hospital,
                  lat: locData.lat,
                  lng: locData.lng
                });
              }}
            />

            <div className="form-group">
              <label className="form-label">Coordination Contact Number *</label>
              <input
                className="form-input"
                placeholder="+91-XXXXXXXXXX (Active phone line for calls)"
                value={form.contact}
                onChange={e => setForm({ ...form, contact: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Description / Notes</label>
              <textarea
                className="form-input"
                style={{ minHeight: '70px' }}
                placeholder="Reason for requirement (e.g. ICU cardiac surgery, trauma, post-partum hemorrhage...)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                background: 'linear-gradient(135deg, #C8102E, #8B0000)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-red)',
                animation: 'pulse 2s infinite'
              }}
              disabled={broadcasting}
            >
              {broadcasting ? '⏳ Dispatching SMS & Alerts...' : '📣 BROADCAST EMERGENCY SMS ALERT'}
            </button>
          </form>
        </div>

        {/* STEP BY STEP GUIDANCE & HOW EACH SECTION WORKS */}
        <div>
          <div className="card mb-16" style={{ background: 'var(--blood-pale)', borderColor: 'rgba(200,16,46,0.2)' }}>
            <div style={{ fontWeight: 800, color: 'var(--blood-red)', fontSize: '15px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📖 How Emergency Broadcast Works</span>
            </div>

            {[
              {
                title: '1. Broadcast Blood Requirement',
                desc: 'Fill the form with patient name, required units, blood group, and GPS location. Submitting sends instant emails, SMS, and in-app push alerts.'
              },
              {
                title: '2. Donors Receive Alert & Respond',
                desc: 'Nearby matching donors get driving directions and click "I Can Donate" in their mobile portal.'
              },
              {
                title: '3. Hospital Verifies Arriving Donor',
                desc: 'Check the "Active Broadcasts & Responded Donors" list below. When the donor arrives at your ward, click "✅ Approve Donation".'
              },
              {
                title: '4. Official Certificate & Record Saved',
                desc: 'The donor is awarded +500 points, their donation history is permanently recorded, and an official Certificate of Appreciation is generated!'
              }
            ].map((step, idx) => (
              <div key={idx} style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: idx < 3 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>{step.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', fontSize: '14px' }}>
              🩸 Blood Group Compatibility Guide
            </div>
            {[
              { group: 'O-', receivesFrom: 'O- only (Universal Donor)', color: 'badge-red' },
              { group: 'O+', receivesFrom: 'O+, O-', color: 'badge-yellow' },
              { group: 'A-', receivesFrom: 'A-, O-', color: 'badge-yellow' },
              { group: 'A+', receivesFrom: 'A+, A-, O+, O-', color: 'badge-green' },
              { group: 'B-', receivesFrom: 'B-, O-', color: 'badge-yellow' },
              { group: 'B+', receivesFrom: 'B+, B-, O+, O-', color: 'badge-green' },
              { group: 'AB+', receivesFrom: 'Universal Recipient (All groups)', color: 'badge-green' },
            ].map(item => (
              <div key={item.group} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                <span className="blood-badge-sm">{item.group}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.receivesFrom}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── ACTIVE BROADCASTS & RESPONDED DONORS SECTION ── */}
      <div className="section-header">
        <div>
          <div className="section-title">🚨 Active Broadcasts & Responded Donors ({emergencies.length})</div>
          <div className="section-subtitle">Approve blood donations for donors who responded to emergency alerts</div>
        </div>
      </div>

      {loadingEmergencies ? (
        <div className="loading-spinner"><div className="spinner" /><span>Loading emergency broadcasts...</span></div>
      ) : emergencies.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">No emergency broadcasts active</div>
            <div className="empty-state-desc">Use the requisition form above to broadcast an urgent blood requirement.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {emergencies.map(em => {
            const isExpanded = expandedEmergencyId === em.id;
            const responders = emergencyDonors[em.id] || [];
            const isLoading = loadingDonors[em.id];
            const respondersCount = em.respondedDonors?.length || 0;

            return (
              <div
                key={em.id}
                className="card"
                style={{
                  borderLeft: em.urgency === 'Critical' ? '4px solid var(--blood-red)' : '4px solid #F59E0B',
                  borderColor: isExpanded ? 'var(--blood-red)' : undefined
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="blood-badge">{em.bloodGroup}</div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Patient: {em.patientName}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        🏥 {em.hospital} · 📞 {em.contact}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge ${em.urgency === 'Critical' ? 'badge-red' : 'badge-yellow'}`}>{em.urgency}</span>
                    <span className="badge badge-blue">{em.units} Unit(s)</span>
                    <span className={`badge ${em.status === 'Fulfilled' ? 'badge-green' : 'badge-gray'}`}>{em.status}</span>
                    <button
                      className={`btn btn-sm ${isExpanded ? 'btn-secondary' : 'btn-hospital'}`}
                      onClick={() => toggleEmergency(em.id)}
                    >
                      {isExpanded ? '▲ Hide Responders' : `👥 View Responded Donors (${respondersCount})`}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  📝 <strong>Description:</strong> {em.description || 'Emergency requirement'}
                </div>

                {/* ── RESPONDED DONORS EXPANDABLE PANEL ── */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🩸 Responded Donors — Confirm Arrival & Approve Blood Donation</span>
                    </div>

                    {isLoading ? (
                      <div className="loading-spinner" style={{ padding: '20px' }}><div className="spinner" /><span>Loading donors...</span></div>
                    ) : responders.length === 0 ? (
                      <div className="empty-state" style={{ padding: '20px' }}>
                        <div className="empty-state-icon">👤</div>
                        <div className="empty-state-title">No donors have responded yet</div>
                        <div className="empty-state-desc">When a donor clicks "I Can Donate" in their portal, they will appear here.</div>
                      </div>
                    ) : (
                      <div className="table-wrapper">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Donor Name</th>
                              <th>Blood Group</th>
                              <th>Contact Number</th>
                              <th>Location / Address</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {responders.map(d => (
                              <tr key={d.id}>
                                <td>
                                  <strong>{d.name}</strong>
                                  {d.badge && <div style={{ fontSize: '11px', color: '#9999BB' }}>🏅 {d.badge}</div>}
                                </td>
                                <td><span className="blood-badge-sm">{d.bloodGroup}</span></td>
                                <td>
                                  <a href={`tel:${d.contact}`} style={{ color: 'var(--blood-red)', fontWeight: 600, textDecoration: 'none' }}>
                                    📞 {d.contact}
                                  </a>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{d.address || '—'}</td>
                                <td>
                                  {d.status === 'Donated' ? (
                                    <span className="badge badge-green">✅ Donated</span>
                                  ) : (
                                    <span className="badge badge-yellow">⏳ Responded</span>
                                  )}
                                </td>
                                <td>
                                  {d.status === 'Donated' ? (
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      onClick={() => setCertModal({
                                        donorName: d.name,
                                        bloodGroup: d.bloodGroup,
                                        patientName: em.patientName,
                                        hospital: em.hospital,
                                        date: d.donatedAt || new Date().toISOString().split('T')[0],
                                        certificateId: d.certificateId || 'EMERG-CERT',
                                      })}
                                    >
                                      🏆 View Certificate
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-hospital btn-sm"
                                      disabled={approvingDonorId === d.id}
                                      onClick={() => approveEmergencyDonation(em, d)}
                                    >
                                      {approvingDonorId === d.id ? '⏳ Approving...' : '✅ Approve Donation'}
                                    </button>
                                  )}
                                </td>
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
          })}
        </div>
      )}

      {/* ── CERTIFICATE MODAL ── */}
      {certModal && <EmergencyCertModal cert={certModal} onClose={() => setCertModal(null)} />}
    </div>
  );
}
