import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle,
  X,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
  Briefcase,
  Layers,
  Clock,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import DynamicBookingModal from '../../components/booking/DynamicBookingModal';

export const VendorProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isCustomerPortal = location.pathname.startsWith('/customer');

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messagingLoading, setMessagingLoading] = useState(false);

  // Dynamic Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedInitialService, setSelectedInitialService] = useState(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/vendors/${id}`);
        if (res.success && res.data) {
          setVendor(res.data);
        }
      } catch (err) {
        setError(err.message || 'Vendor not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, [id]);

  // Open modal automatically if ?book=true is passed
  useEffect(() => {
    if (searchParams.get('book') === 'true' && vendor) {
      if (!user) {
        navigate('/login');
        return;
      }
      setSelectedInitialService(vendor.services?.[0] || null);
      setShowBookingModal(true);
    }
  }, [searchParams, vendor, user, navigate]);

  // Initiate direct chat with this vendor
  const handleMessageVendor = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      alert('Messaging vendors is available for Customer accounts.');
      return;
    }

    setMessagingLoading(true);
    try {
      const res = await api.post('/messages/conversations/initiate', {
        vendorId: vendor.id
      });
      if (res.success && res.data?.conversationId) {
        navigate(`/customer/messages?convId=${res.data.conversationId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to initiate conversation.');
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleOpenBookingWithService = (service) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedInitialService(service || null);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <div style={{ width: 44, height: 44, border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>Loading Vendor Portfolio & Services...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Vendor Profile Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>{error}</p>
        <Link to={isCustomerPortal ? "/customer/vendors" : "/vendors"} className="btn btn-primary">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const profileBodyContent = (
    <div>
      {/* LinkedIn-Style Banner & Header Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
        {/* Banner */}
        <div style={{
          height: '240px',
          position: 'relative',
          background: `url(${vendor.banner_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80'}) center/cover no-repeat`
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(30, 20, 50, 0.2) 0%, rgba(30, 20, 50, 0.7) 100%)'
          }} />
        </div>

        {/* Profile Info Row */}
        <div style={{ padding: '0 32px 28px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginTop: '-60px', marginBottom: '16px' }}>
            <img
              src={vendor.avatar_url || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80'}
              alt={vendor.business_name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '4px solid #FFFFFF',
                boxShadow: 'var(--shadow-card)',
                objectFit: 'cover',
                background: '#FFFFFF',
                zIndex: 2
              }}
            />

            {/* Header Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleMessageVendor}
                disabled={messagingLoading}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <MessageSquare size={16} color="var(--color-primary-dark)" />
                {messagingLoading ? 'Connecting...' : 'Message Vendor'}
              </button>
              <button
                type="button"
                onClick={() => handleOpenBookingWithService(vendor.services?.[0] || null)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <BookmarkCheck size={16} /> Request Direct Booking
              </button>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '2.1rem', margin: 0, color: 'var(--color-text-title)' }}>
                {vendor.business_name}
              </h1>
              <span className="badge badge-verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Verified Studio
              </span>
            </div>

            <p style={{ color: 'var(--color-primary-dark)', fontWeight: 600, fontSize: '1rem', margin: '0 0 10px' }}>
              {vendor.categories_list || 'Event Services & Production'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} color="var(--color-primary-dark)" /> {vendor.city} ({vendor.service_radius_km} km service coverage)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--color-text-title)' }}>
                <Star size={15} fill="#6240A0" color="#6240A0" /> {parseFloat(vendor.average_rating).toFixed(1)} ({vendor.review_count} verified reviews)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Starting at <strong style={{ color: 'var(--color-text-title)', fontSize: '1.05rem' }}>₹{parseFloat(vendor.starting_price).toLocaleString('en-IN')}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: About, Services, Portfolio Feed, Reviews */}
        <div>
          {/* About Section */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '14px', color: 'var(--color-text-title)' }}>About the Studio</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-body)', lineHeight: 1.7, margin: 0 }}>
              {vendor.bio || 'Our studio provides premier bespoke event execution, creating tailored, unforgettable memories for hosts and their honored guests.'}
            </p>
          </div>

          {/* Services & Offerings Section */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: '0 0 4px', color: 'var(--color-text-title)' }}>
                  Services & Packages
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Select any service package below to prefill your booking inquiry.
                </p>
              </div>
              <span className="badge badge-match">{vendor.services?.length || 0} Available</span>
            </div>

            {vendor.services?.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Contact the vendor for custom quotation packages.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {vendor.services?.map((service) => (
                  <div
                    key={service.id}
                    style={{
                      padding: '20px',
                      background: 'var(--color-primary-light)',
                      border: '1px solid var(--color-primary-soft)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {service.category_name}
                      </span>
                      <h4 style={{ fontSize: '1.15rem', margin: '4px 0 6px', color: 'var(--color-text-title)' }}>
                        {service.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-body)', lineHeight: 1.5, margin: 0 }}>
                        {service.description || 'Full-scope execution and consultation tailored to your occasion.'}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '1.35rem', color: 'var(--color-text-title)' }}>
                          ₹{parseFloat(service.price).toLocaleString('en-IN')}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
                          per {service.pricing_unit || 'event'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenBookingWithService(service)}
                        className="btn btn-primary btn-sm"
                      >
                        Request This Service
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio Showcase Feed (Read-Only) */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: '0 0 4px', color: 'var(--color-text-title)' }}>
                  Showcase Portfolio
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  High-resolution visual highlights from past celebrations and productions.
                </p>
              </div>
              <span className="badge badge-verified">
                <ImageIcon size={13} /> {vendor.portfolio?.length || 0} Works
              </span>
            </div>

            {vendor.portfolio?.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No portfolio media uploaded yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {vendor.portfolio?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-border)',
                      background: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ height: '170px', overflow: 'hidden' }}>
                      <img
                        src={item.image_url}
                        alt={item.caption || 'Portfolio Showcase'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      />
                    </div>
                    {item.caption && (
                      <div style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--color-text-body)', fontWeight: 500 }}>
                        {item.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Reviews Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: '0 0 4px', color: 'var(--color-text-title)' }}>
                  Client Reviews & Testimonials
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Verified reviews submitted by hosts upon event completion.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                <Star size={18} fill="#6240A0" color="#6240A0" /> {parseFloat(vendor.average_rating).toFixed(1)} / 5.0
              </div>
            </div>

            {vendor.reviews?.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '30px 0', fontSize: '0.9rem' }}>
                No reviews recorded yet. Submit a booking request to experience their service!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {vendor.reviews?.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '16px',
                      background: 'var(--color-surface-soft)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-title)' }}>
                        {rev.first_name} {rev.last_name}
                      </span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? '#6240A0' : '#E8E2F2'}
                            color={i < rev.rating ? '#6240A0' : '#E8E2F2'}
                          />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-body)', lineHeight: 1.5, margin: 0 }}>
                      "{rev.comment}"
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Booking Action Card */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="card">
            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
                Pricing Starting At
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-title)', marginTop: '2px' }}>
                ₹{parseFloat(vendor.starting_price).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{
              padding: '12px 14px',
              background: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--color-text-body)',
              marginBottom: '20px',
              lineHeight: 1.5,
              border: '1px solid var(--color-primary-soft)'
            }}>
              <strong style={{ color: 'var(--color-primary-dark)', display: 'block', marginBottom: '2px' }}>
                ✓ Zero Upfront Payment
              </strong>
              Submitting an inquiry connects you directly with the studio. You receive a custom quotation and agreement terms.
            </div>

            <button
              type="button"
              onClick={() => handleOpenBookingWithService(vendor.services?.[0] || null)}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '12px', padding: '12px 16px', fontSize: '0.95rem' }}
            >
              <BookmarkCheck size={16} /> Request Booking
            </button>

            <button
              type="button"
              onClick={handleMessageVendor}
              disabled={messagingLoading}
              className="btn btn-outline"
              style={{ width: '100%', marginBottom: '16px', padding: '10px 16px', fontSize: '0.9rem' }}
            >
              <MessageSquare size={15} color="var(--color-primary-dark)" />
              {messagingLoading ? 'Connecting...' : 'Message Studio'}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
              Live availability re-verified upon vendor acceptance.
            </p>
          </div>
        </div>

      </div>

      {/* Dynamic Service-Specific Booking Inquiry Modal */}
      {showBookingModal && vendor && (
        <DynamicBookingModal
          vendor={vendor}
          initialService={selectedInitialService}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedInitialService(null);
          }}
          onSuccess={() => {
            navigate('/customer/bookings');
          }}
        />
      )}
    </div>
  );

  // If in customer workspace, render inside DashboardLayout without duplicate headers
  if (isCustomerPortal) {
    return (
      <div style={{ paddingBottom: '40px' }}>
        {profileBodyContent}
      </div>
    );
  }

  // Public visitor layout
  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ padding: '36px 0 60px', background: 'var(--color-bg-page)' }}>
        <div className="container">
          {profileBodyContent}
        </div>
      </div>
      <Footer />
    </div>
  );
};

