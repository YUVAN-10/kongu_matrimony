import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '@/layouts/AdminLayout'
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

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
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

      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/delete-account" element={<DeleteAccount />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profiles" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profiles/drafts" element={<Navigate to="/dashboard" replace />} />
      <Route path="/activity-logs" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}