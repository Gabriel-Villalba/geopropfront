import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { Footer, ProtectedRoute } from './components';
import { HomeRedirect } from './components/HomeRedirect';

const Login = lazy(async () => ({ default: (await import('./pages/Login')).Login }));
const ResetPassword = lazy(async () => ({ default: (await import('./pages/ResetPassword')).ResetPassword }));
const Dashboard = lazy(async () => ({ default: (await import('./pages/Dashboard')).Dashboard }));
const UserManagement = lazy(async () => ({ default: (await import('./pages/UserManagement')).UserManagement }));
const PanelDashboard = lazy(() => import('./pages/panel/PanelDashboard'));
const EditProfilePage = lazy(() => import('./pages/panel/profile/EditProfilePage'));
const PlansPage = lazy(() => import('./pages/panel/profile/PlansPage'));
const PublishLandingPage = lazy(() => import('./pages/panel/profile/PublishLandingPage'));
const MyPropertiesPage = lazy(() => import('./pages/panel/properties/MyPropertiesPage'));
const CreatePropertyRoute = lazy(() => import('./pages/panel/properties/create'));
const EditPropertyRoute = lazy(() => import('./pages/panel/properties/edit'));
const CreateAlertPage = lazy(() => import('./pages/panel/alerts/CreateAlertPage'));
const CustomCursor = lazy(() => import('./components/CustomCursor'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const InquiriesPage = lazy(() => import('./pages/panel/inquiries/InquiriesPage'));
const NotificationsPage = lazy(() => import('./pages/panel/notifications/NotificationsPage'));

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
        <p className="text-sm text-ink-muted">Cargando…</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <Suspense fallback={<AppLoader />}>
                <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<><CustomCursor /><Dashboard /></>} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />
                <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                <Route path="/panel" element={<ProtectedRoute><PanelDashboard /></ProtectedRoute>} />
                <Route path="/panel/profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
                <Route path="/panel/plans" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
                <Route path="/panel/properties" element={<ProtectedRoute><MyPropertiesPage /></ProtectedRoute>} />
                <Route path="/panel/inquiries" element={<ProtectedRoute><InquiriesPage /></ProtectedRoute>} />
                <Route path="/panel/properties/:id/inquiries" element={<ProtectedRoute><InquiriesPage /></ProtectedRoute>} />
                <Route path="/panel/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/panel/properties/publish" element={<ProtectedRoute><PublishLandingPage /></ProtectedRoute>} />
                <Route path="/panel/properties/create" element={<ProtectedRoute><CreatePropertyRoute /></ProtectedRoute>} />
                <Route path="/panel/properties/:id/edit" element={<ProtectedRoute><EditPropertyRoute /></ProtectedRoute>} />
                <Route path="/panel/alerts" element={<ProtectedRoute><CreateAlertPage /></ProtectedRoute>} />
                <Route path="/" element={<HomeRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>
            <Footer />
          </div>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
