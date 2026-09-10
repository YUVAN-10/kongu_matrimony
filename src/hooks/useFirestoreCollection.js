import { useEffect, useState } from 'react'
import { subscribeToCollection } from '@/services/firestoreService'
import { subscribeWithRetry } from '@/utils/subscribeWithRetry'

/** Subscribes to a Firestore collection in real time for the life of the component. */
export function useFirestoreCollection(collectionName) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsubscribe = subscribeWithRetry(
      (onData, onError) => subscribeToCollection(collectionName, onData, onError),
      (documents) => {
        setData(documents)
        setLoading(false)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [collectionName])

  return { data, loading, error }
}
