import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Sparkles, DollarSign, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const CustomerProfile = () => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.profile?.city || '');
  const [preferredTheme, setPreferredTheme] = useState(user?.profile?.preferred_theme || user?.profile?.preferredTheme || '');
  const [budgetTier, setBudgetTier] = useState(user?.profile?.budget_tier || user?.profile?.budgetTier || 'Mid-Range');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatar_url || user?.profile?.avatarUrl || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setCity(user.profile?.city || '');
      setPreferredTheme(user.profile?.preferred_theme || user.profile?.preferredTheme || '');
      setBudgetTier(user.profile?.budget_tier || user.profile?.budgetTier || 'Mid-Range');
      setAvatarUrl(user.profile?.avatar_url || user.profile?.avatarUrl || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = {
        firstName,
        lastName,
        phone,
        city,
        preferredTheme,
        budgetTier,
        avatarUrl
      };

      const res = await api.put('/auth/profile', payload);

      if (res.success) {
        setSuccessMsg('Your profile preferences have been updated successfully.');
        updateUser({
          firstName,
          lastName,
          phone,
          profile: {
            ...(user.profile || {}),
            city,
            preferredTheme,
            budgetTier,
            avatarUrl
          }
        });
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem', margin: '0 0 6px', color: 'var(--color-text-title)' }}>
          Customer Account & Preferences
        </h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem', margin: 0 }}>
          Manage your personal details and celebration aesthetic preferences for vendor matching.
        </p>
      </div>

      {successMsg && (
        <div style={{
          padding: '14px 18px',
          background: 'var(--color-success-bg)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '4px solid var(--color-success)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--color-text-title)'
        }}>
          <CheckCircle2 size={18} color="var(--color-success)" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '14px 18px',
          background: '#FFF5F5',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '4px solid var(--color-danger)',
          marginBottom: '20px',
          color: 'var(--color-danger)'
        }}>
          {errorMsg}
        </div>
      )}

      <div className="card" style={{ padding: '32px' }}>
        {/* User Identity Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'}
            alt={`${firstName} ${lastName}`}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary-soft)' }}
          />
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 4px', color: 'var(--color-text-title)' }}>
              {firstName} {lastName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              <Mail size={13} /> {user?.email} &bull; <span className="badge badge-match">Customer Host</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Name Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Contact Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                style={{ background: 'var(--color-surface-soft)', color: 'var(--color-text-muted)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Location & Avatar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                Primary City / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Maharashtra"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                Avatar Image URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Planning Preferences */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', marginTop: '6px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', color: 'var(--color-text-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={17} color="var(--color-primary-dark)" /> Celebration Aesthetic Preferences
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                  Preferred Celebration Theme / Vibe
                </label>
                <select value={preferredTheme} onChange={(e) => setPreferredTheme(e.target.value)}>
                  <option value="">Select an Aesthetic</option>
                  <option value="Traditional Royal & Heritage">Traditional Royal & Heritage</option>
                  <option value="Modern Minimalist Elegance">Modern Minimalist Elegance</option>
                  <option value="Bohemian Sunset Garden">Bohemian Sunset Garden</option>
                  <option value="Luxury Grandeur & Glamour">Luxury Grandeur & Glamour</option>
                  <option value="Rustic Coastal Beach">Rustic Coastal Beach</option>
                  <option value="Contemporary Pastel Floral">Contemporary Pastel Floral</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                  Typical Budget Tier
                </label>
                <select value={budgetTier} onChange={(e) => setBudgetTier(e.target.value)}>
                  <option value="Budget">Affordable & Value (₹25k - ₹1 Lakh)</option>
                  <option value="Mid-Range">Mid-Range Celebration (₹1 Lakh - ₹3 Lakhs)</option>
                  <option value="Luxury">Premium Luxury (₹3 Lakhs - ₹10 Lakhs)</option>
                  <option value="Ultra-Luxury">Ultra-Bespoke (₹10 Lakhs+)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              {saving ? 'Saving Changes...' : 'Save Profile Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;
