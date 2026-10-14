import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Search,
  Star,
  Users,
  Utensils,
  Camera,
  Castle,
  Flower2,
  Music,
  CalendarHeart
} from 'lucide-react';
import api from '../../services/api';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredVendors, setFeaturedVendors] = useState([]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const catRes = await api.get('/categories');
        if (catRes.success) setCategories(catRes.data);

        const venRes = await api.get('/vendors?limit=3');
        if (venRes.success) setFeaturedVendors(venRes.data.vendors);
      } catch (err) {
        console.error('Home data load error:', err);
      }
    };
    loadHomeData();
  }, []);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'catering': return Utensils;
      case 'photography': return Camera;
      case 'venues': return Castle;
      case 'decor-floral': return Flower2;
      case 'music-dj': return Music;
      case 'event-planning': return CalendarHeart;
      default: return Sparkles;
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero Section with Subtle Gradient */}
      <section style={{
        background: 'var(--grad-hero)',
        padding: '90px 0 80px',
        borderBottom: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '860px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-soft)',
            borderRadius: 'var(--radius-pill)',
            color: 'var(--color-primary-dark)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '24px'
          }}>
            <Sparkles size={16} /> Intelligent Event Matching & Production
          </div>

          <h1 style={{
            fontSize: '3.4rem',
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: '22px',
            color: 'var(--color-text-title)'
          }}>
            Curating Extraordinary Celebrations with <span style={{ color: 'var(--color-primary-dark)' }}>AI Precision</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--color-text-body)',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '680px',
            margin: '0 auto 36px'
          }}>
            Connect seamlessly with verified local event vendors tailored to your exact budget, celebration style, date, and location through our transparent rule-based recommendation engine.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/vendors" className="btn btn-primary btn-lg">
              Explore Verified Vendors <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Create Event Requirement
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginTop: '64px',
            padding: '24px 32px',
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div>
              <h3 style={{ color: 'var(--color-primary-dark)', fontSize: '1.8rem', fontWeight: 800 }}>100%</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Verified Vendors</p>
            </div>
            <div style={{ borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
              <h3 style={{ color: 'var(--color-primary-dark)', fontSize: '1.8rem', fontWeight: 800 }}>98%</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Rule-Based Match Precision</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--color-primary-dark)', fontSize: '1.8rem', fontWeight: 800 }}>0 Conflict</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>ACID Availability Guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section style={{ padding: '80px 0', background: 'var(--color-bg-page)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
              Bespoke Service Offerings
            </span>
            <h2 style={{ marginTop: '8px' }}>Discover by Event Category</h2>
          </div>

          <div className="grid-3">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/vendors?category=${cat.slug}`)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '14px',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary-dark)',
                    border: '1px solid var(--color-primary-soft)'
                  }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>{cat.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                      {cat.description}
                    </p>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                    Explore Category <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Vendors Showcase */}
      <section style={{ padding: '80px 0', background: 'var(--color-surface-card)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                Top-Rated Collective
              </span>
              <h2 style={{ marginTop: '8px' }}>Featured Master Vendors</h2>
            </div>
            <Link to="/vendors" className="btn btn-outline btn-sm">
              View All Vendors <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-3">
            {featuredVendors.map((vendor) => (
              <div key={vendor.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={vendor.banner_url || vendor.avatar_url}
                    alt={vendor.business_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span className="badge badge-verified">
                      <ShieldCheck size={14} /> Verified
                    </span>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                      {vendor.city}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                      <Star size={14} fill="#6240A0" color="#6240A0" /> {parseFloat(vendor.average_rating).toFixed(2)} ({vendor.review_count})
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{vendor.business_name}</h3>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {vendor.bio}
                  </p>
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Starting from</span>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--color-text-title)' }}>
                        ₹{parseFloat(vendor.starting_price).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <Link to={`/vendors/${vendor.id}`} className="btn btn-secondary btn-sm">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '80px 0', background: 'var(--color-bg-page)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
              Seamless Experience
            </span>
            <h2 style={{ marginTop: '8px' }}>How EventEase Works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', textAlign: 'center' }}>
            <div>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--grad-button-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 800,
                margin: '0 auto 20px',
                boxShadow: '0 8px 20px rgba(98, 64, 160, 0.25)'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Define Event Vision</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Enter your date, budget, guest count, city, and service requirements using our event wizard.
              </p>
            </div>

            <div>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--grad-button-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 800,
                margin: '0 auto 20px',
                boxShadow: '0 8px 20px rgba(98, 64, 160, 0.25)'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Receive AI Matches</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Our rule engine scores vendors across category, budget, proximity, and live calendar availability.
              </p>
            </div>

            <div>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--grad-button-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 800,
                margin: '0 auto 20px',
                boxShadow: '0 8px 20px rgba(98, 64, 160, 0.25)'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Book & Collaborate</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                Send booking inquiries, chat directly, receive custom quotes, and review verified completed events.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
