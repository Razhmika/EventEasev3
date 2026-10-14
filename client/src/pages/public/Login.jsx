import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Email address is required.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(cleanEmail, password);
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'customer') navigate('/customer/dashboard');
        else if (user.role === 'vendor') navigate('/vendor/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-fill
  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <section style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        background: 'var(--grad-hero)'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'var(--grad-button-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 14px rgba(98, 64, 160, 0.25)'
            }}>
              <Sparkles size={22} />
            </div>
            <h2 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Sign in to manage your events, bookings & quotes.
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              Quick Demo Fill (Password: Password123!)
            </span>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('priya.customer@example.com', 'Password123!')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                title="Customer: Priya Ramanathan"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('divya.makeup@example.com', 'Password123!')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                title="Vendor: Divya Bridal Makeup Studio"
              >
                💄 Divya Makeup
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('kongumahal@example.com', 'Password123!')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                title="Vendor: Kongu Mahal Venue"
              >
                🏰 Kongu Mahal
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('rightstudio@example.com', 'Password123!')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                title="Vendor: Right Studio Photography"
              >
                📸 Right Studio
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@eventease.com', 'Password123!')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                title="Administrator"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              Create Account
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
