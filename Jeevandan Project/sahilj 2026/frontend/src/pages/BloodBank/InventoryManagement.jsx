import React, { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_COLORS = {
  Available: 'badge-green', Tested: 'badge-blue', Reserved: 'badge-yellow',
  Issued: 'badge-gray', Expired: 'badge-red', Discarded: 'badge-red'
};

export default function InventoryManagement() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [bgFilter, setBgFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ bloodGroup: 'A+', volume: 450, collectedDate: new Date().toISOString().split('T')[0], batchNo: '', donorId: 'd001' });
  const [adding, setAdding] = useState(false);

  const load = () => axios.get('/api/bloodbank/inventory').then(r => { setUnits(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const addUnit = async () => {
    setAdding(true);
    const expiry = new Date(addForm.collectedDate);
    expiry.setDate(expiry.getDate() + 35);
    await axios.post('/api/bloodbank/inventory', { ...addForm, expiryDate: expiry.toISOString().split('T')[0] });
    setShowAdd(false);
    setAdding(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await axios.put(`/api/bloodbank/inventory/${id}`, { status });
    load();
  };

  const today = new Date().toISOString().split('T')[0];
  const groups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statuses = ['All', 'Available', 'Tested', 'Reserved', 'Issued', 'Expired'];

  const filtered = units.filter(u => {
    const matchBg = bgFilter === 'All' || u.bloodGroup === bgFilter;
    const matchStatus = filter === 'All' || u.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !search
      || u.id.toLowerCase().includes(q)
      || u.batchNo?.toLowerCase().includes(q)
      || u.bloodGroup?.toLowerCase().includes(q)
      || u.status?.toLowerCase().includes(q)
      || u.donorId?.toLowerCase().includes(q);
    return matchBg && matchStatus && matchSearch;
  });

  const getDaysLeft = (expiry) => Math.ceil((new Date(expiry) - new Date()) / 86400000);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading inventory...</span></div>;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🗃️ Inventory & Stock Management</div>
          <div className="section-subtitle">{units.length} total units · {units.filter(u => u.status === 'Available').length} available</div>
        </div>
        <button className="btn btn-bank" onClick={() => setShowAdd(true)}>➕ Add New Unit</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        <div className="search-bar" style={{ width: '220px' }}>
          <span>🔍</span>
          <input placeholder="Search by Unit ID, Batch, Blood Group (e.g. A+)..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-chips" style={{ margin: 0 }}>
          {groups.map(g => <button key={g} className={`chip ${bgFilter === g ? 'active' : ''}`} onClick={() => setBgFilter(g)}>{g}</button>)}
        </div>
        <div className="filter-chips" style={{ margin: 0 }}>
          {statuses.map(s => <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>)}
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Unit ID</th><th>Blood Group</th><th>Batch No</th><th>Collected</th><th>Expires</th><th>Days Left</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(u => {
                const days = getDaysLeft(u.expiryDate);
                return (
                  <tr key={u.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{u.id}</span></td>
                    <td><span className="blood-badge-sm">{u.bloodGroup}</span></td>
                    <td style={{ color: '#9999BB', fontSize: '12px' }}>{u.batchNo}</td>
                    <td style={{ color: '#9999BB' }}>{u.collectedDate}</td>
                    <td style={{ color: days <= 7 ? 'var(--warning)' : '#9999BB' }}>{u.expiryDate}</td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: days <= 0 ? 'var(--danger)' : days <= 7 ? 'var(--warning)' : 'var(--success)' }}>
                        {days <= 0 ? 'Expired' : `${days}d`}
                      </span>
                    </td>
                    <td><span className={`badge ${STATUS_COLORS[u.status] || 'badge-gray'}`}>{u.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {u.status === 'Available' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(u.id, 'Reserved')}>Reserve</button>
                        )}
                        {(u.status === 'Available' || u.status === 'Tested') && (
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(u.id, 'Issued')}>Issue</button>
                        )}
                        {days <= 0 && u.status !== 'Discarded' && (
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(u.id, 'Discarded')}>Discard</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && <div style={{ textAlign: 'center', padding: '12px', color: '#9999BB', fontSize: '13px' }}>Showing 50 of {filtered.length} results. Use filters to narrow down.</div>}
      </div>

      {/* Add Unit Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">➕ Add New Blood Unit</div>
              <button className="close-btn" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select" value={addForm.bloodGroup} onChange={e => setAddForm({ ...addForm, bloodGroup: e.target.value })}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Volume (ml)</label>
                  <input type="number" className="form-input bank-focus" value={addForm.volume} onChange={e => setAddForm({ ...addForm, volume: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Collection Date</label>
                  <input type="date" className="form-input bank-focus" value={addForm.collectedDate} onChange={e => setAddForm({ ...addForm, collectedDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Batch Number</label>
                  <input className="form-input bank-focus" placeholder="e.g. BAT-2026-001" value={addForm.batchNo} onChange={e => setAddForm({ ...addForm, batchNo: e.target.value })} />
                </div>
              </div>
              <div className="alert alert-info">ℹ️ Expiry date is automatically calculated as 35 days from collection date.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-bank" onClick={addUnit} disabled={adding}>{adding ? '⏳ Adding...' : '✅ Add Unit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
