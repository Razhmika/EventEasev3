import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import api from '../../services/api';
import ServiceRequirementsBadge from '../../components/booking/ServiceRequirementsBadge';

export const VendorBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Response Modal State
  const [actionModalBooking, setActionModalBooking] = useState(null);
  const [actionType, setActionType] = useState('accepted'); // 'accepted' or 'rejected'
  const [quoteAmount, setQuoteAmount] = useState('');
  const [vendorResponse, setVendorResponse] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [messagingLoadingId, setMessagingLoadingId] = useState(null);

  const suggestedReasons = [
    'Unavailable on the requested date',
    'Outside our service coverage area',
    'Requested service is not currently offered',
    'Budget or requirements cannot be accommodated',
    'Another scheduling conflict',
    'Other reason'
  ];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.success) setBookings(res.data || []);
    } catch (err) {
      console.error('Failed to load vendor bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenAction = (booking, type) => {
    setActionModalBooking(booking);
    setActionType(type);
    if (type === 'accepted') {
      setQuoteAmount(booking.quote_amount || '');
      setVendorResponse(
        `We are delighted to accept your booking for "${booking.event_title}". We look forward to executing your celebration vision flawlessly!`
      );
      setRejectionReason('');
    } else {
      setQuoteAmount('');
      setVendorResponse('');
      setRejectionReason('');
    }
  };

  const handleMessageCustomer = async (booking) => {
    setMessagingLoadingId(booking.id);
    try {
      const res = await api.post('/messages/conversations/initiate', {
        customerId: booking.customer_id,
        bookingId: booking.id,
        eventId: booking.event_id
      });
      if (res.success && res.data?.conversationId) {
        navigate(`/vendor/messages?convId=${res.data.conversationId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to initiate conversation with client.');
    } finally {
      setMessagingLoadingId(null);
    }
  };

  const handleCompleteEvent = async (id) => {
    if (!window.confirm('Mark this event as completed? This will allow the host to submit a verified review.')) return;
    try {
      const res = await api.put(`/bookings/${id}/status`, { status: 'completed' });
      if (res.success) fetchBookings();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionModalBooking) return;

    if (actionType === 'rejected' && !rejectionReason.trim()) {
      alert('A rejection reason is strictly required before declining a booking.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        status: actionType,
        quoteAmount: actionType === 'accepted' ? quoteAmount : null,
        vendorResponse: actionType === 'accepted' ? vendorResponse : rejectionReason.trim(),
        rejectionReason: actionType === 'rejected' ? rejectionReason.trim() : null
      };

      const res = await api.put(`/bookings/${actionModalBooking.id}/status`, payload);

      if (res.success) {
        setActionModalBooking(null);
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to update booking status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem', margin: '0 0 6px', color: 'var(--color-text-title)' }}>
          Booking Requests & Contracts
        </h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem', margin: 0 }}>
          Evaluate client celebration requirements, submit binding INR quotes, and manage your confirmed calendar.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 40, height: 40, border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>Loading incoming inquiries...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <BookmarkCheck size={48} color="var(--color-primary-dark)" style={{ margin: '0 auto 16px' }} />
          <h3>No Booking Inquiries Received</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto', fontSize: '0.9rem' }}>
            When clients discover your services in the marketplace and submit direct booking inquiries, they will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {bookings.map((b) => (
            <div key={b.id} className="card" style={{ padding: '26px' }}>
              
              {/* Header with status and quick buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--color-text-title)' }}>
                      {b.event_title}
                    </h3>
                    <span className={`badge badge-${b.status}`}>
                      {b.status.toUpperCase()}
                    </span>
                    {b.service_title && (
                      <span className="badge badge-match">
                        Requested: {b.service_title}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Inquiry submitted: {new Date(b.created_at).toLocaleDateString()} &bull; Occasion: <strong>{b.event_type}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleMessageCustomer(b)}
                    disabled={messagingLoadingId === b.id}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={14} color="var(--color-primary-dark)" />
                    {messagingLoadingId === b.id ? 'Opening...' : 'Message Host'}
                  </button>

                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleOpenAction(b, 'accepted')}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 size={15} /> Accept Request
                      </button>
                      <button
                        onClick={() => handleOpenAction(b, 'rejected')}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                      >
                        <XCircle size={15} /> Decline
                      </button>
                    </>
                  )}

                  {b.status === 'accepted' && (
                    <button
                      onClick={() => handleCompleteEvent(b.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <CheckCircle2 size={15} /> Mark Completed
                    </button>
                  )}
                </div>
              </div>

              {/* Host and Event Parameters Overview Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                padding: '18px',
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '18px',
                border: '1px solid var(--color-primary-soft)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Host Contact</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-title)' }}>
                    {b.customer_first_name} {b.customer_last_name}
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-body)', marginTop: '2px' }}>
                    {b.customer_phone ? <span><Phone size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {b.customer_phone}</span> : b.customer_email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Date & Time</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-title)' }}>
                    {b.event_date}
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {b.event_time ? `Starts at ${b.event_time}` : 'Full Day'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>
                    {b.category_slug === 'bridal-makeup'
                      ? 'Location & People'
                      : b.category_slug === 'catering'
                      ? 'Location & Plates'
                      : b.category_slug === 'venues'
                      ? 'Venue & Capacity'
                      : 'Location & Scope'}
                  </span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-title)' }}>
                    {b.event_city}
                  </strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {b.category_slug === 'bridal-makeup'
                      ? `${b.service_requirements?.peopleCount || 1} people • ${b.service_requirements?.gettingReadyLocation || b.event_location}`
                      : b.category_slug === 'catering'
                      ? `${b.service_requirements?.plateCount || b.guest_count} plates • ${b.service_requirements?.foodPreference || 'Feast'}`
                      : b.category_slug === 'venues'
                      ? `${b.service_requirements?.guestCount || b.guest_count} guests capacity`
                      : `${b.event_location || 'Venue TBD'}${b.guest_count ? ` • ${b.guest_count} guests` : ''}`}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Client Budget / Offer</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--color-text-title)' }}>
                    ₹{parseFloat(b.quote_amount || 0).toLocaleString('en-IN')}
                  </strong>
                  {b.service_pricing_unit && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
                      per {b.service_pricing_unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Service-Specific Detailed Requirements */}
              <ServiceRequirementsBadge booking={b} />

              {/* Message & Feedback Sections */}
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                  Client Message & Event Vision:
                </span>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-body)', margin: '0 0 12px', background: 'var(--color-surface-soft)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                  "{b.customer_notes || b.requirements_notes || 'No custom notes provided by host.'}"
                </p>

                {b.vendor_response && (
                  <div style={{ padding: '12px 14px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-primary-dark)' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary-dark)', display: 'block', marginBottom: '2px' }}>
                      Your Studio Response / Terms:
                    </span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-body)', margin: 0 }}>
                      "{b.vendor_response}"
                    </p>
                  </div>
                )}

                {b.rejection_reason && (
                  <div style={{ marginTop: '10px', padding: '12px 14px', background: '#FFF5F5', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-danger)' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-danger)', display: 'block', marginBottom: '2px' }}>
                      Reason Declined:
                    </span>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-body)', margin: 0 }}>
                      "{b.rejection_reason}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept / Decline Modal */}
      {actionModalBooking && (
        <div className="modal-overlay" onClick={() => setActionModalBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h3 style={{ margin: '0 0 3px', fontSize: '1.3rem' }}>
                  {actionType === 'accepted' ? 'Accept Booking Inquiry' : 'Decline Booking Request'}
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  For "{actionModalBooking.event_title}" ({actionModalBooking.event_date})
                </span>
              </div>
              <button onClick={() => setActionModalBooking(null)}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* ACCEPTANCE FLOW: Custom Quote Amount & Terms */}
              {actionType === 'accepted' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Agreed Quotation Amount (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 75000"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                      Accepting commits this quote and locks the date ({actionModalBooking.event_date}) as booked in your calendar.
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Quotation Terms & Welcome Note *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={vendorResponse}
                      onChange={(e) => setVendorResponse(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* REJECTION FLOW: Mandatory Reason with Suggested Quick-Picks */}
              {actionType === 'rejected' && (
                <>
                  <div style={{
                    padding: '12px',
                    background: '#FFF5F5',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #FFE3E3',
                    fontSize: '0.85rem',
                    color: 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>A clear explanation is required to maintain transparency with clients.</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                      Select a Suggested Reason:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {suggestedReasons.map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setRejectionReason(reason)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--color-border)',
                            background: rejectionReason === reason ? 'var(--color-primary-light)' : '#FFFFFF',
                            borderColor: rejectionReason === reason ? 'var(--color-primary-dark)' : 'var(--color-border)',
                            color: rejectionReason === reason ? 'var(--color-primary-dark)' : 'var(--color-text-title)',
                            cursor: 'pointer'
                          }}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Rejection Explanation / Note to Client *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Please explain why you cannot accommodate this booking..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
                <button type="button" onClick={() => setActionModalBooking(null)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (actionType === 'rejected' && !rejectionReason.trim())}
                  className={`btn btn-${actionType === 'accepted' ? 'primary' : 'danger'} btn-sm`}
                >
                  {submitting ? 'Updating...' : actionType === 'accepted' ? 'Confirm Acceptance' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

