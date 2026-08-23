import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GROUP_COLORS = { 'A+': '#E53935', 'A-': '#B71C1C', 'B+': '#1565C0', 'B-': '#0D47A1', 'AB+': '#6A1B9A', 'AB-': '#4A148C', 'O+': '#2E7D32', 'O-': '#1B5E20' };

export default function BloodBankDashboard() {
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/bloodbank/stock-summary'),
      axios.get('/api/bloodbank/hospital-requests'),
    ]).then(([s, r]) => {
      setStock(s.data);
      setRequests(r.data.filter(req => req.status === 'Pending').slice(0, 5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const maxUnits = stock ? Math.max(...stock.summary.map(s => s.available), 1) : 1;

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading dashboard...</span></div>;

  const expiringCount = stock?.summary?.reduce((sum, s) => sum + s.expiring, 0) || 0;
  const lowStockGroups = stock?.summary?.filter(s => s.available < 5) || [];

  return (
    <div className="page-container fade-in">
      {/* Alerts */}
      {expiringCount > 0 && (
        <div className="alert alert-warning mb-20">
          ⚠️ <strong>{expiringCount} blood units</strong> are expiring within the next 7 days. Prioritize distribution to hospitals.
        </div>
      )}
      {lowStockGroups.length > 0 && (
        <div className="alert alert-danger mb-20">
          🔴 Critical low stock: <strong>{lowStockGroups.map(g => g.group).join(', ')}</strong>. Schedule donation camps urgently.
        </div>
      )}

      {/* Stats Row */}
      <div className="grid-4 mb-24">
        <div className="stat-card red">
          <div className="stat-icon red">🗃️</div>
          <div className="stat-value">{stock?.totalUnits || 0}</div>
          <div className="stat-label">Total Units in Stock</div>
          <div className="stat-change up">All blood groups</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green">✅</div>
          <div className="stat-value">{stock?.thisMonth || 0}</div>
          <div className="stat-label">Collected This Month</div>
          <div className="stat-change up">July–Aug 2026</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange">⚠️</div>
          <div className="stat-value">{expiringCount}</div>
          <div className="stat-label">Expiring in 7 Days</div>
          <div className={`stat-change ${expiringCount > 0 ? 'down' : 'up'}`}>{expiringCount > 0 ? 'Needs attention' : 'All good!'}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue">🏥</div>
          <div className="stat-value">{requests.length}</div>
          <div className="stat-label">Pending Hospital Requests</div>
          <div className="stat-change down">{requests.length > 0 ? 'Action needed' : 'All clear'}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Blood Stock Bars */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🩸 Live Blood Inventory</div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/bloodbank/inventory')}>Manage Stock</button>
          </div>
          {stock?.summary?.map(s => (
            <div key={s.group} className="stock-group-row">
              <div className="stock-group-label">{s.group}</div>
              <div className="stock-bar-wrap">
                <div className="stock-bar">
                  <div className="stock-bar-fill" style={{ width: `${Math.min(100, (s.available / Math.max(maxUnits, 1)) * 100)}%`, background: GROUP_COLORS[s.group] || 'var(--blood-red)', borderRadius: '4px' }} />
                </div>
              </div>
              <div className="stock-count">{s.available}</div>
              {s.available < 5 && <span className="badge badge-red stock-alert-badge" style={{ fontSize: '9px', padding: '1px 5px' }}>LOW</span>}
              {s.expiring > 0 && <span className="badge badge-yellow stock-alert-badge" style={{ fontSize: '9px', padding: '1px 5px' }}>EXP:{s.expiring}</span>}
            </div>
          ))}
          <div className="divider" />
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9999BB' }}>
            <span>🟢 Available</span>
            <span>🟡 Expiring soon (&lt;7 days)</span>
            <span>🔴 Low stock (&lt;5 units)</span>
          </div>
        </div>

        {/* Pending Hospital Requests */}
        <div>
          <div className="card mb-16">
            <div className="card-header">
              <div className="card-title">🏥 Pending Hospital Requests</div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/bloodbank/orders')}>View All</button>
            </div>
            {requests.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}><div className="empty-state-title">No pending requests</div></div>
            ) : requests.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#F4F4F8' }}>{req.patientName}</div>
                  <div style={{ fontSize: '12px', color: '#9999BB' }}>{req.units} unit(s) · {req.bloodGroup} · {req.urgency}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="blood-badge-sm">{req.bloodGroup}</span>
                  <span className={`badge ${req.urgency === 'Emergency' ? 'badge-red' : req.urgency === 'Critical' ? 'badge-red' : 'badge-yellow'}`}>{req.urgency}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><div className="card-title">⚡ Quick Actions</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { icon: '✅', label: 'Donor Check-in', path: '/bloodbank/checkin' },
                { icon: '🔬', label: 'Quality Control', path: '/bloodbank/quality' },
                { icon: '⛺', label: 'Manage Camps', path: '/bloodbank/camps' },
                { icon: '📈', label: 'View Reports', path: '/bloodbank/reports' },
              ].map(a => (
                <button key={a.path} className="btn btn-secondary" style={{ flexDirection: 'column', gap: '6px', padding: '16px', height: 'auto' }} onClick={() => navigate(a.path)}>
                  <span style={{ fontSize: '24px' }}>{a.icon}</span>
                  <span style={{ fontSize: '13px' }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Blood Group Cards */}
      <div className="section-header mt-24">
        <div className="section-title">📦 Stock by Blood Group</div>
      </div>
      <div className="inventory-grid">
        {stock?.summary?.map(s => (
          <div key={s.group} className={`blood-group-card ${s.available < 5 ? 'low-stock' : ''}`}>
            <div className="blood-group-name">{s.group}</div>
            <div className="blood-group-count" style={{ color: s.available < 5 ? 'var(--danger)' : '#F4F4F8' }}>{s.available}</div>
            <div className="blood-group-label">Available Units</div>
            <div className="blood-group-status">
              {s.expiring > 0 && <span className="badge badge-yellow" style={{ fontSize: '10px' }}>⚠️ {s.expiring} expiring</span>}
              {s.available < 5 && <span className="badge badge-red" style={{ fontSize: '10px', marginTop: '4px', display: 'block' }}>🔴 Low Stock</span>}
              {s.available >= 5 && s.expiring === 0 && <span className="badge badge-green" style={{ fontSize: '10px' }}>✅ Good</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
