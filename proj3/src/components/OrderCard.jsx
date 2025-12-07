import React from 'react'

const OrderCard = ({ order, userLocation, onStatusUpdate }) => {
  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`
  }

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`
    }
    return `${distance.toFixed(2)}km`
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleStatusChange = (e) => {
    const newStatus = e.target.value
    if (newStatus !== order.status) {
      onStatusUpdate(order.id, newStatus)
    }
  }

  return (
    <div className="order-card">
      <div className="order-header">
        <span className="order-id">Order #{order.id}</span>
        <span className={`order-status ${getStatusClass(order.status)}`}>
          {order.status}
        </span>
      </div>
      
      <div className="order-details">
        <p><strong>Customer:</strong> {order.customerName}</p>
        <p><strong>Items:</strong> {order.items.length} item(s)</p>
        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
        <p><strong>Created:</strong> {formatTime(order.createdAt)}</p>
        
        {order.distance && (
          <p className="distance">
            <strong>Distance:</strong> {formatDistance(order.distance)}
          </p>
        )}
        
        <p><strong>Delivery Address:</strong> {order.deliveryAddress || order.location?.address || order.deliveryLocation?.address || 'N/A'}</p>
        
        {order.notes && (
          <p><strong>Notes:</strong> {order.notes}</p>
        )}
      </div>

      <div className="order-actions">
        <label htmlFor={`status-${order.id}`}>Update Status:</label>
        <select
          id={`status-${order.id}`}
          value={order.status}
          onChange={handleStatusChange}
          className="status-select"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="ready">Ready for Pickup</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
    </div>
  )
}

export default OrderCard
