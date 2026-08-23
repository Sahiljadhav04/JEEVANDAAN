import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const badgeData = [
  { icon: '🥉', name: 'First Drop', desc: 'Complete your first donation', threshold: 1 },
  { icon: '🩸', name: 'Life Saver', desc: 'Donate 3 times', threshold: 3 },
  { icon: '🥈', name: 'Silver Hero', desc: 'Donate 5 times', threshold: 5 },
  { icon: '🥇', name: 'Gold Hero', desc: 'Donate 8 times', threshold: 8 },
  { icon: '💎', name: 'Platinum Hero', desc: 'Donate 12 times', threshold: 12 },
  { icon: '👑', name: 'Legend', desc: 'Donate 20 times', threshold: 20 },
];

const rewardItems = [
  { icon: '☕', name: 'Free Coffee', desc: 'Redeem at partner cafes', points: 500 },
  { icon: '🍕', name: 'Pizza Voucher', desc: 'Worth ₹200 at Dominos', points: 1000 },
  { icon: '🎬', name: 'Movie Ticket', desc: 'PVR/INOX discount', points: 1500 },
  { icon: '🩺', name: 'Health Checkup', desc: 'Free basic health screening', points: 2000 },
  { icon: '✈️', name: 'Travel Discount', desc: '10% off on MakeMyTrip', points: 3000 },
  { icon: '🏆', name: 'Premium Badge', desc: 'Exclusive LifeFlow badge + T-shirt', points: 5000 },
];

export default function RewardsBadges() {
  const { user } = useAuth();
  const [donor, setDonor] = useState(null);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    if (user?.donorId) axios.get(`/api/donor/${user.donorId}`).then(r => setDonor(r.data));
  }, [user]);

  if (!donor) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">🏆 Rewards & Badges</div>
          <div className="section-subtitle">Earn points and unlock exclusive rewards</div>
        </div>
      </div>

      {/* Donor Card */}
      <div style={{ background: 'linear-gradient(135deg, #1a0505, #0D0D0D)', border: '1px solid rgba(200,16,46,0.4)', borderRadius: '20px', padding: '28px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '120px', opacity: 0.05 }}>🩸</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #C8102E, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700, color: 'white', boxShadow: '0 0 30px rgba(200,16,46,0.5)', flexShrink: 0 }}>
            {donor.name?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 800, color: '#F4F4F8' }}>{donor.name}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span className="blood-badge-sm">{donor.bloodGroup}</span>
              <span className="badge badge-purple">🏅 {donor.badge}</span>
              <span className="badge badge-yellow">⭐ {donor.points?.toLocaleString()} Points</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '48px', fontWeight: 900, color: '#FF4D6D', lineHeight: 1 }}>{donor.totalDonations}</div>
            <div style={{ fontSize: '13px', color: '#9999BB' }}>Total Donations</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="section-header">
        <div className="section-title">🏅 Achievement Badges</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {badgeData.map(badge => {
          const earned = donor.totalDonations >= badge.threshold;
          return (
            <div key={badge.name} className={`badge-card ${earned ? 'earned' : 'locked'}`}>
              <div className="badge-icon" style={{ opacity: earned ? 1 : 0.3 }}>{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.desc}</div>
              {earned ? (
                <div className="badge-earned-label">✓ Earned!</div>
              ) : (
                <div style={{ fontSize: '11px', color: '#666688', marginTop: '8px' }}>{badge.threshold - donor.totalDonations} more donation(s)</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rewards */}
      <div className="section-header">
        <div>
          <div className="section-title">🎁 Redeem Points</div>
          <div className="section-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>You have {donor.points?.toLocaleString()} points to spend</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {rewardItems.map(item => {
          const canRedeem = donor.points >= item.points;
          return (
            <div key={item.name} className="card" style={{ opacity: canRedeem ? 1 : 0.6, border: canRedeem ? '1px solid rgba(200,16,46,0.3)' : undefined }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{item.desc}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-yellow">⭐ {item.points.toLocaleString()} pts</span>
                <button
                  className={`btn btn-sm ${canRedeem ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={!canRedeem}
                  onClick={() => setRedeeming(item)}
                >
                  {canRedeem ? 'Redeem' : 'Need more'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redeem Modal */}
      {redeeming && (
        <div className="modal-overlay" onClick={() => setRedeeming(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🎁 Redeem Reward</div>
              <button className="close-btn" onClick={() => setRedeeming(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: '60px', marginBottom: '12px' }}>{redeeming.icon}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{redeeming.name}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>{redeeming.desc}</div>
                <div className="alert alert-success" style={{ textAlign: 'left' }}>✅ Your redemption code will be sent to your registered mobile number and email within 24 hours.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRedeeming(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { alert('Reward redeemed! Code sent to your contact.'); setRedeeming(null); }}>Confirm Redemption</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
