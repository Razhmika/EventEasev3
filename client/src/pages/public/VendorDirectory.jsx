import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  BookmarkCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '../../services/api';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';

export const VendorDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isCustomerPortal = location.pathname.startsWith('/customer');

  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [eventType, setEventType] = useState(searchParams.get('eventType') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');

  // Mobile filter drawer toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const eventTypesList = [
    'Wedding',
    'Birthday',
    'Engagement',
    'Reception',
    'Anniversary',
    'Corporate',
    'Housewarming',
    'Cultural Fest'
  ];

  // Load Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Vendors
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (eventType) params.set('eventType', eventType);
      if (city) params.set('city', city);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (minRating) params.set('minRating', minRating);
      if (date) params.set('date', date);
      if (sortBy) params.set('sortBy', sortBy);

      setSearchParams(params);

      const res = await api.get(`/vendors?${params.toString()}`);
      if (res.success && res.data) {
        setVendors(res.data.vendors || []);
      }
    } catch (err) {
      console.error('Error discovering vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [category, eventType, minRating, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setEventType('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setDate('');
    setSortBy('rating');
    setSearchParams({});
    setTimeout(fetchVendors, 50);
  };

  const getProfileLink = (vendorId) => {
    return isCustomerPortal ? `/customer/vendors/${vendorId}` : `/vendors/${vendorId}`;
  };

  const filterSidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Category Filter */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '8px' }}>
          Service Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: '100%', fontSize: '0.9rem' }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Event Type Filter */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '8px' }}>
          Event Occasion
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setEventType('')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              background: eventType === '' ? 'var(--color-primary-dark)' : '#FFFFFF',
              color: eventType === '' ? '#FFFFFF' : 'var(--color-text-title)',
              cursor: 'pointer'
            }}
          >
            All
          </button>
          {eventTypesList.map((et) => (
            <button
              key={et}
              type="button"
              onClick={() => setEventType(eventType === et ? '' : et)}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                background: eventType === et ? 'var(--color-primary-dark)' : '#FFFFFF',
                color: eventType === et ? '#FFFFFF' : 'var(--color-text-title)',
                cursor: 'pointer'
              }}
            >
              {et}
            </button>
          ))}
        </div>
      </div>

      {/* Location / City */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '8px' }}>
          City / Location
        </label>
        <div style={{ position: 'relative' }}>
          <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="e.g. Coimbatore, Tiruppur, Erode..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ paddingLeft: '36px', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Budget in INR (₹) */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '8px' }}>
          Max Starting Price (₹ INR)
        </label>
        <input
          type="number"
          placeholder="e.g. 50000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ fontSize: '0.9rem' }}
        />
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
          {[15000, 30000, 60000, 100000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setMaxPrice(amt.toString())}
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                background: maxPrice === amt.toString() ? 'var(--color-primary-light)' : '#FFFFFF',
                color: maxPrice === amt.toString() ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ₹{(amt / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '8px' }}>
          Customer Rating
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { val: '', label: 'Any Rating' },
            { val: '4.8', label: '4.8+ Stars (Exceptional)' },
            { val: '4.5', label: '4.5+ Stars (Top Rated)' },
            { val: '4.0', label: '4.0+ Stars (Good)' }
          ].map((r) => (
            <label key={r.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="ratingFilter"
                checked={minRating === r.val}
                onChange={() => setMinRating(r.val)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Availability */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '8px' }}>
          Date Availability
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ fontSize: '0.9rem' }}
        />
      </div>

      {/* Filter Actions */}
      <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
        <button
          type="button"
          onClick={handleResetFilters}
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
        >
          <RotateCcw size={14} /> Clear
        </button>
        <button
          type="button"
          onClick={() => {
            fetchVendors();
            setShowMobileFilters(false);
          }}
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
        >
          Apply
        </button>
      </div>
    </div>
  );

  const mainMarketplaceContent = (
    <div>
      {/* Top Search & Filter Bar */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: '28px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--color-primary-dark)' }} />
            <input
              type="text"
              placeholder="Search wedding, catering, photography, marriage hall, decor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={14} /> Search
            </button>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="btn btn-outline btn-sm mobile-only"
              style={{ display: 'none' }}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </form>

        {/* Sorting and Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Showing <strong style={{ color: 'var(--color-text-title)' }}>{vendors.length}</strong> verified vendors
            {category && <span> in <em style={{ color: 'var(--color-primary-dark)' }}>{category}</em></span>}
            {eventType && <span> for <em style={{ color: 'var(--color-primary-dark)' }}>{eventType}</em></span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main 2-Column Marketplace Grid: Left Sidebar + Right Vendor Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Sticky Filter Panel (Desktop) */}
        <aside className="card desktop-only" style={{ padding: '22px', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} color="var(--color-primary-dark)" /> Filters
            </h3>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Reset
            </button>
          </div>
          {filterSidebarContent}
        </aside>

        {/* Right Vendor Listings Column */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: 40, height: 40, border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>Discovering verified vendors...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : vendors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--color-primary-dark)' }}>
                <Search size={30} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No Vendors Match Your Filters</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 24px', fontSize: '0.9rem' }}>
                We could not find any vendors matching your search criteria. Try broadening your budget range, clearing dates, or exploring other categories.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                  }}
                >
                  {/* Card Media Header */}
                  <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={vendor.banner_url || vendor.avatar_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'}
                      alt={vendor.business_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span className="badge badge-verified">
                        <ShieldCheck size={14} /> Verified
                      </span>
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-text-title)'
                    }}>
                      {vendor.categories_list || 'Event Services'}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {vendor.city} ({vendor.service_radius_km}km)
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                        <Star size={14} fill="#6240A0" color="#6240A0" /> {parseFloat(vendor.average_rating).toFixed(1)} ({vendor.review_count})
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>
                      {vendor.business_name}
                    </h3>

                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '18px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1
                    }}>
                      {vendor.bio || 'Professional bespoke services tailored to your dream celebration.'}
                    </p>

                    {/* Price and Actions */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Starts from</span>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--color-text-title)' }}>
                          ₹{parseFloat(vendor.starting_price).toLocaleString('en-IN')}
                        </strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <Link to={getProfileLink(vendor.id)} className="btn btn-outline btn-sm" style={{ textAlign: 'center', justifyContent: 'center' }}>
                          View Profile
                        </Link>
                        <Link to={`${getProfileLink(vendor.id)}?book=true`} className="btn btn-primary btn-sm" style={{ textAlign: 'center', justifyContent: 'center' }}>
                          <BookmarkCheck size={14} /> Book Direct
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filters Drawer Modal */}
      {showMobileFilters && (
        <div className="modal-overlay" onClick={() => setShowMobileFilters(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} color="var(--color-primary-dark)" /> Filter Marketplace
              </h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>
            {filterSidebarContent}
          </div>
        </div>
      )}
    </div>
  );

  // If in customer portal, render inside DashboardLayout without external Navbar/Footer
  if (isCustomerPortal) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '2.1rem', margin: '0 0 6px', color: 'var(--color-text-title)' }}>
            Vendor Marketplace & Discovery
          </h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem', margin: 0 }}>
            Discover top-tier event professionals, inspect showcase portfolios, and submit direct booking inquiries.
          </p>
        </div>
        {mainMarketplaceContent}
      </div>
    );
  }

  // Public visitor layout
  return (
    <div className="page-wrapper">
      <Navbar />
      <section style={{
        background: 'var(--grad-hero)',
        padding: '50px 0 40px',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Vendor Marketplace</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '1.05rem', maxWidth: '640px' }}>
            Discover trusted caterers, photographers, marriage halls, and decorators across Coimbatore and Tamil Nadu with transparent pricing in INR (₹).
          </p>
        </div>
      </section>

      <section style={{ padding: '40px 0', background: 'var(--color-bg-page)' }}>
        <div className="container">
          {mainMarketplaceContent}
        </div>
      </section>
      <Footer />
    </div>
  );
};

