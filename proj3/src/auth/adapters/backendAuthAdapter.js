const STORAGE_KEY = 'np-auth-backend'
const listeners = new Set()

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveAuth(data) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

let currentAuth = loadAuth()

function notify() {
  listeners.forEach(cb => cb(currentAuth?.user || null))
}

async function api(path, options = {}) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const res = await fetch(`${base}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(currentAuth?.token ? { 'Authorization': currentAuth.token, 'x-user-token': currentAuth.token, 'x-user-id': currentAuth.user?.id } : {})
    },
    ...options
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.error || 'Request failed')
  }
  return json
}

const backendAuthAdapter = {
  onAuthStateChanged(cb) {
    listeners.add(cb)
    cb(currentAuth?.user || null)
    return () => listeners.delete(cb)
  },

  async signup(name, email, password) {
    const data = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    })
    currentAuth = data
    saveAuth(currentAuth)
    notify()
    return data
  },

  async login(email, password) {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    currentAuth = data
    saveAuth(currentAuth)
    notify()
    return data
  },

  async loginWithGoogle() {
    // Fallback to demo login using email/password equivalent
    return this.login('neighbor@example.com', 'google-oauth')
  },

  async logout() {
    currentAuth = null
    saveAuth(null)
    notify()
  },

  async getToken() {
    return currentAuth?.token || null
  }
}

export default backendAuthAdapter
