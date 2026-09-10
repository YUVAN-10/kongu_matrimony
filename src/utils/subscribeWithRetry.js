const MAX_AUTO_RETRIES = 2

/**
 * Wraps any subscribe/fetch function with automatic reconnection when the listener errors.
 */
export function subscribeWithRetry(subscribeFn, onData, onError, maxRetries = MAX_AUTO_RETRIES) {
  let unsubscribe = () => {}
  let attempt = 0
  let cancelled = false

  function backoffDelay(attemptNum) {
    const base = 120
    return base * Math.pow(2, Math.max(0, attemptNum - 1))
  }

  function start() {
    unsubscribe = subscribeFn(
      (...args) => {
        if (cancelled) return
        attempt = 0
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
