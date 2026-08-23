import React from 'react';

/**
 * BrandLogo Component
 * Renders JeevanDaan with joint spelling:
 * - 'Jeevan' in vivid Red
 * - 'Daan' in Off-White (with adaptive contrast container on light backgrounds)
 */
export default function Logo({ size = 'md', isDarkBg = false, showTagline = true, iconSize }) {
  const fontSizes = {
    sm: { title: '18px', icon: '20px', sub: '9px' },
    md: { title: '24px', icon: '28px', sub: '11px' },
    lg: { title: '32px', icon: '38px', sub: '12px' },
    xl: { title: '40px', icon: '48px', sub: '14px' },
  };

  const currentSize = fontSizes[size] || fontSizes.md;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: iconSize || currentSize.icon, lineHeight: 1 }}>🩸</span>
        <span style={{
          fontFamily: '"Outfit", "Inter", sans-serif',
          fontWeight: 900,
          fontSize: currentSize.title,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center'
        }}>
          <span style={{ color: '#C8102E' }}>Jeevan</span>
          {isDarkBg ? (
            <span style={{ color: '#FAF9F6', marginLeft: '1px' }}>Daan</span>
          ) : (
            <span style={{
              color: '#FAF9F6',
              backgroundColor: '#1E1E2F',
              padding: '2px 8px',
              borderRadius: '6px',
              marginLeft: '3px',
              fontSize: '0.92em',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
            }}>Daan</span>
          )}
        </span>
      </div>
      {showTagline && (
        <span style={{
          fontSize: currentSize.sub,
          color: isDarkBg ? 'rgba(250, 249, 246, 0.75)' : '#666688',
          letterSpacing: '0.04em',
          fontWeight: 600,
          marginLeft: '34px'
        }}>
          जीवनदान · Gift of Life
        </span>
      )}
    </div>
  );
}
