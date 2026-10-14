import React, { useState, useEffect } from 'react';
import { Store, Image, PlusCircle, Trash2, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const VendorProfileSettings = () => {
  const { user, updateUser } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState('50');
  const [startingPrice, setStartingPrice] = useState('1000');
  const [bannerUrl, setBannerUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Portfolio Items
  const [portfolio, setPortfolio] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [addingImage, setAddingImage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setBusinessName(user.profile.businessName || '');
      setBio(user.profile.bio || '');
      setCity(user.profile.city || '');
      setServiceRadiusKm(user.profile.serviceRadiusKm || '50');
      setStartingPrice(user.profile.startingPrice || '1000');
      setBannerUrl(user.profile.banner_url || user.profile.bannerUrl || '');
      setAvatarUrl(user.profile.avatar_url || user.profile.avatarUrl || '');
    }

    // Load portfolio
    api.get('/vendors/me/portfolio').then((res) => {
      if (res.success) setPortfolio(res.data || []);
    }).catch((e) => console.error(e));
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMsg('');

    try {
      const res = await api.put('/auth/profile', {
        businessName,
        bio,
        city,
        serviceRadiusKm,
        startingPrice,
        bannerUrl,
        avatarUrl
      });

      if (res.success) {
        updateUser({
          profile: {
            ...user.profile,
            businessName,
            bio,
            city,
            serviceRadiusKm: parseInt(serviceRadiusKm, 10),
            startingPrice: parseFloat(startingPrice),
            banner_url: bannerUrl,
            avatar_url: avatarUrl
          }
        });
        setSuccessMsg('Profile settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!newImageUrl) return;

    setAddingImage(true);
    try {
      const res = await api.post('/vendors/me/portfolio', {
        imageUrl: newImageUrl,
        caption: newCaption,
        isFeatured
      });

      if (res.success) {
        setNewImageUrl('');
        setNewCaption('');
        setIsFeatured(false);
        const pRes = await api.get('/vendors/me/portfolio');
        if (pRes.success) setPortfolio(pRes.data || []);
      }
    } catch (err) {
      alert(err.message || 'Failed to add image.');
    } finally {
      setAddingImage(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm('Delete this image from portfolio?')) return;
    try {
      const res = await api.delete(`/vendors/me/portfolio/${id}`);
      if (res.success) {
        setPortfolio((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete image.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem' }}>Business Profile & Portfolio</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
          Update your public studio presentation, coverage boundaries, and showcase imagery.
        </p>
      </div>

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: 'var(--color-success-bg)',
          color: 'var(--color-success)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '18px' }}>Studio Details</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Business / Studio Name *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Base City *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Service Radius (km) *
            </label>
            <input
              type="number"
              required
              value={serviceRadiusKm}
              onChange={(e) => setServiceRadiusKm(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Minimum Starting Price (₹) *
            </label>
            <input
              type="number"
              required
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Banner Image URL
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            Studio Bio & Craft Specialization
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={savingProfile} className="btn btn-primary">
            {savingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Portfolio Gallery Manager */}
      <div className="card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '18px' }}>Portfolio Showcase Gallery</h3>

        {/* Add Image Form */}
        <form onSubmit={handleAddPortfolio} style={{ padding: '16px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Upload New Portfolio Item</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 100px auto', gap: '12px', alignItems: 'center' }}>
            <input
              type="url"
              required
              placeholder="Image URL (Unsplash or hosted link)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <input
              type="text"
              placeholder="Caption (e.g. Garden Pavilion Styling)"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
            />
            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Featured
            </label>
            <button type="submit" disabled={addingImage} className="btn btn-primary btn-sm">
              <PlusCircle size={14} /> Add Item
            </button>
          </div>
        </form>

        {/* Portfolio Gallery Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {portfolio.map((item) => (
            <div key={item.id} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '160px', border: '1px solid var(--color-border)' }}>
              <img
                src={item.image_url}
                alt={item.caption}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => handleDeletePortfolio(item.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(192, 45, 56, 0.85)',
                  color: '#FFFFFF',
                  padding: '6px',
                  borderRadius: '50%'
                }}
                title="Delete image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
