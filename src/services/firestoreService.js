import api from '@/lib/api'

function toEndpoint(collectionName) {
  const kebab = collectionName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  return `/${kebab}`
}

export function subscribeToCollection(collectionName, onData, onError) {
  let isCancelled = false
  const endpoint = toEndpoint(collectionName)

  async function fetchData() {
    try {
      const response = await api.get(endpoint, { limit: 1000 })
      const list = Array.isArray(response)
        ? response
        : (response?.data || response?.items || response?.[collectionName] || [])
      if (!isCancelled) onData(list)
    } catch (err) {
      if (!isCancelled && onError) onError(err)
    }
  }

  fetchData()

  return () => {
    isCancelled = true
  }
}
