import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HospitalOrders() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updating, setUpdating] = useState(null);
  const [issueModal, setIssueModal] = useState(null);

  const load = () => axios.get('/api/bloodbank/hospital-requests').then(r => { setRequests(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const updateRequest = async (id, updates) => {
    setUpdating(id);
    await axios.put(`/api/bloodbank/hospital-requests/${id}`, updates);
    setUpdating(null);
    load();
  };

  const approve = (req) => updateRequest(req.id, { status: 'Approved', approvedAt: new Date().toISOString() });
  const dispatch = (req) => updateRequest(req.id, { status: 'Dispatched', dispatchedAt: new Date().toISOString() });

  const statuses = ['All', 'Pending', 'Approved', 'Dispatched', 'Received'];
  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  const urgencyColor = { Emergency: 'badge-red', Critical: 'badge-red', Routine: 'badge-green', Moderate: 'badge-yellow' };
  const statusColor = { Pending: 'badge-yellow', Approved: 'badge-blue', Dispatched: 'badge-purple', Received: 'badge-green' };

  const pipeline = ['Pending', 'Approved', 'Dispatched', 'Received'];

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🚚 Hospital Blood Requests</div>
          <div className="section-subtitle">Manage and fulfill blood supply orders from hospitals</div>
        </div>
      </div>

      <div className="grid-4 mb-20">
        {pipeline.map(s => (
          <div key={s} className={`stat-card ${s === 'Pending' ? 'orange' : s === 'Approved' ? 'blue' : s === 'Dispatched' ? 'purple' : 'green'}`}>
            <div className={`stat-icon ${s === 'Pending' ? 'orange' : s === 'Approved' ? 'blue' : s === 'Dispatched' ? 'purple' : 'green'}`}>
              {s === 'Pending' ? '⏳' : s === 'Approved' ? '✅' : s === 'Dispatched' ? '🚚' : '📦'}
            </div>
            <div className="stat-value">{requests.filter(r => r.status === s).length}</div>
            <div className="stat-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="filter-chips mb-16">
        {statuses.map(s => <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state-title">No requests in this status</div></div></div>
        ) : filtered.map(req => (
          <div key={req.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div className="blood-badge" style={{ width: '40px', height: '40px', fontSize: '12px' }}>{req.bloodGroup}</div>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>{req.patientName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Patient ID: {req.patientId} · Ward: {req.ward}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge ${urgencyColor[req.urgency] || 'badge-gray'}`}>🔴 {req.urgency}</span>
                <span className={`badge ${statusColor[req.status] || 'badge-gray'}`}>{req.status}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{req.units} unit(s) of {req.bloodGroup}</span>
              </div>
            </div>

            {/* Pipeline tracker */}
            <div className="pipeline mb-16">
              {pipeline.map((s, i) => {
                const idx = pipeline.indexOf(req.status);
                const isDone = i < idx;
                const isActive = i === idx;
                return (
                  <div key={s} className="pipeline-step">
                    <div className={`pipeline-dot ${isDone ? 'done' : isActive ? 'active' : ''}`}>{isDone ? '✓' : i + 1}</div>
                    <div className={`pipeline-label ${isDone ? 'done' : isActive ? 'active' : ''}`}>{s}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>👨‍⚕️ Dr. {req.doctor}</span>
                {' · '}
                <span>📅 {new Date(req.createdAt).toLocaleString('en-IN')}</span>
                {req.notes && <span> · 📝 {req.notes}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {req.status === 'Pending' && (
                  <button className="btn btn-success btn-sm" onClick={() => approve(req)} disabled={updating === req.id}>
                    {updating === req.id ? '⏳' : '✅ Approve'}
                  </button>
                )}
                {req.status === 'Approved' && (
                  <button className="btn btn-bank btn-sm" onClick={() => setIssueModal(req)} disabled={updating === req.id}>
                    {updating === req.id ? '⏳' : '🚚 Dispatch'}
                  </button>
                )}
                {req.status === 'Dispatched' && (
                  <span className="badge badge-purple">🚚 En Route</span>
                )}
                {req.status === 'Received' && (
                  <span className="badge badge-green">✅ Delivered</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Modal */}
      {issueModal && (
        <div className="modal-overlay" onClick={() => setIssueModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🚚 Dispatch Blood Units</div>
              <button className="close-btn" onClick={() => setIssueModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 2 }}>
                <div>Patient: <strong style={{ color: 'var(--text-primary)' }}>{issueModal.patientName}</strong></div>
                <div>Blood Group: <strong style={{ color: 'var(--blood-red)' }}>{issueModal.bloodGroup}</strong></div>
                <div>Units Required: <strong style={{ color: 'var(--text-primary)' }}>{issueModal.units}</strong></div>
                <div>Hospital Ward: <strong style={{ color: 'var(--text-primary)' }}>{issueModal.ward}</strong></div>
              </div>
              <div className="alert alert-info">ℹ️ A digital Transfer Slip with QR code will be generated for the hospital to verify upon receipt.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIssueModal(null)}>Cancel</button>
              <button className="btn btn-bank" onClick={() => { dispatch(issueModal); setIssueModal(null); }}>
                🚚 Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
