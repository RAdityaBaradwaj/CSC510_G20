const BATCHES_KEY = 'neighborhoodpool-batches'

export function loadBatches() {
  try {
    const raw = localStorage.getItem(BATCHES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveBatches(batches) {
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches))
}
