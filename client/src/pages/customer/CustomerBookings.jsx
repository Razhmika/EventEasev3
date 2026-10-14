import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookmarkCheck, Star, Calendar, MessageSquare, X, CheckCircle, AlertCircle, Store } from 'lucide-react';
import api from '../../services/api';
import ServiceRequirementsBadge from '../../components/booking/ServiceRequirementsBadge';

export const CustomerBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagingLoadingId, setMessagingLoadingId] = useState(null);

  // Review Modal State
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.success) setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleMessageVendor = async (b) => {
    setMessagingLoadingId(b.id);
    try {
      const res = await api.post('/messages/conversations/initiate', {
        vendorId: b.vendor_id,
        bookingId: b.id,
        eventId: b.event_id
      });
      if (res.success && res.data?.conversationId) {
        navigate(`/customer/messages?convId=${res.data.conversationId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to open chat with vendor.');
    } finally {
      setMessagingLoadingId(null);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking inquiry?')) return;
    try {
      const res = await api.put(`/bookings/${id}/status`, { status: 'cancelled' });
      if (res.success) fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalBooking) return;

    setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: reviewModalBooking.id,
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewModalBooking(null);
          setReviewSuccess(false);
          setReviewComment('');
          fetchBookings();
        }, 1500);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem', margin: '0 0 6px', color: 'var(--color-text-title)' }}>
          My Bookings & Direct Inquiries
        </h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem', margin: 0 }}>
          Track the status of your vendor inquiries, binding quotes in INR (₹), and confirmed contracts.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 40, height: 40, border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>Loading booking tracker...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <BookmarkCheck size={48} color="var(--color-primary-dark)" style={{ margin: '0 auto 16px' }} />
          <h3>No Booking Requests Yet</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Discover verified photographers, venues, and caterers on the marketplace to send direct booking inquiries.
          </p>
          <Link to="/customer/vendors" className="btn btn-primary btn-sm">
            <Store size={15} /> Explore Marketplace Vendors
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((b) => (
            <div key={b.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src={b.vendor_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80'}
                    alt={b.business_name}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary-soft)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-text-title)' }}>
                        {b.business_name}
                      </h3>
                      <span className={`badge badge-${b.status}`}>
                        {b.status.toUpperCase()}
                      </span>
                      {b.service_title && (
                        <span className="badge badge-match">
                          {b.service_title}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-primary-dark)', fontWeight: 600, display: 'block', marginTop: '3px' }}>
                      {b.category_name} &bull; For "{b.event_title}" ({b.event_date})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleMessageVendor(b)}
                    disabled={messagingLoadingId === b.id}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={14} color="var(--color-primary-dark)" />
                    {messagingLoadingId === b.id ? 'Opening...' : 'Message Studio'}
                  </button>

                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      Cancel Request
                    </button>
                  )}

                  {b.status === 'completed' && !b.review_id && (
                    <button
                      onClick={() => {
                        setReviewModalBooking(b);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <Star size={14} /> Leave Review
                    </button>
                  )}

                  {b.review_id && (
                    <span className="badge badge-verified" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={13} fill="#288059" color="#288059" /> Reviewed ({b.review_rating}★)
                    </span>
                  )}
                </div>
              </div>

              {/* Quote & Details Box */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                padding: '16px',
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-primary-soft)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Quotation Amount</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-title)' }}>
                    ₹{parseFloat(b.quote_amount || 0).toLocaleString('en-IN')}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                    Inquiry Date: {new Date(b.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Your Inquiry Message:</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-body)', margin: '2px 0 0' }}>
                    "{b.customer_notes || 'No custom notes attached.'}"
                  </p>
                </div>
              </div>

              {/* Service-Specific Detailed Requirements */}
              <div style={{ marginTop: '14px' }}>
                <ServiceRequirementsBadge booking={b} />
              </div>

              {/* STATUS-SPECIFIC BANNERS */}
              {b.status === 'rejected' && (
                <div style={{
                  marginTop: '14px',
                  padding: '14px 16px',
                  background: '#FFF5F5',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '4px solid var(--color-danger)'
                }}>
                  <strong style={{ color: 'var(--color-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <AlertCircle size={15} /> Booking Declined by Vendor
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-body)' }}>
                    <strong>Reason:</strong> "{b.rejection_reason || b.vendor_response || 'The vendor is unable to accommodate this booking.'}"
                  </p>
                </div>
              )}

              {b.status === 'accepted' && (
                <div style={{
                  marginTop: '14px',
                  padding: '14px 16px',
                  background: 'var(--color-success-bg)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '4px solid var(--color-success)'
                }}>
                  <strong style={{ color: 'var(--color-success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <CheckCircle size={15} /> Booking Confirmed & Accepted by Studio
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-body)' }}>
                    "{b.vendor_response || 'We look forward to executing your celebration vision flawlessly!'}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0 }}>Review {reviewModalBooking.business_name}</h3>
              <button onClick={() => setReviewModalBooking(null)}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>

            {reviewSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
                <h4>Review Published!</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Thank you for sharing your experience. The vendor's rating has been updated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    Star Rating (1 - 5)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{ padding: '6px', background: 'none' }}
                      >
                        <Star
                          size={32}
                          fill={star <= reviewRating ? '#6240A0' : '#E8E2F2'}
                          color={star <= reviewRating ? '#6240A0' : '#E8E2F2'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Written Feedback & Experience
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how the vendor contributed to making your celebration special..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setReviewModalBooking(null)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={reviewSubmitting} className="btn btn-primary btn-sm">
                    {reviewSubmitting ? 'Posting Review...' : 'Submit Verified Review'}
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
