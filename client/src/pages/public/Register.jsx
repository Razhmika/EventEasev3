import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Store, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const Register = () => {
  const { registerCustomer, registerVendor } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer'); // 'customer' or 'vendor'
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Customer-specific Fields
  const [preferredTheme, setPreferredTheme] = useState('');
  const [budgetTier, setBudgetTier] = useState('Mid-to-High');

  // Vendor-specific Fields
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState('50');
  const [startingPrice, setStartingPrice] = useState('1000');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
        if (res.data.length > 0) setCategoryId(res.data[0].id);
      }
    }).catch((e) => console.error(e));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'customer') {
        const user = await registerCustomer({
          email,
          password,
          firstName,
          lastName,
          phone,
          city,
          preferredTheme,
          budgetTier
        });
        navigate('/customer/dashboard');
      } else {
        const user = await registerVendor({
          email,
          password,
          firstName,
          lastName,
          phone,
          businessName,
          bio,
          city,
          serviceRadiusKm,
          startingPrice,
          categoryId
        });
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
        <div className="card" style={{ width: '100%', maxWidth: '580px', padding: '36px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Join EventEase</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Choose your profile type to begin curated event collaboration.
            </p>
          </div>

          {/* Role Toggle Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'var(--color-primary-light)',
            padding: '4px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '24px',
            border: '1px solid var(--color-primary-soft)'
          }}>
            <button
              type="button"
              onClick={() => { setRole('customer'); setError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: role === 'customer' ? '#FFFFFF' : 'var(--color-text-title)',
                background: role === 'customer' ? 'var(--grad-button-primary)' : 'transparent',
                boxShadow: role === 'customer' ? '0 2px 8px rgba(98, 64, 160, 0.25)' : 'none'
              }}
            >
              <User size={16} /> I'm a Customer
            </button>
            <button
              type="button"
              onClick={() => { setRole('vendor'); setError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: role === 'vendor' ? '#FFFFFF' : 'var(--color-text-title)',
                background: role === 'vendor' ? 'var(--grad-button-primary)' : 'transparent',
                boxShadow: role === 'vendor' ? '0 2px 8px rgba(98, 64, 160, 0.25)' : 'none'
              }}
            >
              <Store size={16} /> I'm a Vendor / Studio
            </button>
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Common Name Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sophia"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Montgomery"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="sophia@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                Password (min. 6 characters) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* City */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                Base City / Location *
              </label>
              <input
                type="text"
                required
                placeholder="San Francisco, CA"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {/* Customer Specific Fields */}
            {role === 'customer' && (
              <>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                    Preferred Theme / Aesthetic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lavender Glow, French Minimalist, Modern Estate"
                    value={preferredTheme}
                    onChange={(e) => setPreferredTheme(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                    Typical Budget Tier
                  </label>
                  <select value={budgetTier} onChange={(e) => setBudgetTier(e.target.value)}>
                    <option value="Intimate / Accessible">Intimate / Accessible (&lt;$10k)</option>
                    <option value="Mid-to-High">Mid-to-High ($10k - $30k)</option>
                    <option value="Luxury / Haute">Luxury / Haute ($30k+)</option>
                  </select>
                </div>
              </>
            )}

            {/* Vendor Specific Fields */}
            {role === 'vendor' && (
              <>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                    Business / Studio Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Celestial Blooms Studio"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                      Primary Service Category *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                      Starting Price ($) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="1500"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                    Business Bio & Specialization
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your craft, experience, and what sets your creations apart..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              {loading ? 'Creating Account...' : `Register as ${role === 'customer' ? 'Customer' : 'Vendor'}`} <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              Sign In
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};
