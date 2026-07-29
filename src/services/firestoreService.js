import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/firebase'

/**
 * Subscribes to a Firestore collection in real time and reports the full
 * document list (with `id`) on every change. Returns the unsubscribe function.
 */
export function subscribeToCollection(collectionName, onData, onError) {
  const collectionRef = collection(db, collectionName)

  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const documents = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      onData(documents)
    },
    onError
  )
}
