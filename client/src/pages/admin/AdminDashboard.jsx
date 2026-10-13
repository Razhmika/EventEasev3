import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Calendar,
  BookmarkCheck,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Activity,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>Loading platform analytics...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-pill)', color: 'var(--color-primary-dark)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
          <ShieldCheck size={14} /> Master Administrator Console
        </div>
        <h1 style={{ fontSize: '2.2rem' }}>Platform Oversight & Analytics</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
          Real-time metrics, user management, vendor verification approval, and booking audit records.
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Customers</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)' }}>{stats?.totalCustomers || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Vendors</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)' }}>{stats?.totalVendors || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-info)' }}>
            <Calendar size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Events Created</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)' }}>{stats?.totalEvents || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Confirmed Bookings</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)' }}>{stats?.confirmedBookings || 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-dark)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Gross Volume</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--color-text-title)' }}>
              ${parseFloat(stats?.grossVolume || 0).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Recent Platform Bookings */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Platform Inquiries & Bookings</h3>
          <Link to="/admin/bookings" className="btn btn-secondary btn-sm">
            View All Platform Bookings
          </Link>
        </div>

        {stats?.recentBookings?.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>No bookings on platform yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '12px' }}>Event Title</th>
                  <th style={{ padding: '12px' }}>Client</th>
                  <th style={{ padding: '12px' }}>Vendor Studio</th>
                  <th style={{ padding: '12px' }}>Quote</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentBookings?.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-text-title)' }}>{b.event_title}</td>
                    <td style={{ padding: '12px' }}>{b.customer_name}</td>
                    <td style={{ padding: '12px', color: 'var(--color-primary-dark)', fontWeight: 600 }}>{b.business_name}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>${parseFloat(b.quote_amount || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${b.status}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
