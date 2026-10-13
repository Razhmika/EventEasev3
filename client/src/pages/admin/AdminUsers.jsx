import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, UserX, UserCheck, Filter } from 'lucide-react';
import api from '../../services/api';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'suspend'} ${user.email}?`)) return;

    try {
      const res = await api.put(`/admin/users/${user.id}/status`, { isActive: newStatus });
      if (res.success) fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem' }}>User Account Management</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
          Inspect registered customers, vendors, and administrators. Suspend or restore platform access.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            style={{ paddingLeft: '38px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--color-text-muted)" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Roles</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <button onClick={fetchUsers} className="btn btn-secondary btn-sm">
          Search
        </button>
      </div>

      {/* User Table */}
      <div className="card" style={{ padding: '24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading directory...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Phone</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Joined Date</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-text-title)' }}>
                      {u.first_name} {u.last_name}
                    </td>
                    <td style={{ padding: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-match" style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-text-muted)' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${u.is_active ? 'verified' : 'rejected'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="btn btn-outline btn-sm"
                          style={{
                            color: u.is_active ? 'var(--color-danger)' : 'var(--color-success)',
                            borderColor: u.is_active ? 'rgba(192, 45, 56, 0.2)' : 'rgba(40, 128, 89, 0.2)'
                          }}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      )}
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
