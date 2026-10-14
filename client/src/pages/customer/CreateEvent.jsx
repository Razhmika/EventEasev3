import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, PlusCircle, Trash2, Sparkles, ArrowRight, DollarSign } from 'lucide-react';
import api from '../../services/api';

export const CreateEvent = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Coimbatore');
  const [guestCount, setGuestCount] = useState('250');
  const [totalBudget, setTotalBudget] = useState('150000');
  const [themeStyle, setThemeStyle] = useState('Traditional Tamil Wedding');
  const [description, setDescription] = useState('');

  // Selected Service Requirements
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
        // Default with first 2 categories
        if (res.data.length >= 2) {
          setRequirements([
            { categoryId: res.data[0].id, allocatedBudget: '50000', specialRequests: '' },
            { categoryId: res.data[1].id, allocatedBudget: '25000', specialRequests: '' }
          ]);
        }
      }
    }).catch((e) => console.error(e));
  }, []);

  const handleAddRequirement = () => {
    if (categories.length > 0) {
      setRequirements([
        ...requirements,
        { categoryId: categories[0].id, allocatedBudget: '2000', specialRequests: '' }
      ]);
    }
  };

  const handleRemoveRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index, field, value) => {
    const updated = [...requirements];
    updated[index][field] = value;
    setRequirements(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (requirements.length === 0) {
      setError('Please add at least one required service category for your event.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/events', {
        title,
        eventType,
        eventDate,
        eventTime,
        location,
        city,
        guestCount,
        totalBudget,
        themeStyle,
        description,
        requirements
      });

      if (res.success && res.data) {
        navigate(`/customer/events/${res.data.eventId}/recommendations`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create event requirement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
          Requirement Intake Wizard
        </span>
        <h1 style={{ fontSize: '2.2rem', marginTop: '4px' }}>Create Event Requirement</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
          Specify your celebration parameters. Our backend rule engine will calculate instant weighted artisan compatibility.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
        
        {/* Section 1: Basic Event Details */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
            1. Event Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Celestial Autumn Anniversary Gala"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Event Category *
              </label>
              <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                <option value="Wedding & Reception">Wedding & Reception</option>
                <option value="Anniversary Gala">Anniversary Gala</option>
                <option value="Corporate Milestone">Corporate Milestone</option>
                <option value="Luxury Birthday Celebration">Luxury Birthday Celebration</option>
                <option value="Intimate Dinner Soirée">Intimate Dinner Soirée</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Event Date *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Approximate Time
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Venue / Venue Concept Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Private Estate / Presidio Conservatory"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                City *
              </label>
              <input
                type="text"
                required
                placeholder="Coimbatore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Expected Guest Count *
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                placeholder="250"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Total Estimated Budget (₹) *
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                placeholder="150000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Required Services */}
        <div style={{ marginBottom: '28px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-primary-dark)' }}>
                2. Required Services & Category Budgets
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                The recommendation engine uses these categories to filter and score compatible artisans.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRequirement}
              className="btn btn-secondary btn-sm"
            >
              <PlusCircle size={15} /> Add Service
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requirements.map((req, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  background: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary-soft)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 2fr 40px',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                    Service Category
                  </label>
                  <select
                    value={req.categoryId}
                    onChange={(e) => handleRequirementChange(idx, 'categoryId', parseInt(e.target.value, 10))}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                    Budget Allocation (₹)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="25000"
                    value={req.allocatedBudget}
                    onChange={(e) => handleRequirementChange(idx, 'allocatedBudget', e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-title)', display: 'block', marginBottom: '4px' }}>
                    Specific Notes / Style
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional banana leaf feast with live counters"
                    value={req.specialRequests}
                    onChange={(e) => handleRequirementChange(idx, 'specialRequests', e.target.value)}
                  />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    style={{ color: 'var(--color-danger)', padding: '6px' }}
                    title="Remove category"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Aesthetics & Theme */}
        <div style={{ marginBottom: '28px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', color: 'var(--color-primary-dark)' }}>
            3. Aesthetic & Vision
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Theme, Mood & Color Palette
            </label>
            <input
              type="text"
              placeholder="e.g. Modern Lavender Minimalist, Candlelit Silk, French Garden Romance"
              value={themeStyle}
              onChange={(e) => setThemeStyle(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Additional Event Description & Notes
            </label>
            <textarea
              rows={4}
              placeholder="Share any special vision notes, guest experience ideas, or dietary preferences..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate('/customer/events')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Processing...' : 'Save & Calculate AI Recommendations'} <ArrowRight size={16} />
          </button>
        </div>

      </form>
    </div>
  );
};
