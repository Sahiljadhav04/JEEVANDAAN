import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function TransfusionLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ patientName: '', patientId: '', bloodUnit: '', bloodGroup: 'A+', doctor: '', nurse: '', ward: '', reaction: 'None', units: 1, hospitalId: user?.hospitalId || 'h001' });
  const [adding, setAdding] = useState(false);

  const load = () => {
    if (user?.hospitalId) {
      axios.get(`/api/hospital/transfusions/${user.hospitalId}`).then(r => { setLogs(r.data); setLoading(false); });
    }
  };
  useEffect(() => { load(); }, [user]);

  const addLog = async () => {
    setAdding(true);
    await axios.post('/api/hospital/transfusions', { ...form });
    setShowAdd(false);
    setAdding(false);
    setForm({ ...form, patientName: '', patientId: '', bloodUnit: '', reaction: 'None' });
    load();
  };

  const reactions = ['None', 'Minor fever (managed)', 'Chills', 'Urticaria', 'Hemolytic reaction', 'Anaphylaxis'];
  const reactionColor = (r) => r === 'None' ? 'badge-green' : r === 'Minor fever (managed)' || r === 'Chills' ? 'badge-yellow' : 'badge-red';

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">💉 Transfusion Records</div>
          <div className="section-subtitle">{logs.length} transfusions recorded</div>
        </div>
        <button className="btn btn-hospital" onClick={() => setShowAdd(true)}>➕ Log Transfusion</button>
      </div>

      <div className="grid-3 mb-20">
        <div className="stat-card green"><div className="stat-icon green">💉</div><div className="stat-value">{logs.length}</div><div className="stat-label">Total Transfusions</div></div>
        <div className="stat-card green"><div className="stat-icon green">✅</div><div className="stat-value">{logs.filter(l => l.reaction === 'None').length}</div><div className="stat-label">No Reactions</div></div>
        <div className="stat-card orange"><div className="stat-icon orange">⚠️</div><div className="stat-value">{logs.filter(l => l.reaction !== 'None').length}</div><div className="stat-label">Adverse Reactions</div></div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Date & Time</th><th>Patient</th><th>Blood Unit</th><th>Blood Group</th><th>Doctor</th><th>Ward</th><th>Reaction</th></tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9999BB' }}>No transfusion records yet</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '12px', color: '#9999BB' }}>{new Date(log.date).toLocaleString('en-IN')}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#F4F4F8' }}>{log.patientName}</div>
                    <div style={{ fontSize: '11px', color: '#9999BB' }}>{log.patientId}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9999BB' }}>{log.bloodUnit}</td>
                  <td><span className="blood-badge-sm">{log.bloodGroup}</span></td>
                  <td style={{ color: '#9999BB' }}>{log.doctor}</td>
                  <td><span className="badge badge-blue">{log.ward}</span></td>
                  <td><span className={`badge ${reactionColor(log.reaction)}`}>{log.reaction}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">💉 Log New Transfusion</div>
              <button className="close-btn" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Patient Name</label>
                  <input className="form-input hospital-focus" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Patient ID</label>
                  <input className="form-input hospital-focus" placeholder="PAT-001" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Unit ID</label>
                  <input className="form-input hospital-focus" placeholder="BU-0001" value={form.bloodUnit} onChange={e => setForm({ ...form, bloodUnit: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Administering Doctor</label>
                  <input className="form-input hospital-focus" placeholder="Dr. Name" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ward / Department</label>
                  <select className="form-select" value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })}>
                    {['ICU', 'Surgery', 'Oncology', 'Maternity', 'Emergency', 'General', 'Pediatrics'].map(w => <option key={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Post-Transfusion Reaction</label>
                <select className="form-select" value={form.reaction} onChange={e => setForm({ ...form, reaction: e.target.value })}>
                  {reactions.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-hospital" onClick={addLog} disabled={adding || !form.patientName}>{adding ? '⏳ Logging...' : '✅ Save Record'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
