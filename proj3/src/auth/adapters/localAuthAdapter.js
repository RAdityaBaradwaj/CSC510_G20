import { validateAdminCredentials } from "../../utils/adminAuth"

const LOCAL_USER_KEY = 'np-local-user'
const USER_REGISTRY_KEY = 'np-user-registry'

let currentUser = loadStoredUser()
const listeners = new Set()

function loadRegistry() {
  try {
    const raw = localStorage.getItem(USER_REGISTRY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveRegistry(registry) {
  localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(registry))
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistUser(user) {
  if (user) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(LOCAL_USER_KEY)
  }
}

function notify() {
  listeners.forEach(cb => cb(currentUser))
}

function onAuthStateChanged(cb) {
  listeners.add(cb)
  // Fire immediately with current state
  cb(currentUser)
  return () => listeners.delete(cb)
}

async function login(email, password) {
  const registry = loadRegistry()
  const existing = registry[email?.toLowerCase?.()] || null

  // Admin shortcut
  if (validateAdminCredentials(email, password)) {
    currentUser = {
      uid: `admin-${email}`,
      email,
      displayName: 'Admin',
      isAdmin: true
    }
    persistUser(currentUser)
    notify()
    return { user: currentUser }
  }

  // Simple local auth: ensure user exists and password matches
  if (!email || !password) {
    throw new Error('Invalid credentials')
  }
  if (!existing) {
    throw new Error('Account not found. Please sign up.')
  }
  if (existing.password !== password) {
    throw new Error('Invalid credentials')
  }
  currentUser = {
    uid: existing.uid,
    email: existing.email,
    displayName: existing.displayName,
    isAdmin: false
  }
  persistUser(currentUser)
  notify()
  return { user: currentUser }
}

async function signup(name, email, password) {
  if (!email || !password) {
    throw new Error('Missing fields')
  }
   const registry = loadRegistry()
   const key = email.toLowerCase()
   if (registry[key]) {
     throw new Error('An account with this email already exists')
   }
   const newUser = {
     uid: `user-${email}`,
     email,
     displayName: name || email.split('@')[0],
     password
   }
   registry[key] = newUser
   saveRegistry(registry)

  currentUser = {
    uid: newUser.uid,
    email: newUser.email,
    displayName: newUser.displayName,
    isAdmin: false
  }
  persistUser(currentUser)
  notify()
  return { user: currentUser }
}

async function loginWithGoogle() {
  // Mock a Google login locally
  const registry = loadRegistry()
  if (!registry['neighbor@example.com']) {
    registry['neighbor@example.com'] = {
      uid: 'google-mock-user',
      email: 'neighbor@example.com',
      displayName: 'Neighbor',
      password: 'google-oauth'
    }
    saveRegistry(registry)
  }
  currentUser = {
    uid: 'google-mock-user',
    email: 'neighbor@example.com',
    displayName: 'Neighbor',
    isAdmin: false
  }
  persistUser(currentUser)
  notify()
  return { user: currentUser }
}

async function logout() {
  currentUser = null
  persistUser(null)
  notify()
}

async function getToken() {
  return currentUser ? `local-token-${currentUser.uid}` : null
}

export default {
  onAuthStateChanged,
  login,
  signup,
  loginWithGoogle,
  logout,
  getToken,
}
