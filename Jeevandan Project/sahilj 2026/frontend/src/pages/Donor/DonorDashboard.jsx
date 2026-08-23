import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function CountUp({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString()}</span>;
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [impact, setImpact] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.donorId) {
      Promise.all([
        axios.get(`/api/donor/${user.donorId}`),
        axios.get('/api/impact'),
        axios.get('/api/emergency'),
        axios.get(`/api/notifications/${user.id}`),
      ]).then(([d, imp, em, notif]) => {
        setDonor(d.data);
        setImpact(imp.data);
        setEmergencies(em.data.filter(e => e.status === 'Active').slice(0, 3));
        setNotifications(notif.data.filter(n => !n.read).slice(0, 3));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const getDaysUntilEligible = () => {
    if (!donor?.eligibleDate) return 0;
    const days = Math.ceil((new Date(donor.eligibleDate) - new Date()) / 86400000);
    return Math.max(0, days);
  };
  const daysLeft = getDaysUntilEligible();

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading dashboard...</span></div>;

  return (
    <div className="page-container fade-in">
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(200,16,46,0.15), rgba(139,0,0,0.08))', border: '1px solid rgba(200,16,46,0.25)', borderRadius: '16px', padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '80px', opacity: 0.07 }}>🩸</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #C8102E, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 700, color: 'white', boxShadow: '0 0 25px rgba(200,16,46,0.4)', flexShrink: 0 }}>
            {donor?.name?.[0] || 'A'}
          </div>
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 700, color: '#F4F4F8', marginBottom: '8px' }}>Welcome back, {donor?.name?.split(' ')[0]}! 👋</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="blood-badge-sm">{donor?.bloodGroup}</span>
              <span className="badge badge-purple">🏅 {donor?.badge}</span>
              {daysLeft === 0 && <span className="badge badge-green">✅ Eligible to Donate Today!</span>}
              {donor?.lastDonation && <span style={{ fontSize: '13px', color: '#9999BB' }}>Last donation: {donor.lastDonation}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-24">
        <div className="stat-card red">
          <div className="stat-icon red">🩸</div>
          <div className="stat-value"><CountUp target={donor?.totalDonations || 0} /></div>
          <div className="stat-label">Total Donations</div>
          <div className="stat-change up">+2 this year</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange">❤️</div>
          <div className="stat-value"><CountUp target={(donor?.totalDonations || 0) * 3} /></div>
          <div className="stat-label">Lives Saved</div>
          <div className="stat-change up">You're a hero!</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple">⭐</div>
          <div className="stat-value"><CountUp target={donor?.points || 0} /></div>
          <div className="stat-label">Donor Points</div>
          <div className="stat-change up">{donor?.badge}</div>
        </div>
        <div className={`stat-card ${daysLeft === 0 ? 'green' : 'blue'}`}>
          <div className={`stat-icon ${daysLeft === 0 ? 'green' : 'blue'}`}>📅</div>
          <div className="stat-value">{daysLeft === 0 ? 'NOW' : `${daysLeft}d`}</div>
          <div className="stat-label">Days to Next Eligible</div>
          <div className="stat-change up">{daysLeft === 0 ? 'You can donate today!' : `Eligible: ${donor?.eligibleDate}`}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Emergency Requests */}
        <div>
          <div className="section-header">
            <div>
              <div className="section-title">🚨 Emergency Requests</div>
              <div className="section-subtitle">Blood needed urgently near you</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/donor/emergency')}>View All</button>
          </div>

          {emergencies.length === 0 ? (
            <div className="card">
              <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-title">No urgent requests</div><div className="empty-state-desc">All clear in your area</div></div>
            </div>
          ) : emergencies.map(em => (
            <div key={em.id} className="emergency-card mb-12">
              <div style={{ paddingLeft: '12px' }}>
                <div className={`emergency-urgency urgency-${em.urgency.toLowerCase()}`}>{em.urgency}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div className="blood-badge" style={{ width: '38px', height: '38px', fontSize: '11px' }}>{em.bloodGroup}</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#F4F4F8' }}>{em.patientName}</div>
                    <div style={{ fontSize: '12px', color: '#9999BB' }}>{em.hospital} · {em.distance}km away</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#9999BB', marginBottom: '12px' }}>{em.description}</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/donor/emergency')}>🩸 I Can Donate</button>
                  <a href={`tel:${em.contact}`} className="btn btn-secondary btn-sm">📞 Call</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div>
          {/* Notifications */}
          <div className="section-header">
            <div><div className="section-title">🔔 Notifications</div></div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/donor/notifications')}>View All</button>
          </div>
          <div className="card mb-20">
            {notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}><div className="empty-state-title">All caught up!</div></div>
            ) : notifications.map((n, i) => (
              <div key={n.id} style={{ padding: '12px 0', borderBottom: i < notifications.length - 1 ? '1px solid var(--border-color)' : 'none', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '20px' }}>{n.type === 'emergency' ? '🚨' : n.type === 'eligibility' ? '✅' : '⛺'}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#F4F4F8' }}>{n.title}</div>
                  <div style={{ fontSize: '12px', color: '#9999BB' }}>{n.message}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Global Impact */}
          <div className="card">
            <div className="card-header"><div className="card-title">🌍 Global Impact</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { value: impact?.livesSaved || 0, label: 'Lives Saved', color: '#FF4D6D' },
                { value: impact?.totalDonations || 0, label: 'Total Donations', color: '#FFB800' },
                { value: impact?.activeDonors || 0, label: 'Active Donors', color: '#00D084' },
                { value: impact?.totalCamps || 0, label: 'Donation Camps', color: '#00B4D8' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '26px', fontWeight: 800, color: item.color }}><CountUp target={item.value} /></div>
                  <div style={{ fontSize: '11px', color: '#9999BB' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-20">
        <div className="card-header"><div className="card-title">⚡ Quick Actions</div></div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { label: '📍 Find Camps', path: '/donor/camps' },
            { label: '📋 Donation History', path: '/donor/history' },
            { label: '🏆 My Rewards', path: '/donor/rewards' },
            { label: '💊 Health Check', path: '/donor/health-quiz' },
            { label: '👥 Community', path: '/donor/community' },
            { label: '🌍 Impact Tracker', path: '/donor/impact' },
          ].map(a => (
            <button key={a.path} className="btn btn-secondary" onClick={() => navigate(a.path)}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
