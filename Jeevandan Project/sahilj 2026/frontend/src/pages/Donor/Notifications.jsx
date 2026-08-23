import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (user?.id) {
      axios.get(`/api/notifications/${user.id}`).then(r => { setNotifications(r.data); setLoading(false); });
    }
  };

  useEffect(() => { load(); }, [user]);

  const markRead = async (id) => {
    await axios.put(`/api/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => axios.put(`/api/notifications/${n.id}/read`)));
    load();
  };

  const iconMap = { emergency: '🚨', eligibility: '✅', camp: '⛺', info: 'ℹ️' };
  const unread = notifications.filter(n => !n.read).length;

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🔔 Notifications</div>
          <div className="section-subtitle">{unread > 0 ? `${unread} unread notifications` : 'All caught up!'}</div>
        </div>
        {unread > 0 && <button className="btn btn-secondary" onClick={markAllRead}>✅ Mark All Read</button>}
      </div>

      {notifications.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🔔</div><div className="empty-state-title">No notifications</div><div className="empty-state-desc">We'll alert you about emergencies, eligibility, and upcoming camps</div></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(n => (
            <div key={n.id} style={{ background: n.read ? 'var(--bg-card)' : 'rgba(200,16,46,0.06)', border: `1px solid ${n.read ? 'var(--border-color)' : 'rgba(200,16,46,0.2)'}`, borderRadius: '12px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '28px', flexShrink: 0 }}>{iconMap[n.type] || 'ℹ️'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{n.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{n.message}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{new Date(n.timestamp).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {!n.read && <span className="badge badge-red" style={{ fontSize: '10px' }}>NEW</span>}
                {!n.read && <button className="btn btn-secondary btn-sm" onClick={() => markRead(n.id)}>Mark Read</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mt-24">
        <div className="card-header"><div className="card-title">⚙️ Notification Settings</div></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Emergency Blood Requests', desc: 'Get alerts when blood matching your group is urgently needed', enabled: true },
            { label: 'Eligibility Reminder', desc: 'Alert when you become eligible to donate again', enabled: true },
            { label: 'Camp Reminders', desc: 'Upcoming donation camp notifications', enabled: true },
            { label: 'Community Activity', desc: 'Likes and comments on your posts', enabled: false },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
              <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: item.enabled ? 'var(--blood-red)' : 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ position: 'absolute', width: '18px', height: '18px', borderRadius: '50%', background: 'white', top: '2px', left: item.enabled ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
