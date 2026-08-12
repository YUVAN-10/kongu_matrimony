import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'
import FullScreenLoader from '@/components/common/FullScreenLoader'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
import Users from '@/pages/users/Users'
import AddUser from '@/pages/users/AddUser'
import EditUser from '@/pages/users/EditUser'
import Profiles from '@/pages/profiles/Profiles'
import AddProfile from '@/pages/profiles/AddProfile'
import EditProfile from '@/pages/profiles/EditProfile'
import ViewProfile from '@/pages/profiles/ViewProfile'
import DraftProfiles from '@/pages/profiles/DraftProfiles'
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
import ActivityLogs from '@/pages/activity-logs/ActivityLogs'
import ActivityLogDetails from '@/pages/activity-logs/ActivityLogDetails'

// Route definitions are intentionally minimal at this stage.
// Each future module will keep registering its route(s) here as it is built.
export default function AppRoutes() {
  const { loading } = useAuth()

  // Blocks the very first render until Firebase has resolved the persisted
  // session and (if any) the admin role — prevents a Login/Dashboard flash.
  if (loading) {
    return <FullScreenLoader label="Loading Kongu Admin…" />
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/users/:userId/edit" element={<EditUser />} />
          <Route path="/users/:userId" element={<Users />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/profiles/drafts" element={<DraftProfiles />} />
          <Route path="/profiles/new-approvals" element={<NewProfileApprovals />} />
          <Route path="/profiles/new-approvals/:profileId" element={<NewProfileReview />} />
          <Route path="/profiles/change-approvals" element={<ProfileChangeApprovals />} />
          <Route path="/profiles/change-approvals/:requestId" element={<ProfileChangeReview />} />
          <Route path="/profiles/add" element={<AddProfile />} />
          <Route path="/profiles/:profileId/edit" element={<EditProfile />} />
          <Route path="/profiles/:profileId" element={<ViewProfile />} />
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
          <Route path="/activity-logs" element={<ActivityLogs />} />
          <Route path="/activity-logs/:logId" element={<ActivityLogDetails />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}