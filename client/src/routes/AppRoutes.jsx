import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';
import RoleRoute from './RoleRoute';
import AppShell from '../layout/AppShell';
import LoginPage from '../features/auth/LoginPage';
//  import AnalyticsDashboard from '../features/dashboard/AnalyticsDashboard';
import Dashboard from '../features/dashboard/Dashboard';
import CreatePolicyWizard from '../features/policy/CreatePolicyWizard/CreatePolicyWizard';
import PoliciesList from '../features/policy/PolicyList';
import PolicyDetails from '../features/policy/PolicyDetails';
import { useAuth } from '../hooks/useAuth';
import UserList from '../features/admin/UserList';
import ReinsurerList from '../features/reinsurer/ReinsurerList';
import TreatyList from '../features/treaty/TreatyList';
import RiskAllocationView from '../features/treaty/RiskAllocationView';
import ClaimsList from '../features/claims/ClaimsList';

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

        {/* Dashboard - Analytics for all roles */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "UNDERWRITER",
                "CLAIMS_ADJUSTER",
                "REINSURANCE_ANALYST",
              ]}
            >
              <Dashboard />
              {/* <AnalyticsDashboard /> */}
            </ProtectedRoute>
          }
        />

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
             <ClaimsList/>
            </RoleRoute>
          }
        />

        {/* Reinsurance Management - Reinsurance Manager & Admin */}
        <Route
          path="/reinsurance"
          element={
            <RoleRoute allowed={['admin', 'reinsurance_analyst']}>
                <ReinsurerList/>
            </RoleRoute>
          }
        />
        {/* FR-7: Treaty Management with Auto-Allocation Rules */}
        <Route
          path="/reinsurance/treaties"
          element={
            <RoleRoute allowed={['admin', 'reinsurance_analyst']}>
              <TreatyList />
            </RoleRoute>
          }
        />
        {/* FR-7, FR-8, FR-9: Risk Allocation View - Auto Allocate, Validate Limits, Calculate Exposure */}
        <Route
          path="/reinsurance/allocations"
          element={
            <RoleRoute allowed={['admin', 'reinsurance_analyst', 'underwriter']}>
              <RiskAllocationView />
            </RoleRoute>
          }
        />

        
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowed={['admin']}>
            <UserList/>
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
