import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import api from '../../services/api';

export const Recommendations = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal
  const [bookingModalVendor, setBookingModalVendor] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [evtRes, recRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/recommendations/event/${id}`)
      ]);

      if (evtRes.success) setEvent(evtRes.data);
      if (recRes.success) setRecommendations(recRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [id]);

  const handleOpenBooking = (vendor) => {
    setBookingModalVendor(vendor);
    if (vendor.services?.length > 0) {
      // Find category id if available
      setSelectedCategoryId(vendor.services[0].categoryId || 1);
    }
    setQuoteAmount(vendor.startingPrice || '');
    setCustomerNotes(`We would love to discuss working together for "${event?.title}".`);
  };

  const handleSendBooking = async (e) => {
    e.preventDefault();
    if (!bookingModalVendor) return;

    setSubmittingBooking(true);
    try {
      const res = await api.post('/bookings', {
        eventId: parseInt(id, 10),
        vendorId: bookingModalVendor.id,
        categoryId: selectedCategoryId || 1,
        quoteAmount: quoteAmount || bookingModalVendor.startingPrice,
        customerNotes
      });

      if (res.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingModalVendor(null);
          setBookingSuccess(false);
          fetchRecommendations();
        }, 1200);
      }
    } catch (err) {
      alert(err.message || 'Failed to send booking inquiry.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ width: 44, height: 44, border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <h3 style={{ color: 'var(--color-text-title)' }}>Calculating Multi-Criteria Match Scores...</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Filtering categories, checking budgets, comparing locations & verifying date availability.
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h3>Unable to Load Recommendations</h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>{error}</p>
        <Link to="/customer/events" className="btn btn-primary btn-sm">Return to My Events</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Event Header Summary */}
      <div style={{
        background: 'var(--grad-hero)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
              Rule-Based Recommendation Engine
            </span>
            <h1 style={{ fontSize: '2.1rem', margin: '4px 0 8px' }}>{event.title}</h1>
            <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
              Scheduled for <strong>{event.event_date}</strong> in <strong>{event.city}</strong> &bull; Total Budget: <strong>₹{parseFloat(event.total_budget).toLocaleString('en-IN')}</strong> &bull; {event.guest_count} Guests
            </p>
          </div>
          <Link to={`/customer/events`} className="btn btn-outline btn-sm">
            &larr; Back to Events
          </Link>
        </div>

        {/* Engine Transparency Notice */}
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-primary-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.825rem',
          color: 'var(--color-text-muted)'
        }}>
          <Info size={18} color="var(--color-primary-dark)" style={{ flexShrink: 0 }} />
          <span>
            <strong>Deterministic Multi-Criteria Scoring:</strong> Ranked out of 100 points based on Category Compatibility (35 pts), Budget Alignment (25 pts), Location Proximity (15 pts), Date Availability (15 pts), and Verified Track Record (10 pts).
          </span>
        </div>
      </div>

      {/* Recommendations List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem' }}>
            {recommendations.length} Matched Vendors
          </h2>
        </div>

        {recommendations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Sparkles size={40} color="var(--color-primary-dark)" style={{ margin: '0 auto 16px' }} />
            <h3>No Direct Category Matches Found</h3>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
              We could not find verified vendors offering the exact service categories requested for this event. Try adding additional service requirements or adjusting budget parameters.
            </p>
            <Link to={`/customer/events`} className="btn btn-secondary btn-sm">
              Edit Event Requirements
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {recommendations.map((item, index) => {
              const { vendor, matchScore, breakdown, matchReasons, existingBookingStatus } = item;
              return (
                <div
                  key={vendor.id}
                  className="card"
                  style={{
                    padding: '24px',
                    display: 'grid',
                    gridTemplateColumns: '260px 1fr 220px',
                    gap: '24px',
                    alignItems: 'center'
                  }}
                >
                  {/* Left Column: Vendor Identity */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                      <img
                        src={vendor.avatarUrl}
                        alt={vendor.businessName}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-soft)' }}
                      />
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                          #{index + 1} Best Match
                        </span>
                        <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{vendor.businessName}</h3>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {vendor.city}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} fill="#6240A0" color="#6240A0" /> {parseFloat(vendor.averageRating).toFixed(2)} ({vendor.reviewCount} reviews)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-title)', fontWeight: 600 }}>
                        <DollarSign size={13} /> Starts at ₹{parseFloat(vendor.startingPrice).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ marginTop: '14px' }}>
                      <Link to={`/vendors/${vendor.id}`} style={{ fontSize: '0.825rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Inspect Studio Profile <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Center Column: Match Score & Explainability Reasons */}
                  <div style={{ borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', padding: '0 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                          Rule Compatibility Score
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                            {matchScore}%
                          </span>
                          <span className="badge badge-match">
                            {matchScore >= 95 ? 'Exceptional Fit' : matchScore >= 80 ? 'Strong Match' : 'Compatible'}
                          </span>
                        </div>
                      </div>

                      {/* Mini Breakdown Visualizer */}
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', textAlign: 'center' }}>
                        <div style={{ background: 'var(--color-primary-light)', padding: '4px 8px', borderRadius: 'var(--radius-xs)' }}>
                          <span style={{ display: 'block', fontWeight: 700 }}>{breakdown.category}/35</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Category</span>
                        </div>
                        <div style={{ background: 'var(--color-primary-light)', padding: '4px 8px', borderRadius: 'var(--radius-xs)' }}>
                          <span style={{ display: 'block', fontWeight: 700 }}>{breakdown.budget}/25</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Budget</span>
                        </div>
                        <div style={{ background: 'var(--color-primary-light)', padding: '4px 8px', borderRadius: 'var(--radius-xs)' }}>
                          <span style={{ display: 'block', fontWeight: 700 }}>{breakdown.location}/15</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Location</span>
                        </div>
                        <div style={{ background: 'var(--color-primary-light)', padding: '4px 8px', borderRadius: 'var(--radius-xs)' }}>
                          <span style={{ display: 'block', fontWeight: 700 }}>{breakdown.availability}/15</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Date</span>
                        </div>
                      </div>
                    </div>

                    {/* Explanatory Match Bullets */}
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '6px' }}>
                        Why This Vendor Matches:
                      </span>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {matchReasons.map((reason, rIdx) => (
                          <li key={rIdx} style={{ fontSize: '0.8rem', color: 'var(--color-text-body)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <CheckCircle size={14} color="var(--color-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Booking Action */}
                  <div style={{ textAlign: 'center' }}>
                    {existingBookingStatus ? (
                      <div style={{ padding: '12px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Inquiry Status:</span>
                        <span className={`badge badge-${existingBookingStatus}`} style={{ marginTop: '4px' }}>
                          {existingBookingStatus.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenBooking(vendor)}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        Request Quote
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Inquiry Modal */}
      {bookingModalVendor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0 }}>Request Booking: {bookingModalVendor.businessName}</h3>
              <button onClick={() => setBookingModalVendor(null)}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
                <h4>Booking Inquiry Sent!</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  The vendor has been notified and will review your event requirements.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Event:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${event.title} (${event.event_date})`}
                    style={{ background: 'var(--color-primary-light)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Proposed Budget / Offer (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Custom Message & Vision Details
                  </label>
                  <textarea
                    rows={4}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setBookingModalVendor(null)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingBooking} className="btn btn-primary btn-sm">
                    {submittingBooking ? 'Sending...' : 'Confirm & Send Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
