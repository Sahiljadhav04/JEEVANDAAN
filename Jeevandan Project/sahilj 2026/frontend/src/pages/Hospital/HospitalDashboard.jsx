import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = (window.history.pushState && ((path) => window.history.pushState({}, '', path) || window.dispatchEvent(new PopStateEvent('popstate'))));

  useEffect(() => {
    if (user?.hospitalId) {
      Promise.all([
        axios.get(`/api/hospital/stats/${user.hospitalId}`),
        axios.get(`/api/hospital/requests/${user.hospitalId}`),
      ]).then(([s, r]) => {
        setStats(s.data);
        setRequests(r.data.filter(req => req.status === 'Pending' || req.status === 'Dispatched').slice(0, 5));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading dashboard...</span></div>;

  const urgencyReqs = requests.filter(r => r.urgency === 'Critical' || r.urgency === 'Emergency');

  return (
    <div className="page-container fade-in">
      {urgencyReqs.length > 0 && (
        <div className="alert alert-danger mb-20">
          🚨 <strong>{urgencyReqs.length} critical/emergency</strong> blood requests are pending. Take immediate action.
        </div>
      )}

      {/* Stats */}
      <div className="grid-4 mb-24">
        <div className="stat-card orange">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-value">{stats?.pending || 0}</div>
          <div className="stat-label">Pending Requests</div>
          <div className="stat-change down">{stats?.pending > 0 ? 'Needs attention' : 'All clear'}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">✅</div>
          <div className="stat-value">{stats?.approved || 0}</div>
          <div className="stat-label">Approved Requests</div>
          <div className="stat-change up">Blood bank confirmed</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple">🚚</div>
          <div className="stat-value">{stats?.dispatched || 0}</div>
          <div className="stat-label">Dispatched / En Route</div>
          <div className="stat-change up">On the way</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">📦</div>
          <div className="stat-value">{stats?.received || 0}</div>
          <div className="stat-label">Units Received</div>
          <div className="stat-change up">In stock</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Active Requests */}
        <div>
          <div className="section-header">
            <div>
              <div className="section-title">📋 Active Requests</div>
              <div className="section-subtitle">Monitor your blood request pipeline</div>
            </div>
            <a href="/hospital/tracker" className="btn btn-secondary btn-sm">View All</a>
          </div>

          {requests.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-title">No active requests</div></div></div>
          ) : requests.map(req => (
            <div key={req.id} className="card mb-12" style={{ borderLeft: req.urgency === 'Critical' || req.urgency === 'Emergency' ? '3px solid var(--danger)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="blood-badge" style={{ width: '38px', height: '38px', fontSize: '11px' }}>{req.bloodGroup}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#F4F4F8', fontSize: '15px' }}>{req.patientName}</div>
                    <div style={{ fontSize: '12px', color: '#9999BB' }}>{req.ward} · {req.units} unit(s)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className={`badge ${req.urgency === 'Emergency' || req.urgency === 'Critical' ? 'badge-red' : 'badge-yellow'}`}>{req.urgency}</span>
                  <span className={`badge ${req.status === 'Dispatched' ? 'badge-purple' : 'badge-yellow'}`}>{req.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions + Info */}
        <div>
          <div className="card mb-16">
            <div className="card-header"><div className="card-title">⚡ Quick Actions</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { icon: '🩸', label: 'New Patient Request', path: '/hospital/request', color: 'btn-primary' },
                { icon: '📡', label: 'Track Requests', path: '/hospital/tracker', color: 'btn-secondary' },
                { icon: '💉', label: 'Transfusion Logs', path: '/hospital/transfusions', color: 'btn-secondary' },
                { icon: '📣', label: 'Emergency Broadcast', path: '/hospital/emergency', color: 'btn-danger' },
              ].map(a => (
                <a key={a.path} href={a.path} className={`btn ${a.color}`} style={{ flexDirection: 'column', gap: '6px', padding: '16px', height: 'auto', textDecoration: 'none', justifyContent: 'center' }}>
                  <span style={{ fontSize: '24px' }}>{a.icon}</span>
                  <span style={{ fontSize: '12px' }}>{a.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(0,105,92,0.1)', borderColor: 'rgba(38,166,154,0.3)' }}>
            <div className="card-header"><div className="card-title" style={{ color: '#4DB6AC' }}>📊 This Week's Summary</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Total Requests', value: stats?.totalRequests || 0, icon: '📋' },
                { label: 'Transfusions Done', value: stats?.transfusions || 0, icon: '💉' },
                { label: 'Success Rate', value: `${stats?.totalRequests > 0 ? Math.round(((stats?.received || 0) / stats.totalRequests) * 100) : 0}%`, icon: '📈' },
                { label: 'Avg Response', value: '2.4h', icon: '⏱️' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 800, color: '#4DB6AC' }}>{item.value}</div>
                  <div style={{ fontSize: '11px', color: '#9999BB' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
