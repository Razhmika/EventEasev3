import React, { useState, useEffect } from 'react';
import { CalendarDays, PlusCircle, CheckCircle, ShieldAlert, Lock, Info } from 'lucide-react';
import api from '../../services/api';

export const CalendarManager = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('blocked');
  const [notes, setNotes] = useState('Personal Studio Blackout');
  const [submitting, setSubmitting] = useState(false);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendors/me/availability');
      if (res.success) setAvailability(res.data || []);
    } catch (err) {
      console.error('Failed to load availability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleSetAvailability = async (e) => {
    e.preventDefault();
    if (!date) return;

    setSubmitting(true);
    try {
      const res = await api.post('/vendors/me/availability', {
        date,
        status,
        notes
      });
      if (res.success) {
        setDate('');
        setNotes('');
        fetchAvailability();
      }
    } catch (err) {
      alert(err.message || 'Failed to update date availability.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem' }}>Availability & Schedule Manager</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
          Prevent scheduling collisions. Confirmed event bookings automatically lock dates in your calendar.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px' }}>
        
        {/* Set Blackout / Open Date Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Manage Date Schedule</h3>
          <form onSubmit={handleSetAvailability} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Select Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Status
              </label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="blocked">Blocked / Blackout (Unavailable)</option>
                <option value="available">Prime Available</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Reason / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Studio Vacation, Private Gala"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '8px' }}>
              {submitting ? 'Updating...' : 'Save Date Status'}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'var(--color-primary-light)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Info size={16} color="var(--color-primary-dark)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Dates marked <strong>Blocked</strong> or <strong>Booked</strong> are flagged immediately in customer search and the recommendation engine.
            </span>
          </div>
        </div>

        {/* Calendar Schedule List */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Upcoming Scheduled Dates</h3>

          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading schedule...</p>
          ) : availability.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '36px 0', fontSize: '0.9rem' }}>
              No custom blackout dates configured. Your studio is currently open for booking on all upcoming dates!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {availability.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: a.status === 'booked' ? 'var(--color-primary-light)' : a.status === 'blocked' ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                    border: '1px solid',
                    borderColor: a.status === 'booked' ? 'var(--color-primary-soft)' : a.status === 'blocked' ? 'rgba(192, 45, 56, 0.2)' : 'rgba(40, 128, 89, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text-title)' }}>
                      {new Date(a.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>
                      {a.notes || (a.status === 'booked' ? 'Confirmed Event Booking' : 'Date Reserved')}
                    </span>
                  </div>

                  <span className={`badge badge-${a.status === 'booked' ? 'completed' : a.status === 'blocked' ? 'rejected' : 'verified'}`}>
                    {a.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
