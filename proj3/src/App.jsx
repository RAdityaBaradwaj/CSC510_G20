import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import AIChat from './components/AIChat'
import Home from './pages/Home'
import BusinessesPage from './pages/BusinessesPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import AdminPage from './pages/AdminPage'
import RequireAuth from './auth/RequireAuth'
import RequireAdmin from './auth/RequireAdmin'
import GlobalAuthGate from './auth/GlobalAuthGate'
import { AuthUIProvider } from './auth/AuthUIContext'
import { useAuth } from './auth/AuthContext'
import { isAdmin } from './utils/adminAuth'
import './App.css'

function App() {
  const { user, logout } = useAuth()
  const adminOnly = user ? isAdmin(user) : false

  if (adminOnly) {
    return (
      <AuthUIProvider>
        <GlobalAuthGate />
        <div className="App">
          <Navbar />
          <AIChat />
          <Routes>
            <Route element={<RequireAuth />}>
              <Route element={<RequireAdmin />}>
                <Route
                  path="/admin"
                  element={
                    <div style={{ minHeight: '100vh', width: '100%' }}>
                      <AdminPage />
                    </div>
                  }
                />
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </AuthUIProvider>
    )
  }

  return (
    <AuthUIProvider>
      {/* Intercept any click when user is not authed */}
      <GlobalAuthGate />

      <div className="App">
        <Navbar />
        <AIChat />
        <Routes>
          <Route path="/" element={
            <main>
              <Home />
            </main>
          } />
          <Route path="/businesses" element={
            <main>
              <BusinessesPage />
            </main>
          } />

          {/* Protected routes */}
          <Route element={<RequireAuth />}>
            <Route path="/checkout" element={
              <main>
                <CheckoutPage />
              </main>
            } />
            <Route path="/orders" element={
              <main>
                <OrdersPage />
              </main>
            } />
          </Route>

          {/* Admin-only routes */}
          <Route element={<RequireAuth />}>
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={
                <div style={{ minHeight: '100vh', width: '100%' }}>
                  <AdminPage />
                </div>
              } />
            </Route>
          </Route>

          <Route path="*" element={
            <main>
              <Home />
            </main>
          } />
        </Routes>
      </div>
    </AuthUIProvider>
  )
}

export default App;
