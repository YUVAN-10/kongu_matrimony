const MAX_AUTO_RETRIES = 2

/**
 * Wraps any onSnapshot-based subscribe function with automatic, immediate
 * (no setTimeout, no delay) reconnection when the listener errors.
 *
 * Why this exists: Firestore's onSnapshot() does NOT auto-retry once its
 * error callback fires — per Firebase's own design, that specific listener
 * is done, and reconnecting (calling onSnapshot again) is the caller's
 * responsibility. Nothing in this app's hooks used to do that, so any
 * error — including a purely transient one — became a permanent stuck
 * state until the component fully unmounted and remounted.
 *
 * That transient case is exactly what happens under React's <StrictMode>
 * in development: every effect runs, cleans up, and runs again on mount
 * (subscribe -> unsubscribe -> subscribe), which can tear down a listener
 * while its underlying network stream is still being negotiated. Compound
 * queries (where + orderBy, needing server-side composite-index
 * resolution) take measurably longer to negotiate than a plain whole-
 * collection listener, widening that window — which is why Users/Profiles
 * hit this and Dashboard's simpler listeners rarely do, and why the very
 * first Firestore listener of a session is the vulnerable one: once any
 * listener has connected, the underlying channel is warm and subsequent
 * double-subscribes are fast enough not to race.
 *
 * `subscribeFn` must have the shape (onData, onError) => unsubscribe,
 * matching every onSnapshot-based subscribe* function in this app's
 * services — callers adapt their specific service call into that shape
 * with a one-line arrow function. `onData` may be called with any number
 * of arguments (some subscribe functions pass extra data, e.g. a
 * pagination cursor); they're all forwarded through untouched.
 */
export function subscribeWithRetry(subscribeFn, onData, onError, maxRetries = MAX_AUTO_RETRIES) {
  let unsubscribe = () => {}
  let attempt = 0
  let cancelled = false

  function start() {
    unsubscribe = subscribeFn(
      (...args) => {
        if (cancelled) return
        attempt = 0 // a successful snapshot resets the retry budget
        onData(...args)
      },
      (err) => {
        if (cancelled) return
        if (attempt < maxRetries) {
          attempt += 1
          unsubscribe()
          start()
          return
        }
        onError(err)
      }
    )
  }

  start()

  return () => {
    cancelled = true
    unsubscribe()
  }
}
