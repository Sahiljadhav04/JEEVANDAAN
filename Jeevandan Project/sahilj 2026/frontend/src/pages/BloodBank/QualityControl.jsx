import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function QualityControl() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('Pending');

  const load = () => axios.get('/api/bloodbank/inventory').then(r => { setUnits(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const updateTests = async (id, tests) => {
    setUpdating(id);
    const allClear = Object.values(tests).every(v => v === 'Negative');
    await axios.put(`/api/bloodbank/inventory/${id}`, { ...tests, status: allClear ? 'Tested' : 'Discarded' });
    setUpdating(null);
    load();
  };

  const tests = ['hivTest', 'hepatitisB', 'hepatitisC', 'malaria', 'syphilis'];
  const testLabels = { hivTest: 'HIV', hepatitisB: 'Hep-B', hepatitisC: 'Hep-C', malaria: 'Malaria', syphilis: 'Syphilis' };

  const filtered = units.filter(u => {
    if (filter === 'Pending') return u.hivTest === 'Pending' || u.hepatitisB === 'Pending';
    if (filter === 'Cleared') return u.status === 'Tested';
    if (filter === 'Failed') return u.status === 'Discarded';
    return true;
  });

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;

  const pendingCount = units.filter(u => u.hivTest === 'Pending').length;
  const clearedCount = units.filter(u => u.status === 'Tested').length;
  const failedCount = units.filter(u => u.status === 'Discarded').length;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🔬 Quality Control & Testing</div>
          <div className="section-subtitle">Screen all units before they're available for transfusion</div>
        </div>
      </div>

      <div className="grid-3 mb-20">
        <div className="stat-card orange"><div className="stat-icon orange">⏳</div><div className="stat-value">{pendingCount}</div><div className="stat-label">Pending Tests</div></div>
        <div className="stat-card green"><div className="stat-icon green">✅</div><div className="stat-value">{clearedCount}</div><div className="stat-label">Tested & Safe</div></div>
        <div className="stat-card red"><div className="stat-icon red">❌</div><div className="stat-value">{failedCount}</div><div className="stat-label">Failed / Discarded</div></div>
      </div>

      <div className="filter-chips mb-20">
        {['All', 'Pending', 'Cleared', 'Failed'].map(f => (
          <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Unit ID</th>
                <th>Blood Group</th>
                <th>Collected</th>
                <th>HIV</th>
                <th>Hep-B</th>
                <th>Hep-C</th>
                <th>Malaria</th>
                <th>Syphilis</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map(u => {
                const isPending = u.hivTest === 'Pending';
                const renderTest = (val) => (
                  <span className={`badge ${val === 'Negative' ? 'badge-green' : val === 'Positive' ? 'badge-red' : 'badge-yellow'}`} style={{ fontSize: '10px' }}>
                    {val === 'Negative' ? '✓' : val === 'Pending' ? '?' : '✗'} {val}
                  </span>
                );
                return (
                  <tr key={u.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{u.id}</span></td>
                    <td><span className="blood-badge-sm">{u.bloodGroup}</span></td>
                    <td style={{ color: '#9999BB', fontSize: '12px' }}>{u.collectedDate}</td>
                    <td>{renderTest(u.hivTest)}</td>
                    <td>{renderTest(u.hepatitisB)}</td>
                    <td>{renderTest(u.hepatitisC)}</td>
                    <td>{renderTest(u.malaria)}</td>
                    <td>{renderTest(u.syphilis)}</td>
                    <td>
                      <span className={`badge ${u.status === 'Tested' ? 'badge-green' : u.status === 'Discarded' ? 'badge-red' : u.status === 'Available' ? 'badge-blue' : 'badge-yellow'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {isPending && (
                        <button
                          className="btn btn-bank btn-sm"
                          disabled={updating === u.id}
                          onClick={() => updateTests(u.id, {
                            hivTest: 'Negative', hepatitisB: 'Negative',
                            hepatitisC: 'Negative', malaria: 'Negative', syphilis: 'Negative'
                          })}
                        >
                          {updating === u.id ? '⏳' : '✅ Mark Safe'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-16" style={{ background: 'rgba(26,35,126,0.15)', borderColor: 'rgba(57,73,171,0.3)' }}>
        <div className="card-header"><div className="card-title" style={{ color: '#7986CB' }}>🧪 Testing Protocol</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { test: 'HIV 1 & 2', method: 'ELISA', time: '2-4 hours' },
            { test: 'Hepatitis B (HBsAg)', method: 'Rapid/ELISA', time: '1-2 hours' },
            { test: 'Hepatitis C (Anti-HCV)', method: 'ELISA', time: '2-4 hours' },
            { test: 'Malaria (P. falciparum)', method: 'RDT/Microscopy', time: '30 mins' },
            { test: 'Syphilis (VDRL)', method: 'RPR', time: '1-2 hours' },
          ].map(t => (
            <div key={t.test} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, color: '#F4F4F8', fontSize: '13px', marginBottom: '4px' }}>{t.test}</div>
              <div style={{ fontSize: '11px', color: '#9999BB' }}>Method: {t.method}</div>
              <div style={{ fontSize: '11px', color: '#9999BB' }}>Time: {t.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
