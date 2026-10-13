import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BookmarkCheck,
  MessageSquare,
  Sparkles,
  Briefcase,
  CalendarDays,
  Store,
  Users,
  ShieldCheck,
  FileText,
  LogOut,
  Compass,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getNavLinks = () => {
    if (user?.role === 'customer') {
      return [
        { label: 'Overview', path: '/customer/dashboard', icon: LayoutDashboard },
        { label: 'Discover Vendors', path: '/customer/vendors', icon: Compass },
        { label: 'My Bookings', path: '/customer/bookings', icon: BookmarkCheck },
        { label: 'Messages', path: '/customer/messages', icon: MessageSquare },
        { label: 'AI Event Planner', path: '/customer/ai-planner', icon: Sparkles },
        { label: 'Profile', path: '/customer/profile', icon: UserCircle }
      ];
    } else if (user?.role === 'vendor') {
      return [
        { label: 'Overview', path: '/vendor/dashboard', icon: LayoutDashboard },
        { label: 'Services', path: '/vendor/services', icon: Briefcase },
        { label: 'Availability', path: '/vendor/calendar', icon: CalendarDays },
        { label: 'Bookings', path: '/vendor/bookings', icon: BookmarkCheck },
        { label: 'Messages', path: '/vendor/messages', icon: MessageSquare },
        { label: 'Profile', path: '/vendor/profile', icon: Store }
      ];
    } else if (user?.role === 'admin') {
      return [
        { label: 'Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Vendors', path: '/admin/vendors', icon: ShieldCheck },
        { label: 'Bookings', path: '/admin/bookings', icon: BookmarkCheck },
        { label: 'Activity Logs', path: '/admin/activity', icon: FileText }
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-page)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <aside style={{
          width: '260px',
          background: 'var(--color-surface-card)',
          borderRight: '1px solid var(--color-border)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <div style={{
              padding: '12px 14px',
              background: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              border: '1px solid var(--color-primary-soft)'
            }}>
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 700,
                color: 'var(--color-primary-dark)',
                display: 'block'
              }}>
                Portal Role
              </span>
              <p style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--color-text-title)',
                textTransform: 'capitalize',
                margin: 0
              }}>
                {user?.role} Workspace
              </p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path.endsWith('/dashboard')}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.92rem',
                      color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-body)',
                      background: isActive ? 'var(--color-primary-light)' : 'transparent',
                      border: isActive ? '1px solid var(--color-primary-soft)' : '1px solid transparent',
                      transition: 'all var(--transition-fast)'
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-danger)',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: 'var(--color-danger-bg)',
                border: '1px solid rgba(192, 45, 56, 0.15)'
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
