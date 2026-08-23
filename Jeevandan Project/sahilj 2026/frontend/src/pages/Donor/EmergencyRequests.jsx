import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LocationPicker from '../../components/LocationPicker';

export default function EmergencyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [responding, setResponding] = useState(null);
  const [success, setSuccess] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [userLocation, setUserLocation] = useState({
    location: 'Connaught Place, New Delhi',
    lat: 28.6315,
    lng: 77.2167
  });

  const load = () => axios.get('/api/emergency').then(r => { setRequests(r.data); setLoading(false); });
  
  useEffect(() => {
    load();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }));
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  const respond = async (id) => {
    setResponding(id);
    try {
      await axios.post(`/api/emergency/${id}/respond`, { donorId: user?.donorId });
      setSuccess('✅ Response sent! The hospital staff has been notified. Thank you for stepping up as a hero!');
      load();
      setTimeout(() => setSuccess(''), 6000);
    } finally { setResponding(null); }
  };

  const groups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const filtered = filter === 'All' ? requests : requests.filter(r => r.bloodGroup === filter);
  const active = filtered.filter(r => r.status === 'Active');
  const fulfilled = filtered.filter(r => r.status === 'Fulfilled');

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading emergency requests...</span></div>;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🚨 Emergency Blood Requests</div>
          <div className="section-subtitle">{active.length} active emergencies · Immediate donor response needed</div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowLocationPicker(!showLocationPicker)}
        >
          🎯 {showLocationPicker ? 'Hide GPS Control' : 'Set My GPS Location'}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      {/* GPS Location Control */}
      {showLocationPicker && (
        <div className="card mb-20" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          <LocationPicker
            location={userLocation.location}
            lat={userLocation.lat}
            lng={userLocation.lng}
            label="Set Your Location to Get Distance & Map Directions to Hospital"
            onChange={(locData) => {
              setUserLocation({
                location: locData.location || userLocation.location,
                lat: locData.lat,
                lng: locData.lng
              });
            }}
          />
        </div>
      )}

      <div style={{ padding: '16px', background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', color: 'var(--blood-red)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>🩸</span>
        <span><strong>You are saving lives!</strong> Respond to requests matching your blood group. You can click <strong>"Get Directions"</strong> to navigate directly to the hospital.</span>
      </div>

      <div className="filter-chips mb-20">
        {groups.map(g => <button key={g} className={`chip ${filter === g ? 'active' : ''}`} onClick={() => setFilter(g)}>{g}</button>)}
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF4444', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
        Active Emergency Requests ({active.length})
      </h3>

      {active.length === 0 ? (
        <div className="card mb-20">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">No active requests</div>
            <div className="empty-state-desc">No urgent requests for this blood group right now</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {active.map(em => {
            const hospLat = em.lat || 28.6562;
            const hospLng = em.lng || 77.2410;
            return (
              <div key={em.id} className="emergency-card">
                <div>
                  <div className={`emergency-urgency urgency-${em.urgency.toLowerCase()}`}>{em.urgency}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div className="blood-badge">{em.bloodGroup}</div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{em.patientName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>🏥 {em.hospital}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>📍 {em.distance} km away · 🔴 {em.units} unit(s) needed</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>ℹ️ {em.description}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>👥 {em.respondedDonors?.length || 0} donor(s) responded · 📞 {em.contact}</div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => respond(em.id)}
                      disabled={responding === em.id || em.respondedDonors?.includes(user?.donorId)}
                    >
                      {responding === em.id ? '⏳ Sending...' : em.respondedDonors?.includes(user?.donorId) ? '✅ Responded' : '🩸 I Can Donate'}
                    </button>
                    
                    <a href={`tel:${em.contact}`} className="btn btn-secondary">📞 Call</a>

                    {/* Directions Link */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hospLat},${hospLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      🗺️ Directions
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {fulfilled.length > 0 && (
        <>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>✅ Fulfilled Requests ({fulfilled.length})</h3>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Patient</th><th>Blood Group</th><th>Hospital</th><th>Responders</th><th>Status</th></tr></thead>
                <tbody>
                  {fulfilled.map(em => (
                    <tr key={em.id}>
                      <td>{em.patientName}</td>
                      <td><span className="blood-badge-sm">{em.bloodGroup}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{em.hospital}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{em.respondedDonors?.length || 0} donor(s)</td>
                      <td><span className="badge badge-green">✅ Fulfilled</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
