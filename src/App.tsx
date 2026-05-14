import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { ListingsPage } from './features/listings';
import { LoginPage } from './features/auth';
import Navbar from './shared/components/Navbar';
import Footer from './shared/components/Footer';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminRoute from './shared/components/AdminRoute';
import HostRoute from './shared/components/HostRoute';
import NotFound from './shared/components/NotFound';
import Spinner from './shared/components/Spinner';
import ScrollToTop from './shared/components/ScrollToTop';
import { apiClient } from './api';

const HomePage        = lazy(() => import('./features/listings/pages/HomePage'));
const ListingDetail   = lazy(() => import('./features/listings/pages/ListingDetail'));
const ExplorePage     = lazy(() => import('./features/listings/pages/ExplorePage'));
const AddListingPage  = lazy(() => import('./features/listings/pages/AddListingPage'));
const EditListingPage = lazy(() => import('./features/listings/pages/EditListingPage'));
const AboutPage       = lazy(() => import('./features/listings/pages/AboutPage'));
const SignUpPage           = lazy(() => import('./features/auth/pages/SignUpPage'));
const ForgotPasswordPage  = lazy(() => import('./features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./features/auth/pages/ResetPasswordPage'));
const DashboardLayout = lazy(() => import('./features/auth/pages/DashboardLayout'));
const DashboardPage   = lazy(() => import('./features/auth/pages/DashboardPage'));
const BookingsPage    = lazy(() => import('./features/auth/pages/BookingsPage'));
const SavedPage       = lazy(() => import('./features/auth/pages/SavedPage'));
const ReviewsPage     = lazy(() => import('./features/auth/pages/ReviewsPage'));
const ProfilePage     = lazy(() => import('./features/auth/pages/ProfilePage'));
const MyListingsPage  = lazy(() => import('./features/auth/pages/MyListingsPage'));
const MessagesPage    = lazy(() => import('./features/auth/pages/MessagesPage'));
const SettingsPage    = lazy(() => import('./features/auth/pages/SettingsPage'));
const SupportPage         = lazy(() => import('./features/auth/pages/SupportPage'));
const TripsPage           = lazy(() => import('./features/auth/pages/TripsPage'));
const NotificationsPage   = lazy(() => import('./features/auth/pages/NotificationsPage'));
const CheckoutPage        = lazy(() => import('./features/listings/pages/CheckoutPage'));
const AdminLayout         = lazy(() => import('./features/admin/pages/AdminLayout'));
const AdminDashboardPage  = lazy(() => import('./features/admin/pages/AdminDashboardPage'));
const AdminUsersPage      = lazy(() => import('./features/admin/pages/AdminUsersPage'));
const AdminListingsPage   = lazy(() => import('./features/admin/pages/AdminListingsPage'));
const AdminBookingsPage   = lazy(() => import('./features/admin/pages/AdminBookingsPage'));

NProgress.configure({ showSpinner: false });

function App() {
  const location = useLocation();

  // Warm up the Neon DB on app load so subsequent requests don't hit cold-start delays
  useEffect(() => {
    apiClient.get('/health').catch(() => {});
  }, []);

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 100);
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location]);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route
            path="/add-listing"
            element={
              <HostRoute>
                <AddListingPage />
              </HostRoute>
            }
          />
          <Route
            path="/edit-listing/:id"
            element={
              <HostRoute>
                <EditListingPage />
              </HostRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="saved" element={<SavedPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="my-listings" element={<MyListingsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support"        element={<SupportPage />} />
            <Route path="trips"          element={<TripsPage />} />
            <Route path="notifications"  element={<NotificationsPage />} />
          </Route>

          {/* ── Admin ── */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users"    element={<AdminUsersPage />} />
            <Route path="listings" element={<AdminListingsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
