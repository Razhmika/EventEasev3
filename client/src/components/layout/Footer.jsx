import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: 'var(--color-surface-card)',
      borderTop: '1px solid var(--color-border)',
      marginTop: 'auto',
      padding: '48px 0 24px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'var(--grad-button-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Sparkles size={16} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-title)' }}>
                Event<span style={{ color: 'var(--color-primary-dark)' }}>Ease</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              The premier AI-powered event booking platform connecting customers with trusted local event vendors across Coimbatore and Tamil Nadu.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--color-text-title)' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <Link to="/vendors">Discover Vendors</Link>
              <Link to="/register">Join as a Vendor</Link>
              <Link to="/login">Sign In</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--color-text-title)' }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <Link to="/vendors?category=catering">Catering & Food Services</Link>
              <Link to="/vendors?category=photography">Photography & Videography</Link>
              <Link to="/vendors?category=venues">Marriage Halls & Venues</Link>
              <Link to="/vendors?category=decor-floral">Stage & Flower Decoration</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '16px', color: 'var(--color-text-title)' }}>Security & Trust</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
              All vendors undergo rigorous background and portfolio verification. Concurrency-safe availability locking guaranteed.
            </p>
            <div className="badge badge-verified" style={{ padding: '6px 12px' }}>
              100% Verified Community
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} EventEase Inc. Designed in Lavender & White.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Curated with <Heart size={14} fill="#6240A0" color="#6240A0" /> for unforgettable celebrations.
          </div>
        </div>
      </div>
    </footer>
  );
};
