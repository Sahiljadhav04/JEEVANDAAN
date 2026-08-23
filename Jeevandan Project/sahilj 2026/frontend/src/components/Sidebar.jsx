import React, { useState } from 'react';
import Logo from './Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const donorNav = [
  { icon: '📊', label: 'Dashboard', path: '/donor/dashboard' },
  { icon: '👤', label: 'My Profile', path: '/donor/profile' },
  { icon: '📋', label: 'Donation History', path: '/donor/history' },
  { icon: '📍', label: 'Find Camps', path: '/donor/camps' },
  { icon: '🚨', label: 'Emergency Requests', path: '/donor/emergency', badge: true },
  { icon: '📅', label: 'Schedule Donation', path: '/donor/schedule' },
  { icon: '💊', label: 'Health Check', path: '/donor/health-quiz' },
  { icon: '🏆', label: 'Rewards & Badges', path: '/donor/rewards' },
  { icon: '🌍', label: 'Impact Tracker', path: '/donor/impact' },
  { icon: '👥', label: 'Community', path: '/donor/community' },
  { icon: '🔔', label: 'Notifications', path: '/donor/notifications' },
];

const bankNav = [
  { icon: '📊', label: 'Dashboard', path: '/bloodbank/dashboard' },
  { icon: '🗃️', label: 'Inventory & Stock', path: '/bloodbank/inventory' },
  { icon: '⛺', label: 'Camp Management', path: '/bloodbank/camps' },
  { icon: '✅', label: 'Donor Check-in', path: '/bloodbank/checkin' },
  { icon: '🔬', label: 'Quality Control', path: '/bloodbank/quality' },
  { icon: '🚚', label: 'Hospital Orders', path: '/bloodbank/orders' },
  { icon: '📈', label: 'Reports', path: '/bloodbank/reports' },
];

const hospitalNav = [
  { icon: '📊', label: 'Dashboard', path: '/hospital/dashboard' },
  { icon: '🩸', label: 'Patient Blood Request', path: '/hospital/request' },
  { icon: '📡', label: 'Request Tracker', path: '/hospital/tracker' },
  { icon: '📦', label: 'Received Inventory', path: '/hospital/inventory' },
  { icon: '💉', label: 'Transfusion Logs', path: '/hospital/transfusions' },
  { icon: '📣', label: 'Emergency Broadcast', path: '/hospital/emergency' },
  { icon: '📈', label: 'Reports & Billing', path: '/hospital/reports' },
];

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = role === 'donor' ? donorNav : role === 'bloodbank' ? bankNav : hospitalNav;
  const roleLabel = role === 'donor' ? 'Donor' : role === 'bloodbank' ? 'Blood Bank Staff' : 'Hospital Staff';
  const roleEmoji = role === 'donor' ? '🩸' : role === 'bloodbank' ? '🏦' : '🏥';
  const navClass = `${role === 'donor' ? 'donor' : role === 'bloodbank' ? 'bank' : 'hospital'}-nav`;

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <Logo size="sm" isDarkBg={true} />
      </div>

      <div className="sidebar-user">
        <div className={`user-avatar ${role}`}>
          {user?.name?.[0] || roleEmoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
          <div className="user-role">{roleLabel}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? `active ${navClass}` : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">!</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
