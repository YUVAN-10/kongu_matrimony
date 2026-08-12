import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/firebase'

const PROFILES_COLLECTION = 'profiles'
const PAYMENTS_COLLECTION = 'payments'

/**
 * Wraps a Firestore onSnapshot listener so callers only hear about documents
 * that started matching the query AFTER the listener connected — the first
 * snapshot always reports every already-matching document as "added" (that's
 * how Firestore reports the initial result set), which would otherwise
 * notify about every pre-existing pending profile/payment the moment the
 * admin panel loads. Skipping that one baseline snapshot is what makes this
 * a feed of genuinely NEW arrivals instead of the whole current backlog.
 */
function subscribeToNewArrivals(firestoreQuery, onNewDoc, onError) {
  let isBaseline = true

  return onSnapshot(
    firestoreQuery,
    (snapshot) => {
      if (isBaseline) {
        isBaseline = false
        return
      }
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          onNewDoc({ id: change.doc.id, ...change.doc.data() })
        }
      }
    },
    onError
  )
}

/**
 * New client profile submissions — fires once per profile the moment it
 * enters (or re-enters, after a rejection + resubmit) pending_approval.
 * Powers the notification bell/toast; see newProfileApprovalService.js for
 * the actual review/approve/reject workflow this is just announcing.
 */
export function subscribeToNewProfileSubmissions(onNewProfile, onError) {
  const pendingQuery = query(collection(db, PROFILES_COLLECTION), where('system.status', '==', 'pending_approval'))
  return subscribeToNewArrivals(pendingQuery, onNewProfile, onError)
}

/**
 * New client-originated payments. Nothing in this repo creates a payment
 * with `source: 'client'` yet (Add Payment is an admin-entered record with
 * no such field) — this is the contract a future client-side payment
 * integration should follow: set `source: 'client'` on the payment document
 * it creates, and it'll surface here automatically. Admin-entered payments
 * are deliberately excluded so this stays "new payments FROM clients," not
 * every payment.
 */
export function subscribeToNewClientPayments(onNewPayment, onError) {
  const clientPaymentsQuery = query(collection(db, PAYMENTS_COLLECTION), where('source', '==', 'client'))
  return subscribeToNewArrivals(clientPaymentsQuery, onNewPayment, onError)
}
