import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function CertModal({ d, onClose }) {
  const isEmergency = d.source === 'emergency' || (d.certificateId && d.certificateId.startsWith('EMERG'));
  const isCamp = d.source === 'camp' || (d.certificateId && d.certificateId.startsWith('CAMP'));

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
            <div className="cert-subtitle">
              {isEmergency ? 'Emergency Life Saver Certificate' : 'Certificate of Appreciation'}
            </div>
            <div className="cert-title">JeevanDaan Foundation</div>
            <div style={{ height: '1px', background: 'rgba(200,16,46,0.4)', margin: '16px 0' }} />
            <div className="cert-body">This is to proudly certify that</div>
            <div className="cert-name" style={{ fontSize: '26px', color: 'white', fontWeight: 800, margin: '10px 0' }}>
              {d.donorName || 'A Valued Hero'}
            </div>
            <div className="cert-body">
              has generously donated <strong style={{ color: 'white' }}>{d.units || 1} Unit</strong> of{' '}
              <strong style={{ color: '#FF4D6D' }}>{d.bloodGroup}</strong> blood
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap' }}>
              <span>📅 {d.date}</span>
              <span>{isCamp ? '⛺' : isEmergency ? '🚨' : '🏥'} {d.hospital}</span>
              {d.location && <span>📍 {d.location}</span>}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '10px' }}>
              Certificate ID: <strong style={{ color: 'white' }}>{d.certificateId}</strong>
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

export default function DonationHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHistory = () => {
    if (user?.donorId) {
      axios.get(`/api/donor/${user.donorId}/history`)
        .then(r => { setHistory(r.data || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading history...</span></div>;

  const getSourceBadge = (source) => {
    if (source === 'camp') return <span className="badge badge-blue">⛺ Camp</span>;
    if (source === 'emergency') return <span className="badge badge-red">🚨 Emergency</span>;
    return <span className="badge badge-purple">🏥 Blood Bank</span>;
  };

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">📋 Donation History</div>
          <div className="section-subtitle">{history.length} verified donation(s) · Every drop counts</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadHistory}>🔄 Refresh</button>
      </div>

      <div className="grid-3 mb-24">
        <div className="stat-card red">
          <div className="stat-icon red">🩸</div>
          <div className="stat-value">{history.length}</div>
          <div className="stat-label">Total Donations</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange">❤️</div>
          <div className="stat-value">{history.length * 3}</div>
          <div className="stat-label">Lives Saved</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple">🏆</div>
          <div className="stat-value">{history.length}</div>
          <div className="stat-label">Certificates Earned</div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🩸</div>
            <div className="empty-state-title">No donations recorded yet</div>
            <div className="empty-state-desc">Book a slot at a nearby donation camp or respond to an emergency blood request to earn your first life-saver certificate!</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Blood Group</th>
                  <th>Center / Hospital</th>
                  <th>Units</th>
                  <th>Certificate ID</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={h.id}>
                    <td style={{ color: '#9999BB' }}>#{history.length - i}</td>
                    <td>{getSourceBadge(h.source)}</td>
                    <td><strong>{h.date}</strong></td>
                    <td><span className="blood-badge-sm">{h.bloodGroup}</span></td>
                    <td>
                      <div><strong>{h.hospital}</strong></div>
                      {h.location && <div style={{ fontSize: '11px', color: '#9999BB' }}>📍 {h.location}</div>}
                    </td>
                    <td><span className="badge badge-green">✅ {h.units || 1} unit</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9999BB' }}>
                      {h.certificateId}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelected(h)}>
                        🏆 View Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <CertModal d={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
