import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './auth/AuthContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import './components/Toast.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
