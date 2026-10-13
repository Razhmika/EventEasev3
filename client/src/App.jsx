import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Guards
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { VendorDirectory } from './pages/public/VendorDirectory';
import { VendorProfilePage } from './pages/public/VendorProfilePage';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { MyEvents } from './pages/customer/MyEvents';
import { CreateEvent } from './pages/customer/CreateEvent';
import { Recommendations } from './pages/customer/Recommendations';
import { CustomerBookings } from './pages/customer/CustomerBookings';
import { AIPlannerPage } from './pages/customer/AIPlannerPage';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Vendor Pages
import { VendorDashboard } from './pages/vendor/VendorDashboard';
import { ServiceCatalog } from './pages/vendor/ServiceCatalog';
import { CalendarManager } from './pages/vendor/CalendarManager';
import { VendorBookings } from './pages/vendor/VendorBookings';
import { VendorProfileSettings } from './pages/vendor/VendorProfileSettings';

// Common Messaging
import { ChatPage } from './pages/common/ChatPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminVendors } from './pages/admin/AdminVendors';
import { AdminActivityLogs } from './pages/admin/AdminActivityLogs';

export const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/vendors" element={<VendorDirectory />} />
      <Route path="/vendors/:id" element={<VendorProfilePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Protected Portal */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="vendors" element={<VendorDirectory />} />
        <Route path="vendors/:id" element={<VendorProfilePage />} />
        <Route path="events" element={<MyEvents />} />
        <Route path="events/new" element={<CreateEvent />} />
        <Route path="events/:id/recommendations" element={<Recommendations />} />
        <Route path="bookings" element={<CustomerBookings />} />
        <Route path="messages" element={<ChatPage />} />
        <Route path="ai-planner" element={<AIPlannerPage />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Vendor Protected Portal */}
      <Route
        path="/vendor"
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="services" element={<ServiceCatalog />} />
        <Route path="calendar" element={<CalendarManager />} />
        <Route path="bookings" element={<VendorBookings />} />
        <Route path="messages" element={<ChatPage />} />
        <Route path="profile" element={<VendorProfileSettings />} />
      </Route>

      {/* Admin Protected Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="bookings" element={<AdminDashboard />} />
        <Route path="activity" element={<AdminActivityLogs />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
