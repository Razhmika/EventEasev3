import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PlusCircle, Sparkles, MapPin, DollarSign, Users, Trash2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      if (res.success) setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCancelEvent = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this event requirement?')) return;
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.success) fetchEvents();
    } catch (err) {
      alert(err.message || 'Failed to cancel event.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem' }}>My Event Requirements</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
            Manage active celebrations, view requirements, and explore rule-matched artisans.
          </p>
        </div>
        <Link to="/customer/events/new" className="btn btn-primary">
          <PlusCircle size={18} /> Create New Event
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 40, height: 40, border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>Loading celebrations...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Calendar size={48} color="var(--color-primary-dark)" style={{ margin: '0 auto 16px' }} />
          <h3>No Event Requirements Yet</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Start by creating your first celebration requirement to unlock tailored vendor recommendations.
          </p>
          <Link to="/customer/events/new" className="btn btn-primary btn-sm">
            Create First Event
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {events.map((evt) => (
            <div key={evt.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{evt.title}</h3>
                    <span className={`badge badge-${evt.status}`}>
                      {evt.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                    {evt.event_type} &bull; {evt.theme_style || 'Curated Aesthetic'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {evt.status !== 'cancelled' && (
                    <>
                      <Link
                        to={`/customer/events/${evt.id}/recommendations`}
                        className="btn btn-primary btn-sm"
                      >
                        <Sparkles size={15} /> View AI Recommendations
                      </Link>
                      <button
                        onClick={() => handleCancelEvent(evt.id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--color-danger)', borderColor: 'rgba(192, 45, 56, 0.2)' }}
                      >
                        <Trash2 size={15} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
                padding: '16px',
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Date & Time</span>
                  <strong style={{ fontSize: '0.9rem' }}>{evt.event_date} {evt.event_time ? `@ ${evt.event_time}` : ''}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>City / Venue</span>
                  <strong style={{ fontSize: '0.9rem' }}>{evt.city}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Guests</span>
                  <strong style={{ fontSize: '0.9rem' }}>{evt.guest_count} attendees</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Allocated Budget</span>
                  <strong style={{ fontSize: '0.9rem' }}>₹{parseFloat(evt.total_budget).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Requirements</span>
                  <strong style={{ fontSize: '0.9rem' }}>{evt.requirements_count} categories specified</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
