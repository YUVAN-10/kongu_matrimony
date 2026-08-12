import { createContext, useContext, useEffect, useState } from 'react'
import { subscribeToNewProfileSubmissions, subscribeToNewClientPayments } from '@/services/notificationService'
import { subscribeWithRetry } from '@/utils/subscribeWithRetry'
import { formatCurrency } from '@/utils/helpers'

const NotificationContext = createContext(undefined)

const MAX_NOTIFICATIONS = 50
const TOAST_DURATION_MS = 6000

/**
 * Single source of truth for "new arrivals from the client side" — mounted
 * once in AdminLayout so the bell dropdown (persistent list) and the toast
 * stack (transient popups) both read from the same live subscriptions
 * instead of each opening its own duplicate Firestore listeners.
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [toasts, setToasts] = useState([])

  function pushNotification(entry) {
    setNotifications((prev) => [{ ...entry, read: false }, ...prev].slice(0, MAX_NOTIFICATIONS))
    setToasts((prev) => [...prev, entry])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== entry.id))
    }, TOAST_DURATION_MS)
  }

  useEffect(() => {
    const unsubscribeProfiles = subscribeWithRetry(
      subscribeToNewProfileSubmissions,
      (profile) => {
        pushNotification({
          id: `profile-${profile.id}-${Date.now()}`,
          type: 'new_profile',
          title: 'New Profile Submitted',
          description: `${profile.personal?.fullName || 'A client'} submitted a new profile for approval.`,
          link: `/profiles/new-approvals/${profile.id}`,
          createdAt: new Date(),
        })
      },
      () => {}
    )

    const unsubscribePayments = subscribeWithRetry(
      subscribeToNewClientPayments,
      (payment) => {
        pushNotification({
          id: `payment-${payment.id}-${Date.now()}`,
          type: 'new_payment',
          title: 'New Payment Received',
          description: `A payment of ${formatCurrency(payment.amount)} was received from a client.`,
          link: `/payments/${payment.id}`,
          createdAt: new Date(),
        })
      },
      () => {}
    )

    return () => {
      unsubscribeProfiles()
      unsubscribePayments()
    }
  }, [])

  function markAllRead() {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
    )
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const value = { notifications, unreadCount, toasts, markAllRead, markRead, dismissToast }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
