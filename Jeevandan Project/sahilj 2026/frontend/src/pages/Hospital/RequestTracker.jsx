import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function RequestTracker() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updating, setUpdating] = useState(null);

  const load = () => {
    if (user?.hospitalId) {
      axios.get(`/api/hospital/requests/${user.hospitalId}`).then(r => { setRequests(r.data); setLoading(false); });
    }
  };
  useEffect(() => { load(); }, [user]);

  const markReceived = async (id) => {
    setUpdating(id);
    await axios.put(`/api/hospital/requests/${id}`, { status: 'Received', receivedAt: new Date().toISOString() });
    setUpdating(null);
    load();
  };

  const pipeline = ['Pending', 'Approved', 'Dispatched', 'Received'];
  const statuses = ['All', ...pipeline];
  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  const urgencyColor = { Emergency: 'badge-red', Critical: 'badge-red', Moderate: 'badge-yellow', Routine: 'badge-green' };
  const statusBadge = { Pending: 'badge-yellow', Approved: 'badge-blue', Dispatched: 'badge-purple', Received: 'badge-green' };

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">📡 Blood Request Tracker</div>
          <div className="section-subtitle">Track your requests from submission to delivery</div>
        </div>
        <button className="btn btn-secondary" onClick={load}>🔄 Refresh</button>
      </div>

      {/* Summary */}
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

      <div className="filter-chips mb-20">
        {statuses.map(s => <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>)}
      </div>

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No requests found</div></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(req => {
            const stepIdx = pipeline.indexOf(req.status);
            return (
              <div key={req.id} className="card" style={{ borderLeft: req.urgency === 'Critical' || req.urgency === 'Emergency' ? '4px solid var(--danger)' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="blood-badge">{req.bloodGroup}</div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{req.patientName}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>ID: {req.patientId} · {req.ward} · Dr. {req.doctor}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={`badge ${urgencyColor[req.urgency] || 'badge-gray'}`}>{req.urgency}</span>
                    <span className={`badge ${statusBadge[req.status] || 'badge-gray'}`}>{req.status}</span>
                    <span className="badge badge-blue">{req.units} unit(s)</span>
                  </div>
                </div>

                {/* Pipeline */}
                <div className="pipeline mb-12">
                  {pipeline.map((s, i) => (
                    <div key={s} className="pipeline-step">
                      <div className={`pipeline-dot ${i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}`}>
                        {i < stepIdx ? '✓' : i + 1}
                      </div>
                      <div className={`pipeline-label ${i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}`}>
                        {s}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    📅 {new Date(req.createdAt).toLocaleString('en-IN')}
                    {req.approvedAt && <span> · ✅ Approved: {new Date(req.approvedAt).toLocaleTimeString('en-IN')}</span>}
                    {req.dispatchedAt && <span> · 🚚 Dispatched: {new Date(req.dispatchedAt).toLocaleTimeString('en-IN')}</span>}
                    {req.receivedAt && <span> · 📦 Received: {new Date(req.receivedAt).toLocaleTimeString('en-IN')}</span>}
                  </div>
                  {req.status === 'Dispatched' && (
                    <button className="btn btn-hospital btn-sm" onClick={() => markReceived(req.id)} disabled={updating === req.id}>
                      {updating === req.id ? '⏳' : '📦 Mark as Received'}
                    </button>
                  )}
                </div>
                {req.notes && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>📝 {req.notes}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
