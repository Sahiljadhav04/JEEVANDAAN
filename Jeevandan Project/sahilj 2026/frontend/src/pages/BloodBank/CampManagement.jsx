import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LocationPicker from '../../components/LocationPicker';

function CampCertModal({ cert, onClose }) {
  if (!cert) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">🏆 Donation Certificate</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="certificate">
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🩸</div>
            <div className="cert-subtitle">Certificate of Appreciation</div>
            <div className="cert-title">JeevanDaan Foundation</div>
            <div style={{ height: '1px', background: 'rgba(200,16,46,0.4)', margin: '16px 0' }} />
            <div className="cert-body">This is to certify that</div>
            <div className="cert-name" style={{ fontSize: '26px', color: 'white', fontWeight: 800, margin: '10px 0' }}>
              {cert.donorName}
            </div>
            <div className="cert-body">
              has generously donated <strong style={{ color: 'white' }}>1 Unit</strong> of{' '}
              <strong style={{ color: '#FF4D6D' }}>{cert.bloodGroup}</strong> blood
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              <span>📅 {cert.date}</span>
              <span>⛺ {cert.campName}</span>
              <span>📍 {cert.campLocation}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
              Certificate ID: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{cert.certificateId}</strong>
            </div>
            <div className="cert-seal">🏅</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
            <button className="btn btn-bank" onClick={() => window.print()}>🖨️ Print Certificate</button>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampManagement() {
  const [camps, setCamps] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', location: '', city: '', organizer: 'LifeFlow Blood Bank', slots: 100, description: '', contact: '', lat: 28.6129, lng: 77.2295 });
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campBookings, setCampBookings] = useState({});
  const [expandedCampId, setExpandedCampId] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState({});
  const [approvingId, setApprovingId] = useState(null);
  const [certModal, setCertModal] = useState(null);

  const load = () => axios.get('/api/camps').then(r => { setCamps(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const addCamp = async () => {
    setAdding(true);
    await axios.post('/api/camps', { ...form, slots: Number(form.slots) });
    setShowAdd(false); setAdding(false);
    setForm({ name: '', date: '', location: '', city: '', organizer: 'LifeFlow Blood Bank', slots: 100, description: '', contact: '', lat: 28.6129, lng: 77.2295 });
    load();
  };

  const toggleCamp = async (campId) => {
    if (expandedCampId === campId) { setExpandedCampId(null); return; }
    setExpandedCampId(campId);
    if (!campBookings[campId]) {
      setLoadingBookings(prev => ({ ...prev, [campId]: true }));
      try {
        const r = await axios.get(`/api/camps/${campId}/bookings`);
        setCampBookings(prev => ({ ...prev, [campId]: r.data }));
      } catch { setCampBookings(prev => ({ ...prev, [campId]: [] })); }
      finally { setLoadingBookings(prev => ({ ...prev, [campId]: false })); }
    }
  };

  const approveDonation = async (booking, campId) => {
    if (!window.confirm(`Approve donation for ${booking.donor_name} (${booking.blood_group})?`)) return;
    setApprovingId(booking.id);
    try {
      const r = await axios.post(`/api/camp-bookings/${booking.id}/approve-donation`);
      setCampBookings(prev => ({ ...prev, [campId]: prev[campId].map(b => b.id === booking.id ? { ...b, status: 'Donated', certificate_id: r.data.certificateId } : b) }));
      setCertModal(r.data);
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
    finally { setApprovingId(null); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;
  const upcoming = camps.filter(c => c.status === 'Upcoming');
  const completed = camps.filter(c => c.status === 'Completed');

  const statusBadge = (s) => {
    if (s === 'Donated') return <span className="badge badge-green">✅ Donated</span>;
    if (s === 'Booked') return <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)' }}>📅 Booked</span>;
    return <span className="badge badge-gray">{s}</span>;
  };

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">⛺ Camp Management</div>
          <div className="section-subtitle">{upcoming.length} upcoming · {completed.length} completed</div>
        </div>
        <button className="btn btn-bank" onClick={() => setShowAdd(true)}>➕ Create New Camp</button>
      </div>

      <div className="grid-3 mb-20">
        <div className="stat-card blue"><div className="stat-icon blue">⛺</div><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming Camps</div></div>
        <div className="stat-card green"><div className="stat-icon green">✅</div><div className="stat-value">{completed.length}</div><div className="stat-label">Completed Camps</div></div>
        <div className="stat-card red"><div className="stat-icon red">👥</div><div className="stat-value">{camps.reduce((s, c) => s + c.bookedSlots, 0)}</div><div className="stat-label">Total Slots Booked</div></div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>🔜 Upcoming Camps</h3>
      {upcoming.length === 0 ? (
        <div className="card mb-20"><div className="empty-state"><div className="empty-state-title">No upcoming camps</div><div className="empty-state-desc">Create a new camp to get started</div></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {upcoming.map(c => {
            const pct = Math.round((c.bookedSlots / c.slots) * 100);
            const isExpanded = expandedCampId === c.id;
            const bookings = campBookings[c.id] || [];
            const isLoading = loadingBookings[c.id];
            return (
              <div key={c.id} className="card" style={{ border: isExpanded ? '1px solid var(--blood-red)' : '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="badge badge-green">Upcoming</span>
                    <button className={`btn btn-sm ${isExpanded ? 'btn-secondary' : 'btn-bank'}`} onClick={() => toggleCamp(c.id)}>
                      {isExpanded ? '▲ Hide Donors' : `👥 View Donors (${c.bookedSlots})`}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 2, marginBottom: '12px' }}>
                  <div>📅 {c.date}</div><div>📍 {c.location}</div><div>🏥 {c.organizer}</div><div>📞 {c.contact}</div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    <span>Slots Booked</span><span>{c.bookedSlots}/{c.slots} ({pct}%)</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill blue" style={{ width: `${pct}%` }} /></div>
                </div>
                {isExpanded && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', fontSize: '14px' }}>
                      🩸 Booked Donors — Approve Donation & Issue Certificate
                    </div>
                    {isLoading ? (
                      <div className="loading-spinner" style={{ padding: '20px' }}><div className="spinner" /><span>Loading donors...</span></div>
                    ) : bookings.length === 0 ? (
                      <div className="empty-state" style={{ padding: '20px' }}>
                        <div className="empty-state-icon">👤</div>
                        <div className="empty-state-title">No donors booked yet</div>
                      </div>
                    ) : (
                      <div className="table-wrapper">
                        <table className="table">
                          <thead><tr><th>Donor Name</th><th>Blood Group</th><th>Booked On</th><th>Status</th><th>Certificate ID</th><th>Action</th></tr></thead>
                          <tbody>
                            {bookings.map(b => (
                              <tr key={b.id}>
                                <td><strong>{b.donor_name}</strong></td>
                                <td><span className="blood-badge-sm">{b.blood_group}</span></td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : '—'}</td>
                                <td>{statusBadge(b.status)}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>{b.certificate_id || '—'}</td>
                                <td>
                                  {b.status === 'Donated' ? (
                                    <button className="btn btn-secondary btn-sm" onClick={() => setCertModal({ donorName: b.donor_name, bloodGroup: b.blood_group, campName: b.camp_name, campLocation: b.camp_location, date: b.camp_date, certificateId: b.certificate_id })}>
                                      🏆 View Cert
                                    </button>
                                  ) : (
                                    <button className="btn btn-bank btn-sm" disabled={approvingId === b.id} onClick={() => approveDonation(b, c.id)}>
                                      {approvingId === b.id ? '⏳ Approving...' : '✅ Approve Donation'}
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

      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>✅ Completed Camps</h3>
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Camp Name</th><th>Date</th><th>City</th><th>Slots</th><th>Booked</th><th>Fill Rate</th></tr></thead>
            <tbody>
              {completed.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.date}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.city}</td>
                  <td>{c.slots}</td>
                  <td>{c.bookedSlots}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-bar" style={{ width: '80px', height: '4px' }}>
                        <div className="progress-fill green" style={{ width: `${(c.bookedSlots / c.slots) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{Math.round((c.bookedSlots / c.slots) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">⛺ Create New Donation Camp</div>
              <button className="close-btn" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Camp Name</label><input className="form-input bank-focus" placeholder="e.g. Independence Day Blood Drive" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input bank-focus" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} /></div>
                <div className="form-group"><label className="form-label">Total Slots</label><input type="number" className="form-input bank-focus" value={form.slots} onChange={e => setForm({ ...form, slots: e.target.value })} /></div>
              </div>
              <LocationPicker location={form.location} city={form.city} lat={form.lat} lng={form.lng} label="Camp Venue Location" onChange={(locData) => setForm({ ...form, location: locData.location, city: locData.city || form.city, lat: locData.lat, lng: locData.lng })} />
              <div className="form-group"><label className="form-label">Contact Number</label><input className="form-input bank-focus" placeholder="011-XXXXXXXX" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input bank-focus" style={{ minHeight: '70px' }} placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-bank" onClick={addCamp} disabled={adding || !form.name || !form.date}>{adding ? '⏳ Creating...' : '✅ Create Camp'}</button>
            </div>
          </div>
        </div>
      )}

      {certModal && <CampCertModal cert={certModal} onClose={() => setCertModal(null)} />}
    </div>
  );
}
