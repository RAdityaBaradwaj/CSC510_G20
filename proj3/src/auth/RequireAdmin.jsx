import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { isAdmin } from '../utils/adminAuth'

export default function RequireAdmin() {
  const { user, isAuthed } = useAuth()

  // Debug logging
  console.log('RequireAdmin: Checking access', { 
    isAuthed, 
    user: user?.email, 
    isAdmin: user ? isAdmin(user) : false 
  })

  if (!isAuthed) {
    console.log('RequireAdmin: Not authenticated, redirecting')
    // Redirect to home if not authenticated
    return <Navigate to="/" replace />
  }

  if (!isAdmin(user)) {
    console.log('RequireAdmin: Not admin, redirecting. User email:', user?.email)
    // Redirect to home if not admin
    return <Navigate to="/" replace />
  }

  console.log('RequireAdmin: Access granted, rendering Outlet')
  return <Outlet />
}

