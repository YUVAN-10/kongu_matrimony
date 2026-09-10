import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
import Users from '@/pages/users/Users'
import AddUser from '@/pages/users/AddUser'
import EditUser from '@/pages/users/EditUser'
import NewProfileApprovals from '@/pages/newProfileApprovals/NewProfileApprovals'
import NewProfileReview from '@/pages/newProfileApprovals/NewProfileReview'
import ProfileChangeApprovals from '@/pages/profileApprovals/ProfileChangeApprovals'
import ProfileChangeReview from '@/pages/profileApprovals/ProfileChangeReview'
import SubscriptionPlans from '@/pages/subscriptions/SubscriptionPlans'
import AddSubscriptionPlan from '@/pages/subscriptions/AddSubscriptionPlan'
import EditSubscriptionPlan from '@/pages/subscriptions/EditSubscriptionPlan'
import ViewSubscriptionPlan from '@/pages/subscriptions/ViewSubscriptionPlan'
import UserSubscriptions from '@/pages/userSubscriptions/UserSubscriptions'
import AssignSubscription from '@/pages/userSubscriptions/AssignSubscription'
import ViewSubscription from '@/pages/userSubscriptions/ViewSubscription'
import RenewSubscription from '@/pages/userSubscriptions/RenewSubscription'
import Payments from '@/pages/payments/Payments'
import AddPayment from '@/pages/payments/AddPayment'
import PaymentDetails from '@/pages/payments/PaymentDetails'
import RefundPayment from '@/pages/payments/RefundPayment'
import PrivacyPolicy from '@/pages/privacy/PrivacyPolicy'
import DeleteAccount from '@/pages/privacy/DeleteAccount'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <ShieldCheck className="size-8" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Authenticating admin session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <ShieldCheck className="size-8" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <Login />
            </PublicAuthRoute>
          }
        />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/add" element={<AddUser />} />
        <Route path="/users/:userId/edit" element={<EditUser />} />
        <Route path="/users/:userId" element={<Users />} />
        <Route path="/profiles/new-approvals" element={<NewProfileApprovals />} />
        <Route path="/profiles/new-approvals/:profileId" element={<NewProfileReview />} />
        <Route path="/profiles/change-approvals" element={<ProfileChangeApprovals />} />
        <Route path="/profiles/change-approvals/:requestId" element={<ProfileChangeReview />} />
        <Route path="/subscription-plans" element={<SubscriptionPlans />} />
        <Route path="/subscription-plans/add" element={<AddSubscriptionPlan />} />
        <Route path="/subscription-plans/:planId/edit" element={<EditSubscriptionPlan />} />
        <Route path="/subscription-plans/:planId" element={<ViewSubscriptionPlan />} />
        <Route path="/user-subscriptions" element={<UserSubscriptions />} />
        <Route path="/user-subscriptions/assign" element={<AssignSubscription />} />
        <Route path="/user-subscriptions/:subscriptionId/renew" element={<RenewSubscription />} />
        <Route path="/user-subscriptions/:subscriptionId" element={<ViewSubscription />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payments/add" element={<AddPayment />} />
        <Route path="/payments/:paymentId/refund" element={<RefundPayment />} />
        <Route path="/payments/:paymentId" element={<PaymentDetails />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
      </Route>

      {/* Standalone Public Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/delete-account" element={<DeleteAccount />} />
      
      {/* Redirections */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profiles" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profiles/drafts" element={<Navigate to="/dashboard" replace />} />
      <Route path="/activity-logs" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}