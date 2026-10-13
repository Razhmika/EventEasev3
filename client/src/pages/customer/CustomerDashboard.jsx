import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  BookmarkCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Store,
  Sparkles,
  Calendar,
  MapPin,
  MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const bookRes = await api.get('/bookings');
        if (bookRes.success) setBookings(bookRes.data || []);
      } catch (err) {
        console.error('Customer dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'accepted');
  const activeBookings = bookings.filter((b) => ['pending', 'accepted'].includes(b.status));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/vendors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/customer/vendors');
    }
  };

  const categoryShortcuts = [
    { label: '💍 Wedding', query: 'eventType=Wedding' },
    { label: '🍽️ Catering', query: 'category=catering' },
    { label: '📸 Photography', query: 'category=photography' },
    { label: '✨ Decoration', query: 'category=decoration' },
    { label: '🏰 Venue', query: 'category=venues' },
    { label: '🎂 Birthday', query: 'eventType=Birthday' },
    { label: '🎵 DJ & Music', query: 'category=dj-music' }
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'var(--grad-hero)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 36px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Event Marketplace Sanctuary
          </span>
          <h1 style={{ fontSize: '2.2rem', margin: '4px 0 8px', color: 'var(--color-text-title)' }}>
            Welcome back, {user?.firstName}!
          </h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '1rem', maxWidth: '540px', margin: 0 }}>
            {user?.profile?.city ? `Exploring verified wedding & event vendors in ${user.profile.city}.` : 'Discover vetted artisans, explore their showcase portfolios, and book directly.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/customer/vendors" className="btn btn-primary">
            <Store size={18} /> Browse Marketplace
          </Link>
          <Link to="/customer/ai-planner" className="btn btn-secondary">
            <Sparkles size={18} /> AI Event Studio
          </Link>
        </div>
      </div>

      {/* Prominent Search Area */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #FAF8FF 0%, #F3EDFD 100%)',
        border: '1.5px solid var(--color-primary-soft)',
        padding: '36px 32px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 24px' }}>
          <h2 style={{ fontSize: '1.9rem', color: 'var(--color-text-title)', marginBottom: '8px' }}>
            Find the Perfect Vendors for Your Event
          </h2>
          <p style={{ color: 'var(--color-text-body)', fontSize: '1rem' }}>
            Search verified venues, gourmet caterers, cinematographers, decorators, and performers.
          </p>
        </div>

        {/* Big Search Form */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-pill)',
            border: '2px solid var(--color-primary-soft)',
            padding: '6px 8px 6px 20px',
            boxShadow: '0 6px 20px rgba(98, 64, 160, 0.08)',
            gap: '12px'
          }}>
            <Search size={22} color="var(--color-primary-dark)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search wedding, catering, photography, venues, decorators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                fontSize: '1.05rem',
                flex: 1,
                padding: '10px 0',
                background: 'transparent'
              }}
            />
            <button
              type="button"
              onClick={() => navigate('/customer/vendors')}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 'var(--radius-pill)', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Open full filters"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ borderRadius: 'var(--radius-pill)', padding: '12px 28px', fontSize: '0.95rem' }}
            >
              Browse Vendors
            </button>
          </div>
        </form>

        {/* Popular Shortcuts */}
        <div style={{ marginTop: '22px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginRight: '10px' }}>
            Popular Shortcuts:
          </span>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '6px' }}>
            {categoryShortcuts.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(`/customer/vendors?${cat.query}`)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-text-title)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary-dark)';
                  e.currentTarget.style.background = 'var(--color-primary-light)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
            <BookmarkCheck size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Inquiries</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)', margin: '2px 0 0' }}>{activeBookings.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Pending Quotes</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)', margin: '2px 0 0' }}>{pendingBookings.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Confirmed Bookings</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)', margin: '2px 0 0' }}>{confirmedBookings.length}</h3>
          </div>
        </div>
      </div>

      {/* Recent Booking Inquiries Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', margin: '0 0 4px', color: 'var(--color-text-title)' }}>
              Recent Booking Requests
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Track the current response status of your direct vendor inquiries.
            </p>
          </div>
          <Link to="/customer/bookings" className="btn btn-secondary btn-sm">
            View All Inquiries <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading inquiries...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--color-surface-soft)', borderRadius: 'var(--radius-sm)' }}>
            <Store size={40} color="var(--color-primary-dark)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem' }}>No Active Booking Inquiries</h4>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 auto 18px', fontSize: '0.9rem' }}>
              Explore the vendor directory to discover verified artisans and submit direct booking inquiries with zero upfront commitment.
            </p>
            <Link to="/customer/vendors" className="btn btn-primary btn-sm">
              Discover Vendors
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {bookings.slice(0, 4).map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-border)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={b.vendor_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80'}
                    alt={b.business_name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-soft)' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 3px' }}>{b.business_name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {b.service_title ? `${b.service_title} • ` : ''}For "{b.event_title}" &bull; {b.event_date}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {b.quote_amount && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Quote</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-title)' }}>
                        ₹{parseFloat(b.quote_amount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  )}

                  <span className={`badge badge-${b.status}`}>
                    {b.status.toUpperCase()}
                  </span>

                  <Link to="/customer/bookings" className="btn btn-outline btn-sm">
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

