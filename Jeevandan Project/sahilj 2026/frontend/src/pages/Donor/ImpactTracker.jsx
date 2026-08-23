import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function CountUp({ target }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 100;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}</span>;
}

export default function ImpactTracker() {
  const { user } = useAuth();
  const [impact, setImpact] = useState(null);
  const [donor, setDonor] = useState(null);

  useEffect(() => {
    axios.get('/api/impact').then(r => setImpact(r.data));
    if (user?.donorId) axios.get(`/api/donor/${user.donorId}`).then(r => setDonor(r.data));
  }, [user]);

  const milestones = [1, 3, 5, 10, 15, 20, 25, 50];
  const personal = donor?.totalDonations || 0;
  const nextMilestone = milestones.find(m => m > personal) || 50;
  const prevMilestone = milestones.filter(m => m <= personal).pop() || 0;
  const progress = prevMilestone === nextMilestone ? 100 : ((personal - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🌍 Impact Tracker</div>
          <div className="section-subtitle">See the lives you and our community have touched</div>
        </div>
      </div>

      {/* Personal Impact Hero */}
      {donor && (
        <div style={{ background: 'linear-gradient(135deg, rgba(200,16,46,0.2), rgba(139,0,0,0.1))', border: '1px solid rgba(200,16,46,0.3)', borderRadius: '20px', padding: '40px', textAlign: 'center', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8102E' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '18px', color: '#9999BB', marginBottom: '8px' }}>🏆 Your Personal Impact</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '80px', fontWeight: 900, background: 'linear-gradient(135deg, #FF8A8A, #C8102E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: '4px' }}>
              {donor.totalDonations * 3}
            </div>
            <div style={{ fontSize: '20px', color: '#9999BB', marginBottom: '24px' }}>Lives you have saved so far ❤️</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {[
                { label: 'Donations Made', value: donor.totalDonations, icon: '🩸' },
                { label: 'ml Blood Donated', value: `${donor.totalDonations * 450}ml`, icon: '💉' },
                { label: 'Donor Points', value: donor.points?.toLocaleString(), icon: '⭐' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: 800, color: '#F4F4F8' }}>{item.value}</div>
                  <div style={{ fontSize: '12px', color: '#9999BB' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9999BB', marginBottom: '8px' }}>
                <span>{prevMilestone} donations</span>
                <span>Next milestone: {nextMilestone} donations</span>
              </div>
              <div className="progress-bar" style={{ height: '10px' }}>
                <div className="progress-fill red" style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
              <div style={{ fontSize: '12px', color: '#9999BB', marginTop: '8px' }}>{nextMilestone - personal} donation(s) to reach the next milestone</div>
            </div>
          </div>
        </div>
      )}

      {/* Global Stats */}
      <div className="section-header"><div className="section-title">📊 Community Statistics</div></div>
      <div className="grid-4 mb-24">
        {impact && [
          { label: 'Lives Saved', value: impact.livesSaved, icon: '❤️', color: 'red' },
          { label: 'Total Donations', value: impact.totalDonations, icon: '🩸', color: 'orange' },
          { label: 'Active Donors', value: impact.activeDonors, icon: '👥', color: 'blue' },
          { label: 'Blood Units Available', value: impact.unitsAvailable, icon: '🗃️', color: 'green' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value"><CountUp target={s.value} /></div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Blood Type Impact */}
      <div className="card">
        <div className="card-header"><div className="card-title">🩸 Blood Type Distribution Insight</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { group: 'O+', pct: 37, label: 'Most common' },
            { group: 'A+', pct: 28, label: 'Second most' },
            { group: 'B+', pct: 20, label: 'Third most' },
            { group: 'AB+', pct: 5, label: 'Universal recipient' },
            { group: 'O-', pct: 4, label: 'Universal donor 🌟' },
            { group: 'A-', pct: 3, label: 'Rare' },
            { group: 'B-', pct: 2, label: 'Rare' },
            { group: 'AB-', pct: 1, label: 'Rarest type' },
          ].map(item => (
            <div key={item.group} style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
              <div className="blood-badge" style={{ margin: '0 auto 10px' }}>{item.group}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 800, color: '#FF4D6D' }}>{item.pct}%</div>
              <div style={{ fontSize: '11px', color: '#666688', marginTop: '4px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
