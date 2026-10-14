import React, { useState } from 'react';
import { Sparkles, Calendar, DollarSign, CheckSquare, Lightbulb, Palette, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export const AIPlannerPage = () => {
  const [eventType, setEventType] = useState('Wedding Reception');
  const [guestCount, setGuestCount] = useState('200');
  const [totalBudget, setTotalBudget] = useState('250000');
  const [location, setLocation] = useState('Coimbatore, Tamil Nadu');
  const [themeStyle, setThemeStyle] = useState('Traditional Tamil Wedding & Floral Decor');
  const [notes, setNotes] = useState('Traditional vegetarian feast, stage flower decoration, and candid photography.');

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [checkedTasks, setCheckedTasks] = useState({});

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/ai/plan', {
        eventType,
        guestCount,
        totalBudget,
        location,
        themeStyle,
        notes
      });

      if (res.success && res.data) {
        setPlan(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate event plan.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskIndex) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [taskIndex]: !prev[taskIndex]
    }));
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-pill)', color: 'var(--color-primary-dark)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
          <Sparkles size={14} /> Powered by Google Gemini & Algorithmic Planning Fallback
        </div>
        <h1 style={{ fontSize: '2.3rem' }}>AI Event Planning Studio</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '1rem' }}>
          Generate tailored concepts, comprehensive budget allocations, and milestone checklists for your celebration.
        </p>
      </div>

      {/* Input Parameters Form */}
      <form onSubmit={handleGeneratePlan} className="card" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Event Type
            </label>
            <input
              type="text"
              required
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Guest Count
            </label>
            <input
              type="number"
              required
              min={10}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Total Budget (₹)
            </label>
            <input
              type="number"
              required
              min={1000}
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Target Location / City
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Desired Theme / Aesthetic
            </label>
            <input
              type="text"
              value={themeStyle}
              onChange={(e) => setThemeStyle(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Notes & Special Elements
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Consulting Planning Assistant...' : 'Generate AI Event Strategy'} <Sparkles size={16} />
          </button>
        </div>
      </form>

      {error && (
        <div style={{ padding: '16px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Generated AI Results */}
      {plan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Executive Summary Card */}
          <div className="card" style={{ background: 'var(--grad-hero)', border: '1px solid var(--color-primary-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="badge badge-match" style={{ textTransform: 'uppercase' }}>
                {plan.source === 'gemini_ai' ? 'Google Gemini AI Analysis' : 'Algorithmic Planning Engine'}
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Executive Planning Summary</h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-title)', lineHeight: 1.6 }}>
              {plan.summary}
            </p>
          </div>

          {/* Theme & Palette Concepts */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={20} color="var(--color-primary-dark)" /> Curated Theme & Aesthetic Concepts
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {plan.themeSuggestions?.map((thm, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary-light)',
                    border: '1px solid var(--color-primary-soft)'
                  }}
                >
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{thm.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-body)', lineHeight: 1.5, marginBottom: '14px' }}>
                    {thm.description}
                  </p>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                      Color Palette:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {thm.palette?.map((col, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            background: '#FFFFFF',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-title)',
                            fontWeight: 600
                          }}
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preliminary Budget Allocation Table */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--color-primary-dark)" /> Recommended Budget Allocation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {plan.budgetBreakdown?.map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 80px 100px 2fr',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--color-surface-soft)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--color-text-title)', fontSize: '0.9rem' }}>
                    {b.category}
                  </span>
                  <span className="badge badge-match">
                    {b.percentage}%
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--color-text-title)', fontSize: '0.95rem' }}>
                    ₹{parseFloat(b.amount).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                    {b.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Checklist */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={20} color="var(--color-primary-dark)" /> Phase-by-Phase Planning Checklist
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {plan.checklist?.map((phase, pIdx) => (
                <div key={pIdx}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
                    {phase.phase}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {phase.tasks?.map((task, tIdx) => {
                      const key = `${pIdx}-${tIdx}`;
                      const isDone = !!checkedTasks[key];
                      return (
                        <div
                          key={tIdx}
                          onClick={() => toggleTask(key)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            background: isDone ? 'var(--color-success-bg)' : 'var(--color-surface-card)',
                            border: '1px solid',
                            borderColor: isDone ? 'var(--color-success)' : varCss('--color-border'),
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            textDecoration: isDone ? 'line-through' : 'none',
                            opacity: isDone ? 0.75 : 1
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            readOnly
                            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-dark)' }}
                          />
                          <span style={{ fontSize: '0.875rem', color: isDone ? 'var(--color-success)' : 'var(--color-text-body)' }}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expert Recommendations */}
          <div className="card" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-soft)' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={20} color="var(--color-primary-dark)" /> Director's Strategic Recommendations
            </h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {plan.recommendations?.map((rec, idx) => (
                <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--color-text-title)', lineHeight: 1.5 }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
};

// Helper for style literal fallback
function varCss(v) { return '#E8E2F2'; }
