import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { orderService } from '../services/orders/orderService'
import { Order } from '../models/Order'
import OrderCard from '../components/OrderCard'
import './OrdersPage.css'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [user, statusFilter])

  const loadOrders = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const filters = { customerId: user.uid }
      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }
      
      const userOrders = await orderService.getAllOrders(filters)
      setOrders(userOrders)
    } catch (err) {
      setError(err.message)
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      processing: '#4169E1',
      ready: '#32CD32',
      'picked-up': '#9370DB',
      delivered: '#228B22',
      cancelled: '#DC143C'
    }
    return colors[status] || '#666'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      ready: 'Ready for Pickup',
      'picked-up': 'On the Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-container">
          <p>Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={loadOrders}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <div className="status-filter">
          <label>Filter by status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="picked-up">On the Way</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You don't have any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <div className="order-id">Order #{order.id}</div>
                <div 
                  className="order-status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </div>
              </div>
              
              <div className="order-details">
                <div className="order-info">
                  <p><strong>Business:</strong> {order.businessName}</p>
                  <p><strong>Delivery Address:</strong> {order.location?.address || `${order.location?.zipCode || 'N/A'}`}</p>
                  <p><strong>Total:</strong> ${order.total?.toFixed(2) || '0.00'}</p>
                  <p><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="order-items">
                  <strong>Items:</strong>
                  <ul>
                    {order.items?.map((item, idx) => (
                      <li key={idx}>
                        {item.productName} x{item.quantity} - ${item.subtotal?.toFixed(2) || item.price?.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                {order.driverId && (
                  <div className="driver-info">
                    <p><strong>Driver Assigned:</strong> {order.driverId}</p>
                    {order.status === 'picked-up' && (
                      <p className="tracking-info">🚚 Your order is on the way!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

