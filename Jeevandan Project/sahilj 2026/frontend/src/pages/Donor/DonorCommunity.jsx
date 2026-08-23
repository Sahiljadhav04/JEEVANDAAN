import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function DonorCommunity() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [donor, setDonor] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => axios.get('/api/community').then(r => { setPosts(r.data); setLoading(false); });
  useEffect(() => {
    load();
    if (user?.donorId) axios.get(`/api/donor/${user.donorId}`).then(r => setDonor(r.data));
  }, [user]);

  const submitPost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      await axios.post('/api/community', {
        donorId: user?.donorId || 'guest',
        donorName: donor?.name || user?.name || 'Anonymous',
        bloodGroup: donor?.bloodGroup || 'N/A',
        badge: donor?.badge || 'Donor',
        message: newPost,
        avatar: donor?.name?.[0] || 'A',
      });
      setNewPost('');
      load();
    } finally { setPosting(false); }
  };

  const likePost = (id) => {
    axios.post(`/api/community/${id}/like`).then(() => load());
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const topDonors = [...posts].reduce((acc, p) => {
    if (!acc.find(d => d.donorName === p.donorName)) acc.push({ donorName: p.donorName, bloodGroup: p.bloodGroup, badge: p.badge, avatar: p.avatar, likes: p.likes });
    return acc;
  }, []).sort((a, b) => b.likes - a.likes).slice(0, 5);

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">👥 Donor Community</div>
          <div className="section-subtitle">Share stories, inspire others, change lives</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Posts Feed */}
        <div>
          {/* New Post */}
          <div className="card mb-16">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #C8102E, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {donor?.name?.[0] || 'A'}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  className="form-input"
                  placeholder="Share your donation experience, inspire someone today... 🩸"
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical', marginBottom: '10px' }}
                />
                <button className="btn btn-primary btn-sm" onClick={submitPost} disabled={posting || !newPost.trim()}>
                  {posting ? '⏳ Posting...' : '📤 Share Story'}
                </button>
              </div>
            </div>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>
          ) : posts.map(post => (
            <div key={post.id} className="post-card mb-12">
              <div className="post-header">
                <div className="post-avatar">{post.avatar || post.donorName?.[0]}</div>
                <div>
                  <div className="post-name">{post.donorName}</div>
                  <div className="post-meta">
                    <span className="blood-badge-sm" style={{ fontSize: '10px', padding: '1px 7px' }}>{post.bloodGroup}</span>
                    {' '}<span className="badge badge-purple" style={{ fontSize: '10px', padding: '1px 7px' }}>🏅 {post.badge}</span>
                    {' · '}{timeAgo(post.timestamp)}
                  </div>
                </div>
              </div>
              <div className="post-message">{post.message}</div>
              <div className="post-actions">
                <button className="post-action-btn" onClick={() => likePost(post.id)}>
                  ❤️ {post.likes} Likes
                </button>
                <button className="post-action-btn">
                  💬 {post.comments} Comments
                </button>
                <button className="post-action-btn">
                  🔗 Share
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: Top Donors + Stats */}
        <div>
          <div className="card mb-16">
            <div className="card-header"><div className="card-title">🏆 Top Donors This Month</div></div>
            {topDonors.map((d, i) => (
              <div key={d.donorName} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < topDonors.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ fontSize: '20px', width: '28px', textAlign: 'center', fontWeight: 700, color: i === 0 ? '#D97706' : i === 1 ? '#6B7280' : i === 2 ? '#B45309' : 'var(--text-secondary)' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #C8102E, #FF4D6D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '14px' }}>
                  {d.avatar || d.donorName?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{d.donorName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{d.badge}</div>
                </div>
                <span className="blood-badge-sm" style={{ fontSize: '10px' }}>{d.bloodGroup}</span>
              </div>
            ))}
          </div>

          <div className="card mb-16" style={{ background: 'rgba(200,16,46,0.08)', borderColor: 'rgba(200,16,46,0.2)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blood-red)', marginBottom: '12px' }}>💡 Invite Friends</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Every friend you bring in as a donor earns you <strong style={{ color: '#D97706' }}>500 bonus points!</strong>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'monospace', marginBottom: '10px' }}>
              https://lifeflow.in/join?ref={user?.id?.slice(0, 8) || 'donor123'}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard?.writeText('https://lifeflow.in/join'); alert('Referral link copied!'); }}>
              📋 Copy Referral Link
            </button>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.08), rgba(59,130,246,0.05))', borderColor: 'rgba(30,64,175,0.2)' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--bank-blue)', marginBottom: '12px' }}>📢 Awareness Facts</div>
            {[
              '🩸 Every 2 seconds, someone in India needs blood',
              '💡 One donation can save up to 3 lives',
              '⏰ Whole blood donation takes only 8–10 minutes',
              '🔄 Your body replenishes donated blood in 24 hours',
              '📊 Only 7% of India\'s population donates blood',
            ].map((f, i) => (
              <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '6px 0', borderBottom: i < 4 ? '1px solid var(--border-color)' : 'none' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
