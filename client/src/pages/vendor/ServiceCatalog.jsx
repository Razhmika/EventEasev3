import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Briefcase, Check, X, DollarSign } from 'lucide-react';
import api from '../../services/api';

export const ServiceCatalog = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pricingUnit, setPricingUnit] = useState('event');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servRes, catRes] = await Promise.all([
        api.get('/vendors/me/services'),
        api.get('/categories')
      ]);

      if (servRes.success) setServices(servRes.data || []);
      if (catRes.success) {
        setCategories(catRes.data || []);
        if (catRes.data.length > 0) setCategoryId(catRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingServiceId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setPricingUnit('event');
    setIsActive(true);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setShowModal(true);
  };

  const handleOpenEdit = (s) => {
    setEditingServiceId(s.id);
    setCategoryId(s.category_id);
    setTitle(s.title);
    setDescription(s.description || '');
    setPrice(s.price);
    setPricingUnit(s.pricing_unit || 'event');
    setIsActive(s.is_active);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service listing?')) return;
    try {
      const res = await api.delete(`/vendors/me/services/${id}`);
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete service.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingServiceId) {
        await api.put(`/vendors/me/services/${editingServiceId}`, {
          categoryId,
          title,
          description,
          price,
          pricingUnit,
          isActive
        });
      } else {
        await api.post('/vendors/me/services', {
          categoryId,
          title,
          description,
          price,
          pricingUnit
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem' }}>Service Catalog</h1>
          <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
            Define bespoke packages, menu options, and pricing structures visible to event planners.
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <PlusCircle size={18} /> Add New Service
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 40, height: 40, border: '4px solid var(--color-primary-soft)', borderTopColor: 'var(--color-primary-dark)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-text-title)', fontWeight: 600 }}>Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Briefcase size={48} color="var(--color-primary-dark)" style={{ margin: '0 auto 16px' }} />
          <h3>No Services Listed</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            List your signature packages to enable the rule recommendation engine to match your studio.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">Add First Service</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {services.map((s) => (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', opacity: s.is_active ? 1 : 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-dark)', textTransform: 'uppercase' }}>
                  {s.category_name}
                </span>
                <span className={`badge badge-${s.is_active ? 'verified' : 'suspended'}`} style={{ fontSize: '0.7rem' }}>
                  {s.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5, flex: 1, marginBottom: '16px' }}>
                {s.description || 'No detailed description.'}
              </p>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-title)' }}>
                    ₹{parseFloat(s.price).toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
                    per {s.pricing_unit}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenEdit(s)} className="btn btn-outline btn-sm" title="Edit service">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="btn btn-outline btn-sm" style={{ color: 'var(--color-danger)' }} title="Delete service">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0 }}>{editingServiceId ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Stage Decoration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="15000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Pricing Unit *
                  </label>
                  <select value={pricingUnit} onChange={(e) => setPricingUnit(e.target.value)}>
                    <option value="event">per Event</option>
                    <option value="plate">per Plate</option>
                    <option value="guest">per Guest</option>
                    <option value="hour">per Hour</option>
                    <option value="day">per Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Description & Inclusions
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the service you offer"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {editingServiceId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-dark)' }}
                  />
                  <label htmlFor="isActive" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Listing is Active & Visible
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                  {submitting ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
