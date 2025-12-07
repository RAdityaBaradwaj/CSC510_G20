// Admin authentication utility
// Placeholder admin credentials for demo purposes

// In production, this would check against a database or admin role in Firebase
const ADMIN_EMAILS = [
  'admin@neighborhoodpool.com',
  'admin@example.com'
]

const ADMIN_PASSWORDS = {
  'admin@neighborhoodpool.com': 'admin123',
  'admin@example.com': 'admin123'
}

/**
 * Check if a user is an admin
 * @param {Object} user - User object from auth context
 * @returns {boolean} - True if user is admin
 */
export function isAdmin(user) {
  if (!user || !user.email) {
    return false
  }
  
  // Check if email is in admin list
  return ADMIN_EMAILS.includes(user.email.toLowerCase())
}

/**
 * Validate admin credentials (for login)
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {boolean} - True if credentials are valid admin credentials
 */
export function validateAdminCredentials(email, password) {
  const normalizedEmail = email.toLowerCase()
  return ADMIN_EMAILS.includes(normalizedEmail) && 
         ADMIN_PASSWORDS[normalizedEmail] === password
}

/**
 * Get admin placeholder credentials for display
 */
export function getAdminPlaceholderInfo() {
  return {
    email: 'admin@neighborhoodpool.com',
    password: 'admin123',
    note: 'Use these credentials to access admin pages'
  }
}

export default {
  isAdmin,
  validateAdminCredentials,
  getAdminPlaceholderInfo
}

