import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const Landing = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [scrolled, setScrolled] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [signupMenuOpen, setSignupMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const colors = {
    bloodRed: '#C8102E',
    darkGray: '#1A1A2E',
    offWhite: '#FAF9F6',
    lightPink: '#FFF5F7',
    background: '#F8F9FA',
    darkFooter: '#0F0F1A',
    white: '#FFFFFF',
    textSecondary: '#5A6072',
    border: '#E2E8F0',
  };

  const roles = [
    {
      role: 'donor',
      title: 'Blood Donor',
      subtitle: 'I want to donate blood & save lives',
      icon: '🩸',
      gradient: 'linear-gradient(135deg, #E51436 0%, #C8102E 100%)',
      badgeColor: 'rgba(200, 16, 46, 0.1)',
      features: [
        'Find nearby blood camps on live map',
        'Receive instant local emergency alerts',
        'Download verified digital donor certificates',
        'Track personal health history & eligibility',
        'Earn donor badges, points & rewards'
      ],
      stats: '84,000+ Active Donors'
    },
    {
      role: 'bloodbank',
      title: 'Blood Bank',
      subtitle: 'I manage inventory & donation camps',
      icon: '🏦',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      badgeColor: 'rgba(37, 99, 235, 0.1)',
      features: [
        'Real-time blood stock inventory management',
        'Run HIV, Hepatitis & Serology Quality Control',
        'Organize & schedule mobile donation camps',
        'Walk-in donor check-in & e-certificate generation',
        'Fulfill emergency hospital blood orders'
      ],
      stats: '2,400+ Partner Blood Banks'
    },
    {
      role: 'hospital',
      title: 'Hospital Staff',
      subtitle: 'I need blood supplies for patients',
      icon: '🏥',
      gradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
      badgeColor: 'rgba(13, 148, 136, 0.1)',
      features: [
        'Raise instant patient blood unit requisitions',
        'Track order dispatch & delivery status live',
        'Log patient blood transfusions & reactions',
        'Broadcast critical emergency alerts to nearby donors',
        'Comprehensive clinical usage reports'
      ],
      stats: '1,200+ Registered Hospitals'
    }
  ];

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: colors.background, color: colors.darkGray, minHeight: '100vh' }}>
      
      {/* HEADER / NAVIGATION */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 1)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${scrolled ? colors.border : 'transparent'}`,
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
        zIndex: 1000,
        padding: '14px 6%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.3s ease',
      }}>
        {/* LOGO */}
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo size={isMobile ? 'sm' : 'md'} isDarkBg={false} />
        </div>

        {/* NAVIGATION LINKS */}
        {!isMobile && (
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#home" style={{ textDecoration: 'none', color: colors.darkGray, fontWeight: 600, fontSize: '15px' }} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: colors.textSecondary, fontWeight: 500, fontSize: '15px' }} onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a>
            <a href="#roles" style={{ textDecoration: 'none', color: colors.textSecondary, fontWeight: 500, fontSize: '15px' }} onClick={(e) => { e.preventDefault(); scrollToSection('roles'); }}>Portals</a>
            <a href="#features" style={{ textDecoration: 'none', color: colors.textSecondary, fontWeight: 500, fontSize: '15px' }} onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#impact" style={{ textDecoration: 'none', color: colors.textSecondary, fontWeight: 500, fontSize: '15px' }} onClick={(e) => { e.preventDefault(); scrollToSection('impact'); }}>Impact</a>
          </nav>
        )}

        {/* HEADER ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
          
          {/* LOGIN DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setLoginMenuOpen(!loginMenuOpen); setSignupMenuOpen(false); }}
              style={{
                padding: '9px 18px',
                backgroundColor: '#FFFFFF',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.darkGray,
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.2s'
              }}
            >
              <span>🔑 Login</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {loginMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: `1px solid ${colors.border}`,
                padding: '8px',
                minWidth: '200px',
                zIndex: 1001,
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700, color: '#8888AA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select Login Role
                </div>
                <div
                  onClick={() => { setLoginMenuOpen(false); navigate('/login/donor'); }}
                  style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: colors.darkGray, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.lightPink}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>🩸</span> Donor Login
                </div>
                <div
                  onClick={() => { setLoginMenuOpen(false); navigate('/login/bloodbank'); }}
                  style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: colors.darkGray, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>🏦</span> Blood Bank Login
                </div>
                <div
                  onClick={() => { setLoginMenuOpen(false); navigate('/login/hospital'); }}
                  style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: colors.darkGray, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDFA'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>🏥</span> Hospital Login
                </div>
              </div>
            )}
          </div>

          {/* SIGN UP DROPDOWN */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setSignupMenuOpen(!signupMenuOpen); setLoginMenuOpen(false); }}
              style={{
                padding: '9px 20px',
                background: 'linear-gradient(135deg, #E51436 0%, #C8102E 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(200, 16, 46, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              <span>✨ Sign Up</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {signupMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: `1px solid ${colors.border}`,
                padding: '8px',
                minWidth: '220px',
                zIndex: 1001,
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700, color: '#8888AA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select Account Type
                </div>
                <div
                  onClick={() => { setSignupMenuOpen(false); navigate('/signup/donor'); }}
                  style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: colors.darkGray, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.lightPink}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>🩸</span> Register as Donor
                </div>
                <div
                  onClick={() => { setSignupMenuOpen(false); navigate('/signup/bloodbank'); }}
                  style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: colors.darkGray, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>🏦</span> Register Blood Bank
                </div>
                <div
                  onClick={() => { setSignupMenuOpen(false); navigate('/signup/hospital'); }}
                  style={{ padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: colors.darkGray, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FDFA'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span>🏥</span> Register Hospital
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section id="home" style={{
        padding: isMobile ? '120px 6% 60px' : '150px 6% 80px',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: '60px'
      }}>
        <div style={{ flex: '1', maxWidth: isMobile ? '100%' : '58%' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            backgroundColor: colors.lightPink,
            border: '1px solid rgba(200, 16, 46, 0.2)',
            color: colors.bloodRed,
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            <span>🩸</span> India's Integrated Blood Management Platform 🇮🇳
          </div>

          <h1 style={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 900,
            fontSize: isMobile ? '38px' : '58px',
            lineHeight: 1.1,
            margin: '0 0 20px 0',
            color: colors.darkGray,
            letterSpacing: '-0.02em'
          }}>
            Every Drop of Blood<br />
            Is a <span style={{
              background: 'linear-gradient(135deg, #E51436 0%, #C8102E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Gift of Life</span>
          </h1>

          <p style={{
            fontSize: '18px',
            lineHeight: 1.6,
            color: colors.textSecondary,
            marginBottom: '36px',
            maxWidth: '560px'
          }}>
            <strong>JeevanDaan</strong> bridges donors, certified blood banks, and critical hospital wards in real time. Saving lives has never been this seamless.
          </p>

          {/* HERO CTAS */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button
              onClick={() => navigate('/signup/donor')}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #E51436 0%, #C8102E 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(200, 16, 46, 0.35)',
                transition: 'transform 0.2s'
              }}
            >
              Become a Donor Now →
            </button>

            <button
              onClick={() => scrollToSection('roles')}
              style={{
                padding: '16px 28px',
                backgroundColor: '#FFFFFF',
                border: `2px solid ${colors.border}`,
                borderRadius: '12px',
                color: colors.darkGray,
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              Explore Portals
            </button>
          </div>

          {/* TRUST BADGES */}
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: colors.textSecondary, fontWeight: 600, flexWrap: 'wrap' }}>
            <span>✓ 100% Free Service</span>
            <span>✓ Verified Blood Banks</span>
            <span>✓ 24/7 Emergency Dispatch</span>
          </div>

        </div>

        {/* HERO RIGHT / VISUAL CARDS */}
        <div style={{ flex: '1', width: '100%', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
          
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>❤️</div>
            <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '32px', fontWeight: 900, color: colors.bloodRed, margin: '0 0 4px 0' }}>36,00,000+</h3>
            <p style={{ margin: 0, fontWeight: 600, color: colors.darkGray }}>Lives Saved Nationwide</p>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🩸</div>
            <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '32px', fontWeight: 900, color: colors.darkGray, margin: '0 0 4px 0' }}>84,000+</h3>
            <p style={{ margin: 0, fontWeight: 600, color: colors.textSecondary }}>Active Registered Donors</p>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏥</div>
            <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '32px', fontWeight: 900, color: '#0D9488', margin: '0 0 4px 0' }}>1,200+</h3>
            <p style={{ margin: 0, fontWeight: 600, color: colors.textSecondary }}>Connected Hospitals</p>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⛺</div>
            <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '32px', fontWeight: 900, color: '#2563EB', margin: '0 0 4px 0' }}>2,400+</h3>
            <p style={{ margin: 0, fontWeight: 600, color: colors.textSecondary }}>Camps Organized</p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '80px 6%', backgroundColor: '#FFFFFF', borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '38px', color: colors.darkGray, marginBottom: '12px' }}>
            How <Logo size="sm" isDarkBg={false} showTagline={false} /> Works
          </h2>
          <p style={{ fontSize: '17px', color: colors.textSecondary, marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
            Three simple steps connecting compassionate donors to critical healthcare demands.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '32px' }}>
            
            <div style={{ padding: '36px 28px', backgroundColor: colors.background, borderRadius: '20px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: colors.bloodRed, color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 20px' }}>1</div>
              <div style={{ fontSize: '44px', marginBottom: '16px' }}>📝</div>
              <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>Simple Registration</h3>
              <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.6 }}>Create your donor, blood bank, or hospital profile in under 2 minutes.</p>
            </div>

            <div style={{ padding: '36px 28px', backgroundColor: colors.background, borderRadius: '20px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: colors.bloodRed, color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 20px' }}>2</div>
              <div style={{ fontSize: '44px', marginBottom: '16px' }}>⚡</div>
              <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>Real-time Matching</h3>
              <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.6 }}>Emergency patient blood requests match with nearby compatible donors instantly.</p>
            </div>

            <div style={{ padding: '36px 28px', backgroundColor: colors.background, borderRadius: '20px', border: `1px solid ${colors.border}`, textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: colors.bloodRed, color: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 20px' }}>3</div>
              <div style={{ fontSize: '44px', marginBottom: '16px' }}>🩸</div>
              <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>Save Human Lives</h3>
              <p style={{ color: colors.textSecondary, fontSize: '15px', lineHeight: 1.6 }}>Donate at blood camps or hospitals, earn digital certificates & track your impact.</p>
            </div>

          </div>
        </div>
      </section>

      {/* PORTAL SELECTION / ROLE CARDS */}
      <section id="roles" style={{ padding: '90px 6%', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '40px', color: colors.darkGray, marginBottom: '12px' }}>
            Select Your Portal
          </h2>
          <p style={{ fontSize: '18px', color: colors.textSecondary, maxWidth: '600px', margin: '0 auto' }}>
            Choose your role to access your dedicated dashboard, login, or create a new account.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '32px' }}>
          {roles.map((r) => (
            <div
              key={r.role}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                border: `1px solid ${colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
            >
              {/* ACCENT LINE */}
              <div style={{ height: '8px', background: r.gradient }} />

              <div style={{ padding: '36px 30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>{r.icon}</div>
                <h3 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '24px', fontWeight: 900, color: colors.darkGray, marginBottom: '6px' }}>{r.title}</h3>
                <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '24px', fontWeight: 500 }}>{r.subtitle}</p>

                {/* FEATURE LIST */}
                <div style={{ flex: 1, marginBottom: '28px' }}>
                  {r.features.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', fontSize: '14px', color: colors.darkGray, fontWeight: 500 }}>
                      <span style={{ color: '#10B981', fontWeight: 'bold' }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  padding: '8px 14px',
                  backgroundColor: r.badgeColor,
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: colors.darkGray,
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  {r.stats}
                </div>

                {/* DEDICATED LOGIN AND SIGNUP BUTTONS */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => navigate(`/login/${r.role}`)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#FFFFFF',
                      border: `2px solid ${colors.border}`,
                      borderRadius: '10px',
                      color: colors.darkGray,
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Login →
                  </button>

                  <button
                    onClick={() => navigate(`/signup/${r.role}`)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: r.gradient,
                      border: 'none',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Sign Up
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: '80px 6%', backgroundColor: '#FFFFFF', borderTop: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '38px', color: colors.darkGray, marginBottom: '12px' }}>
              Why Healthcare Trust <Logo size="sm" isDarkBg={false} showTagline={false} />
            </h2>
            <p style={{ fontSize: '17px', color: colors.textSecondary }}>State-of-the-art features designed for safety, speed, and transparency.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '28px' }}>
            
            <div style={{ padding: '30px', backgroundColor: colors.background, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔒</div>
              <h4 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Bank-Grade Security</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>Encrypted donor records and strict data privacy compliance.</p>
            </div>

            <div style={{ padding: '30px', backgroundColor: colors.background, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>📡</div>
              <h4 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Emergency Broadcast</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>Hospitals can broadcast urgent blood unit requirements instantly to eligible local donors.</p>
            </div>

            <div style={{ padding: '30px', backgroundColor: colors.background, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🗺️</div>
              <h4 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>GPS Camp Finder</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>Interactive map interface to discover nearby blood donation camps and blood bank stocks.</p>
            </div>

            <div style={{ padding: '30px', backgroundColor: colors.background, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🏆</div>
              <h4 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Donor Rewards & Badges</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>Earn Gold/Platinum hero status, health points, and verified digital certificates.</p>
            </div>

            <div style={{ padding: '30px', backgroundColor: colors.background, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>📊</div>
              <h4 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Live Inventory Tracking</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>Blood banks manage A+, O-, B+ stock levels, quality testing and expiration alerts.</p>
            </div>

            <div style={{ padding: '30px', backgroundColor: colors.background, borderRadius: '20px', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>💉</div>
              <h4 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Transfusion Audit Logs</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6 }}>Complete traceability from donor check-in to patient bedside transfusion.</p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="impact" style={{ backgroundColor: colors.darkFooter, color: '#FFFFFF', padding: '80px 6% 36px' }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1.5fr',
          gap: '48px',
          marginBottom: '60px'
        }}>
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Logo size="md" isDarkBg={true} />
            </div>
            <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.6, maxWidth: '340px' }}>
              JeevanDaan is India's leading digital blood donation ecosystem connecting life-saving donors, certified blood banks, and hospital emergency wards.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#FAF9F6' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}><a href="#home" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Home</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#how-it-works" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>How It Works</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#roles" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Portals & Roles</a></li>
              <li style={{ marginBottom: '12px' }}><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Features</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#FAF9F6' }}>Portals</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}><span onClick={() => navigate('/login/donor')} style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>Donor Portal</span></li>
              <li style={{ marginBottom: '12px' }}><span onClick={() => navigate('/login/bloodbank')} style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>Blood Bank Portal</span></li>
              <li style={{ marginBottom: '12px' }}><span onClick={() => navigate('/login/hospital')} style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>Hospital Portal</span></li>
              <li style={{ marginBottom: '12px' }}><span onClick={() => navigate('/signup/donor')} style={{ color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>New Registration</span></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '16px', fontWeight: 800, marginBottom: '20px', color: '#FAF9F6' }}>Emergency Support</h4>
            <div style={{ backgroundColor: 'rgba(200, 16, 46, 0.15)', border: '1px solid rgba(200, 16, 46, 0.4)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#FF6B6B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>24/7 Blood Helpline</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', marginBottom: '4px' }}>📞 1800-123-4567</div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>Toll-Free Emergency Dispatch</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '28px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
          © 2026 <strong>JeevanDaan</strong> — National Blood Donation Management Platform. Built with ❤️ for India 🇮🇳
        </div>
      </footer>

    </div>
  );
};

export default Landing;
