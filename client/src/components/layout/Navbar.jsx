import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Bell, User, LogOut, ChevronDown, Check, Calendar, MessageSquare, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'customer') return '/customer/dashboard';
    if (user.role === 'vendor') return '/vendor/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--color-surface-overlay)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      transition: 'all var(--transition-normal)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'var(--grad-button-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(98, 64, 160, 0.25)'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-title)', letterSpacing: '-0.5px' }}>
              Event<span style={{ color: 'var(--color-primary-dark)' }}>Ease</span>
            </span>
          </div>
        </Link>

        {/* Center Public Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link
            to="/vendors"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: location.pathname === '/vendors' ? 'var(--color-primary-dark)' : 'var(--color-text-body)'
            }}
          >
            Discover Vendors
          </Link>
          {user && (
            <Link
              to={getDashboardPath()}
              style={{
                fontWeight: 600,
                fontSize: '0.95rem',
                color: location.pathname.includes('/dashboard') ? 'var(--color-primary-dark)' : 'var(--color-text-body)'
              }}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Action Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              {/* Notification Bell Dropdown */}
              <div style={{ position: 'relative' }} ref={notifMenuRef}>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  style={{
                    position: 'relative',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: showNotifMenu ? 'var(--color-primary-soft)' : 'var(--color-surface-card)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-title)'
                  }}
                  title="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: 'var(--color-primary-dark)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #FFFFFF'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '52px',
                    width: '340px',
                    background: 'var(--color-surface-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-modal)',
                    padding: '16px',
                    zIndex: 200
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{ fontSize: '0.75rem', color: 'var(--color-primary-dark)', fontWeight: 600 }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link_url) navigate(n.link_url);
                              setShowNotifMenu(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              background: n.is_read ? 'transparent' : 'var(--color-primary-light)',
                              border: '1px solid',
                              borderColor: n.is_read ? 'transparent' : 'var(--color-primary-soft)',
                              cursor: 'pointer',
                              transition: 'background var(--transition-fast)'
                            }}
                          >
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-title)', marginBottom: '2px' }}>
                              {n.title}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-body)', lineHeight: 1.3 }}>
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu Dropdown */}
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 14px 6px 8px',
                    background: 'var(--color-surface-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary-dark)',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {user.firstName ? user.firstName.charAt(0) : 'U'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-title)', display: 'block' }}>
                      {user.firstName}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown size={14} color="var(--color-text-muted)" />
                </button>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '52px',
                    width: '200px',
                    background: 'var(--color-surface-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-modal)',
                    padding: '8px',
                    zIndex: 200
                  }}>
                    <button
                      onClick={() => {
                        navigate(getDashboardPath());
                        setShowUserMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        color: 'var(--color-text-title)'
                      }}
                    >
                      <User size={16} /> Dashboard
                    </button>
                    <div style={{ height: '1px', background: 'var(--color-border)', margin: '6px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        color: 'var(--color-danger)'
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
