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

    // 1. Email format validation
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    // 2. Phone number validation: numbers only and exactly 10 digits
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Phone number must contain exactly 10 digits (numbers only).');
      return;
    }

    // 3. Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 4. Name validation (letters and standard name punctuation only)
    if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim()) || !/^[a-zA-Z\s'-]+$/.test(lastName.trim())) {
      setError('First name and last name must contain only letters.');
      return;
    }

    // 5. Vendor-specific validations
    if (role === 'vendor') {
      if (!businessName.trim()) {
        setError('Business name is required.');
        return;
      }
      if (!startingPrice || isNaN(startingPrice) || parseFloat(startingPrice) <= 0) {
        setError('Please enter a valid positive starting price (₹).');
        return;
      }
    }

    setLoading(true);

    try {
      if (role === 'customer') {
        const user = await registerCustomer({
          email: cleanEmail,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: cleanPhone,
          city: city.trim(),
          preferredTheme,
          budgetTier
        });
        navigate('/customer/dashboard');
      } else {
        const user = await registerVendor({
          email: cleanEmail,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: cleanPhone,
          businessName: businessName.trim(),
          bio,
          city: city.trim(),
          serviceRadiusKm: parseInt(serviceRadiusKm || 50, 10),
          startingPrice: parseFloat(startingPrice || 10000),
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
                  placeholder="Priya"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-Z\s'-]/g, ''))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ramanathan"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-Z\s'-]/g, ''))}
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
                  placeholder="priya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block' }}>
                    Phone Number *
                  </label>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: phone.length === 10 ? 'var(--color-success)' : phone.length > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)'
                  }}>
                    {phone.length === 10 ? '✓ 10 digits' : `${phone.length}/10 digits`}
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  placeholder="9842122334"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{
                    borderColor: phone && phone.length !== 10 ? 'var(--color-danger)' : undefined
                  }}
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
                placeholder="Coimbatore"
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
                    placeholder="e.g. Traditional Tamil Wedding, Modern Reception, Floral Stage"
                    value={preferredTheme}
                    onChange={(e) => setPreferredTheme(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                    Typical Budget Tier
                  </label>
                  <select value={budgetTier} onChange={(e) => setBudgetTier(e.target.value)}>
                    <option value="Intimate / Accessible">Budget / Intimate (Under ₹50,000)</option>
                    <option value="Mid-to-High">Standard / Mid-Range (₹50,000 - ₹2,00,000)</option>
                    <option value="Luxury / Haute">Grand / Luxury (₹2,00,000+)</option>
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
                    placeholder="e.g. Right Studio Photography"
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
                      Starting Price (₹) *
                    </label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      placeholder="10000"
                      value={startingPrice}
                      onChange={(e) => setStartingPrice(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                    Business Bio & Specialization
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the services you offer..."
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
