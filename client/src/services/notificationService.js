import api from '@/lib/api'

export function subscribeToNewProfileSubmissions(onNewProfile, onError) {
  let isCancelled = false
  let knownIds = new Set()
  let isFirstRun = true

  async function poll() {
    try {
      const response = await api.get('/new-profile-approvals', { status: 'pending_approval' })
      const list = Array.isArray(response) ? response : (response?.profiles || response?.data || [])

      if (isFirstRun) {
        list.forEach((item) => knownIds.add(item.id || item._id))
        isFirstRun = false
        return
      }

      list.forEach((item) => {
        const id = item.id || item._id
        if (!knownIds.has(id)) {
          knownIds.add(id)
          if (!isCancelled) onNewProfile(item)
        }
      })
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  poll()
  const intervalId = setInterval(poll, 15000)

  return () => {
    isCancelled = true
    clearInterval(intervalId)
  }
}

export function subscribeToNewClientPayments(onNewPayment, onError) {
  let isCancelled = false
  let knownIds = new Set()
  let isFirstRun = true

  async function poll() {
    try {
      const response = await api.get('/payments', { source: 'client' })
      const list = Array.isArray(response) ? response : (response?.payments || response?.data || [])

      if (isFirstRun) {
        list.forEach((item) => knownIds.add(item.id || item._id))
        isFirstRun = false
        return
      }

      list.forEach((item) => {
        const id = item.id || item._id
        if (!knownIds.has(id)) {
          knownIds.add(id)
          if (!isCancelled) onNewPayment(item)
        }
      })
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  poll()
  const intervalId = setInterval(poll, 15000)

  return () => {
    isCancelled = true
    clearInterval(intervalId)
  }
}
