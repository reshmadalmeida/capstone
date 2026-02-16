import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import RoleRoute from './RoleRoute';
import AppShell from '../layout/AppShell';
import LoginPage from '../features/auth/LoginPage';
import Dashboard from '../features/auth/Dashboard';
import CreatePolicyWizard from '../features/policy/CreatePolicyWizard/CreatePolicyWizard';
import PoliciesList from '../features/policy/PolicyList';
import PolicyDetails from '../features/policy/PolicyDetails';
import { useAuth } from '../hooks/useAuth';

export function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root route - redirect to dashboard if authenticated, login otherwise */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard - Accessible to all logged-in users */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Policy Management - Underwriter & Admin */}
        <Route
          path="/policies"
          element={
            <RoleRoute allowed={['admin', 'underwriter']}>
              <PoliciesList />
            </RoleRoute>
          }
        />
        <Route
          path="/policies/new"
          element={
            <RoleRoute allowed={['underwriter', 'admin']}>
              <CreatePolicyWizard />
            </RoleRoute>
          }
        />
        <Route
          path="/policies/:id"
          element={
            <RoleRoute allowed={['admin', 'underwriter']}>
              <PolicyDetails />
            </RoleRoute>
          }
        />

        {/* Claims Management - Claims Adjuster & Admin */}
        <Route
          path="/claims"
          element={
            <RoleRoute allowed={['admin', 'claims_adjuster']}>
              <div>Claims Module - Coming Soon</div>
            </RoleRoute>
          }
        />

        {/* Reinsurance Management - Reinsurance Manager & Admin */}
        <Route
          path="/reinsurance"
          element={
            <RoleRoute allowed={['admin', 'reinsurance_manager']}>
              <div>Reinsurance Module - Coming Soon</div>
            </RoleRoute>
          }
        />
        <Route
          path="/reinsurance/treaties"
          element={
            <RoleRoute allowed={['admin', 'reinsurance_manager']}>
              <div>Treaties Management - Coming Soon</div>
            </RoleRoute>
          }
        />

        {/* Admin Management - Admin Role Only */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowed={['admin']}>
              <div>Admin Dashboard - Coming Soon</div>
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowed={['admin']}>
              <div>User Management - Coming Soon</div>
            </RoleRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <RoleRoute allowed={['admin']}>
              <div>Role Management - Coming Soon</div>
            </RoleRoute>
          }
        />
      </Route>

      {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
