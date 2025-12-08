import { validateAdminCredentials } from "../../utils/adminAuth"

const LOCAL_USER_KEY = 'np-local-user'

let currentUser = loadStoredUser()
const listeners = new Set()

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

  // Simple local auth: accept any non-empty credentials
  if (!email || !password) {
    throw new Error('Invalid credentials')
  }
  currentUser = {
    uid: `user-${email}`,
    email,
    displayName: email.split('@')[0],
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
  currentUser = {
    uid: `user-${email}`,
    email,
    displayName: name || email.split('@')[0],
    isAdmin: false
  }
  persistUser(currentUser)
  notify()
  return { user: currentUser }
}

async function loginWithGoogle() {
  // Mock a Google login locally
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
