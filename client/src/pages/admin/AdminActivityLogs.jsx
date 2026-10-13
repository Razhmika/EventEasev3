import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, FileText } from 'lucide-react';
import api from '../../services/api';

export const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/activity-logs');
        if (res.success) setLogs(res.data || []);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.1rem' }}>Platform Audit & Activity Logs</h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
          Chronological record of administrative operations, moderation toggles, and critical platform events.
        </p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No logs recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '14px 18px',
                  background: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary-soft)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span className="badge badge-match" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-title)', fontWeight: 600 }}>
                      Executed by: {log.admin_name || 'System Admin'} ({log.admin_email || 'internal'})
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-body)', margin: 0 }}>
                    {log.details}
                  </p>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
