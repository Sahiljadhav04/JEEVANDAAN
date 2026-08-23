import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const roleConfig = {
  donor: {
    icon: '🩸',
    title: 'Donor Login',
    subtitle: 'Access your donor dashboard',
    className: 'login-donor',
    demos: [
      { label: 'Arjun Sharma (B+, Gold Hero, 8 donations)', email: 'arjun@example.com', password: 'donor123' },
      { label: 'Priya Patel (O+, Platinum Hero, 12 donations)', email: 'priya@example.com', password: 'donor123' },
    ]
  },
  bloodbank: {
    icon: '🏦',
    title: 'Blood Bank Login',
    subtitle: 'Manage inventory & collections',
    className: 'login-bloodbank',
    demos: [
      { label: 'LifeFlow Blood Bank Staff', email: 'bb@lifeflow.com', password: 'bank123' },
    ]
  },
  hospital: {
    icon: '🏥',
    title: 'Hospital Login',
    subtitle: 'Patient blood management',
    className: 'login-hospital',
    demos: [
      { label: 'AIIMS Hospital Staff', email: 'hospital@aiims.com', password: 'hospital123' },
    ]
  },
};

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const config = roleConfig[role] || roleConfig.donor;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.user.role === 'donor') navigate('/donor/dashboard');
      else if (data.user.role === 'bloodbank') navigate('/bloodbank/dashboard');
      else navigate('/hospital/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  const gradients = {
    donor: 'linear-gradient(135deg, #C8102E, #FF4D6D)',
    bloodbank: 'linear-gradient(135deg, #1A237E, #3949AB)',
    hospital: 'linear-gradient(135deg, #00695C, #26A69A)',
  };

  return (
    <div className="login-page">
      <div className="landing-bg" />
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div className="login-form-box" style={{ background: '#FFFFFF', borderRadius: '20px', padding: '40px', border: '1px solid var(--border-color)', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', borderRadius: '20px 20px 0 0', background: gradients[role] || gradients.donor }} />
          <div className="login-header" style={{ textCenter: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '12px' }} onClick={() => navigate('/')}>
              <Logo size="lg" />
            </div>
            <div className="login-logo" style={{ fontSize: '36px', marginTop: '4px' }}>{config.icon}</div>
            <div className="login-title">{config.title}</div>
            <div className="login-subtitle">{config.subtitle}</div>
          </div>

          {error && <div className="alert alert-danger">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', marginBottom: '16px', padding: '12px', background: gradients[role] || gradients.donor, color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} disabled={loading}>
              {loading ? '⏳ Logging in...' : `🚀 Login`}
            </button>
          </form>

          <div className="demo-creds">
            <div className="demo-creds-title">🎯 Demo Accounts — Click Fill to auto-fill</div>
            {config.demos.map((demo, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '8px', background: 'var(--bg-elevated)', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>{demo.label}</div>
                  <div className="demo-cred-item">{demo.email} / {demo.password}</div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEmail(demo.email); setPassword(demo.password); }}>Fill</button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <span style={{ color: 'var(--blood-red)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/signup/${role}`)}>Sign up here</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>← Back to Role Selection</button>
          </div>
        </div>
      </div>
    </div>
  );
}
