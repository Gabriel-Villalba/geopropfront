import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Footer, ProtectedRoute } from './components';
import { HomeRedirect } from './components/HomeRedirect';

const Login = lazy(async () => ({
  default: (await import('./pages/Login')).Login,
}));

const ResetPassword = lazy(async () => ({
  default: (await import('./pages/ResetPassword')).ResetPassword,
}));

const Dashboard = lazy(async () => ({
  default: (await import('./pages/Dashboard')).Dashboard,
}));

const UserManagement = lazy(async () => ({
  default: (await import('./pages/UserManagement')).UserManagement,
}));

const PanelDashboard = lazy(() => import('./pages/panel/PanelDashboard'));
const EditProfilePage = lazy(() => import('./pages/panel/profile/EditProfilePage'));
const MyPropertiesPage = lazy(() => import('./pages/panel/properties/MyPropertiesPage'));
const CreatePropertyRoute = lazy(() => import('./pages/panel/properties/create'));
const CreateAlertPage = lazy(() => import('./pages/panel/alerts/CreateAlertPage'));

const CustomCursor = lazy(() => import('./components/CustomCursor'));

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <Suspense fallback={<AppLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route
                  path="/dashboard"
                  element={
                    <>
                      <CustomCursor />
                      <Dashboard />
                    </>
                  }
                />

                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/panel"
                  element={
                    <ProtectedRoute>
                      <PanelDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/panel/profile"
                  element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/panel/properties"
                  element={
                    <ProtectedRoute>
                      <MyPropertiesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/panel/properties/create"
                  element={
                    <ProtectedRoute>
                      <CreatePropertyRoute />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/panel/alerts"
                  element={
                    <ProtectedRoute>
                      <CreateAlertPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/" element={<HomeRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
