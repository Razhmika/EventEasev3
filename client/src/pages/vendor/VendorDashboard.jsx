import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  BookmarkCheck,
  CalendarDays,
  DollarSign,
  Star,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const VendorDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVendorData = async () => {
      setLoading(true);
      try {
        const [bookRes, servRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/vendors/me/services')
        ]);

        if (bookRes.success) setBookings(bookRes.data || []);
        if (servRes.success) setServices(servRes.data || []);
      } catch (err) {
        console.error('Vendor dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  const totalRevenue = bookings
    .filter((b) => ['accepted', 'completed'].includes(b.status))
    .reduce((acc, curr) => acc + parseFloat(curr.quote_amount || 0), 0);

  return (
    <div>
      {/* Vendor Profile Header */}
      <div style={{
        background: 'var(--grad-hero)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 36px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
              Vendor Studio Portal
            </span>
            <span className="badge badge-verified">
              <ShieldCheck size={14} /> Verified Studio
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', margin: '0 0 6px', color: 'var(--color-text-title)' }}>
            {user?.profile?.businessName || `${user?.firstName}'s Studio`}
          </h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
            Manage service offerings, date availability calendar, and respond to incoming customer inquiries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/vendor/bookings" className="btn btn-primary">
            <BookmarkCheck size={18} /> Manage Requests ({pendingBookings.length})
          </Link>
          <Link to="/vendor/calendar" className="btn btn-secondary">
            <CalendarDays size={18} /> Date Calendar
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Pending Requests</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)' }}>{pendingBookings.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Confirmed Events</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)' }}>{confirmedBookings.length}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Bookings Value</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)' }}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Listed Services</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)' }}>{services.length}</h3>
          </div>
        </div>
      </div>

      {/* Recent Incoming Inquiries */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Incoming Booking Inquiries</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Review celebration requirements, event dates, and proposed quotes.
            </p>
          </div>
          <Link to="/vendor/bookings" className="btn btn-secondary btn-sm">
            View All Requests <ArrowRight size={14} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '36px 0' }}>
            No booking inquiries received yet. Keep your service portfolio and availability updated to receive recommendations.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{b.event_title}</h4>
                    <span className={`badge badge-${b.status}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-primary-dark)', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                    Customer: {b.customer_first_name} {b.customer_last_name} &bull; Date: {b.event_date} &bull; Location: {b.event_city}
                  </span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px', margin: 0 }}>
                    Inquiry Notes: "{b.customer_notes || 'No message attached.'}"
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-title)' }}>
                    ₹{parseFloat(b.quote_amount || 0).toLocaleString('en-IN')}
                  </div>
                  <Link to="/vendor/bookings" className="btn btn-outline btn-sm" style={{ marginTop: '6px' }}>
                    Review Inquiry
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
