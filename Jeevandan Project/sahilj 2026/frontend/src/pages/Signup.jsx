import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import LocationPicker from '../components/LocationPicker';

const Signup = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState(28.6139);
  const [lng, setLng] = useState(77.2090);

  // Donor fields
  const [bloodGroup, setBloodGroup] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Blood Bank fields
  const [bankName, setBankName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Hospital fields
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [department, setDepartment] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Styling properties based on role
  const getRoleConfig = () => {
    switch (role) {
      case 'donor':
        return {
          title: 'Create Donor Account',
          subtitle: 'Join our community of life-savers today.',
          icon: '🩸',
          gradient: 'linear-gradient(135deg, #ff4d4d 0%, #cc0000 100%)',
          themeColor: '#e60000',
        };
      case 'bloodbank':
        return {
          title: 'Register Blood Bank',
          subtitle: 'Partner with us to manage your blood inventory efficiently.',
          icon: '🏦',
          gradient: 'linear-gradient(135deg, #4da6ff 0%, #005ce6 100%)',
          themeColor: '#0066cc',
        };
      case 'hospital':
        return {
          title: 'Register Hospital',
          subtitle: 'Connect your hospital to the blood supply network.',
          icon: '🏥',
          gradient: 'linear-gradient(135deg, #4dffd2 0%, #00b386 100%)',
          themeColor: '#009973',
        };
      default:
        return {
          title: 'Create Account',
          subtitle: 'Sign up to continue.',
          icon: '👤',
          gradient: 'linear-gradient(135deg, #666 0%, #333 100%)',
          themeColor: '#333',
        };
    }
  };

  const config = getRoleConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { 
      setError('Passwords do not match'); 
      return; 
    }
    
    // Basic validation based on role
    if (!name || !email || !password || !contact) {
      setError('Please fill all mandatory common fields (*).');
      return;
    }
    
    if (role === 'donor' && (!bloodGroup || !age)) {
        setError('Please fill all mandatory donor fields (*).');
        return;
    }
    if (role === 'bloodbank' && !bankName) {
        setError('Please fill all mandatory blood bank fields (*).');
        return;
    }
    if (role === 'hospital' && !hospitalName) {
        setError('Please fill all mandatory hospital fields (*).');
        return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name,
        email,
        password,
        role,
        contact,
        address,
      };

      if (role === 'donor') {
        Object.assign(payload, {
          bloodGroup,
          age: parseInt(age),
          weight: weight ? parseFloat(weight) : undefined,
          medicalHistory,
        });
      } else if (role === 'bloodbank') {
         Object.assign(payload, {
          bankName,
          licenseNumber,
        });
      } else if (role === 'hospital') {
        Object.assign(payload, {
          hospitalName,
          hospitalId,
          department,
        });
      }

      const { data } = await axios.post('/api/auth/signup', payload);
      
      setSuccess('Account created successfully! Logging you in...');
      
      // Auto-login
      localStorage.setItem('jeevandan_user', JSON.stringify(data.user));
      localStorage.setItem('jeevandan_token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Redirect
      setTimeout(() => {
         navigate(role === 'donor' ? '/donor/dashboard' : role === 'bloodbank' ? '/bloodbank/dashboard' : '/hospital/dashboard');
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Signup failed. Please try again.');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6', padding: '2rem 1rem' }}>
      
      <div style={{ alignSelf: 'flex-start', marginBottom: '20px', marginLeft: 'max(0px, calc(50% - 400px))' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
          &larr; Back to Home
        </Link>
      </div>

      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '800px', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: 'none', animation: 'fadeIn 0.5s ease-out' }}>
        {/* Top Accent Bar */}
        <div style={{ height: '8px', background: config.gradient, width: '100%' }}></div>
        
        <div style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }} onClick={() => navigate('/')}>
                <Logo size="lg" />
              </div>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{config.icon}</div>
            <h2 style={{ color: '#333', fontWeight: '700', margin: '0 0 10px 0' }}>{config.title}</h2>
            <p style={{ color: '#666', margin: 0 }}>{config.subtitle}</p>
          </div>

          {error && <div className="alert alert-danger" style={{ padding: '12px', backgroundColor: '#ffe6e6', color: '#cc0000', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffcccc' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ padding: '12px', backgroundColor: '#e6ffe6', color: '#009900', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ccffcc' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            
            <h4 style={{ color: config.themeColor, borderBottom: `2px solid ${config.themeColor}33`, paddingBottom: '8px', marginBottom: '20px', fontSize: '1.1rem' }}>Account Details</h4>
            
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Full Name*</label>
                <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
              </div>
              
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Email Address*</label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Password*</label>
                <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Confirm Password*</label>
                <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
              </div>
            </div>

            <h4 style={{ color: config.themeColor, borderBottom: `2px solid ${config.themeColor}33`, paddingBottom: '8px', marginBottom: '20px', marginTop: '30px', fontSize: '1.1rem' }}>
              {role === 'donor' ? 'Donor Details' : role === 'bloodbank' ? 'Blood Bank Details' : 'Hospital Details'}
            </h4>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              
              {/* DONOR SPECIFIC */}
              {role === 'donor' && (
                <>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Blood Group*</label>
                    <select className="form-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s', backgroundColor: '#fff' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'}>
                      <option value="">Select Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Age*</label>
                    <input type="number" className="form-input" value={age} onChange={(e) => setAge(e.target.value)} required min="18" max="65" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Weight (kg)</label>
                    <input type="number" className="form-input" value={weight} onChange={(e) => setWeight(e.target.value)} min="45" style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
                  </div>
                </>
              )}

              {/* BLOOD BANK SPECIFIC */}
              {role === 'bloodbank' && (
                <>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Blood Bank Name*</label>
                    <input type="text" className="form-input" value={bankName} onChange={(e) => setBankName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>License Number</label>
                    <input type="text" className="form-input" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
                  </div>
                </>
              )}

              {/* HOSPITAL SPECIFIC */}
              {role === 'hospital' && (
                <>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Hospital Name*</label>
                    <input type="text" className="form-input" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Registration Number / ID</label>
                    <input type="text" className="form-input" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Department</label>
                    <input type="text" className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
                  </div>
                </>
              )}

              {/* COMMON CONTACT/ADDRESS */}
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Contact Number*</label>
                <input type="tel" className="form-input" value={contact} onChange={(e) => setContact(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <LocationPicker
                  location={address}
                  city={city}
                  lat={lat}
                  lng={lng}
                  label={role === 'donor' ? 'My Primary Location / Address' : role === 'bloodbank' ? 'Blood Bank Location' : 'Hospital Address & Location'}
                  onChange={(locData) => {
                    setAddress(locData.location);
                    if (locData.city) setCity(locData.city);
                    if (locData.lat) setLat(locData.lat);
                    if (locData.lng) setLng(locData.lng);
                  }}
                />
              </div>

              {role === 'donor' && (
                <div className="form-group" style={{ marginBottom: '0', gridColumn: '1 / -1' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>Medical History / Conditions</label>
                  <textarea className="form-input" value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} rows="2" placeholder="List any chronic conditions, recent surgeries, or medications..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', outline: 'none', transition: 'border-color 0.3s', resize: 'vertical' }} onFocus={(e) => e.target.style.borderColor = config.themeColor} onBlur={(e) => e.target.style.borderColor = '#ddd'} />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: config.gradient, 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                transition: 'opacity 0.2s',
                opacity: loading ? 0.7 : 1
              }}
              onMouseOver={(e) => { if(!loading) e.target.style.opacity = 0.9; }}
              onMouseOut={(e) => { if(!loading) e.target.style.opacity = 1; }}
            >
              {loading ? 'Registering...' : `Complete Registration`}
            </button>
            
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
            Already have an account?{' '}
            <Link to={`/login/${role}`} style={{ color: config.themeColor, textDecoration: 'none', fontWeight: '600' }}>
              Login here
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Signup;
