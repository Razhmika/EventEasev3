import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, MapPin, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import api from '../../services/api';

export const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/vendors');
      if (res.success) setVendors(res.data || []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleUpdateStatus = async (vendorId, status) => {
    try {
      const res = await api.put(`/admin/vendors/${vendorId}/verification`, { status });
      if (res.success) fetchVendors();
    } catch (err) {
      alert(err.message || 'Failed to update vendor verification.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem' }}>Vendor Verification & Moderation</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
          Grant verified artisan status, review credentials, or suspend studios violating quality standards.
        </p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading studios...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '12px' }}>Studio Name</th>
                  <th style={{ padding: '12px' }}>Owner</th>
                  <th style={{ padding: '12px' }}>City</th>
                  <th style={{ padding: '12px' }}>Starting Price</th>
                  <th style={{ padding: '12px' }}>Rating</th>
                  <th style={{ padding: '12px' }}>Verification Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--color-text-title)' }}>
                      {v.business_name}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ display: 'block', fontWeight: 600 }}>{v.first_name} {v.last_name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{v.email}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{v.city}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>${parseFloat(v.starting_price).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} fill="#6240A0" color="#6240A0" /> {parseFloat(v.average_rating).toFixed(2)} ({v.review_count})
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${v.verification_status === 'verified' ? 'verified' : v.verification_status === 'suspended' ? 'rejected' : 'pending'}`}>
                        {v.verification_status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <select
                        value={v.verification_status}
                        onChange={(e) => handleUpdateStatus(v.id, e.target.value)}
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
