import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/PublicLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuthStore } from './store/authStore.js';
import { useSettingsStore } from './store/settingsStore.js';

// Public pages
import Home from './pages/Home.jsx';
import Stations from './pages/Stations.jsx';
import Booking from './pages/Booking.jsx';
import Packages from './pages/Packages.jsx';
import Tournaments from './pages/Tournaments.jsx';
import Gallery from './pages/Gallery.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import MyBookings from './pages/MyBookings.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import AdminStations from './admin/AdminStations.jsx';
import AdminBookings from './admin/AdminBookings.jsx';
import AdminPackages from './admin/AdminPackages.jsx';
import AdminTournaments from './admin/AdminTournaments.jsx';
import AdminCustomers from './admin/AdminCustomers.jsx';
import AdminContent from './admin/AdminContent.jsx';
import AdminPayments from './admin/AdminPayments.jsx';
import AdminStaff from './admin/AdminStaff.jsx';
import AdminSettings from './admin/AdminSettings.jsx';

export default function App() {
  const initAuth = useAuthStore((s) => s.init);
  const fetchSettings = useSettingsStore((s) => s.fetch);

  useEffect(() => {
    initAuth();
    fetchSettings();
  }, [initAuth, fetchSettings]);

  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin panel — staff & admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="stations" element={<AdminStations />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="tournaments" element={<AdminTournaments />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="payments" element={<AdminPayments />} />
        {/* Admin-only sections */}
        <Route
          path="staff"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
