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

  // Exponential-ish backoff (in ms) with a small base delay to allow
  // the underlying Firestore channel to warm up on initial app start.
  function backoffDelay(attemptNum) {
    const base = 120
    return base * Math.pow(2, Math.max(0, attemptNum - 1))
  }

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
          const delay = backoffDelay(attempt)
          setTimeout(() => start(), delay)
          return
        }
        // Extract a Firestore composite-index creation URL when present
        try {
          const msg = String(err?.message || err)
          const match = msg.match(/https?:\/\/console\.firebase\.google\.com\S*/i)
          if (match) {
            try {
              // attach a friendly property for callers
              err.indexUrl = match[0]
            } catch (e) {
              // ignore if err is non-writable
            }
          }
          console.error('[subscribeWithRetry] listener failed after retries:', err)
        } catch (e) {
          // ignore console errors in unusual environments
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
