import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import OrderCard from './OrderCard'
import LocationControls from './LocationControls'
import { useNearbyOrders } from '../hooks/useNearbyOrders'
import { orderService } from '../services/orders/orderService'
import { locationService } from '../services/locationService'
import { trackStart, trackSuccess, trackFailure } from '../utils/analytics'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const NearbyOrdersBoard = () => {
  const [zipCode, setZipCode] = useState('10001')
  const [userLocation, setUserLocation] = useState(null)
  const [radius, setRadius] = useState(5) // km
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const {
    nearbyOrders,
    loading: ordersLoading,
    error: ordersError,
    refetch
  } = useNearbyOrders(userLocation, radius, statusFilter)

  const handleZipCodeChange = async (newZipCode) => {
    setZipCode(newZipCode)
    if (newZipCode.length === 5) {
      try {
        trackStart('location-fetch')
        setIsLoading(true)
        setError(null)
        const location = await locationService.getCoordinatesFromZip(newZipCode)
        setUserLocation(location)
        trackSuccess('location-fetch', { zipCode: newZipCode })
      } catch (err) {
        setError('Invalid zip code or zip code not found.')
        console.error('Location error:', err)
        setUserLocation(null)
        trackFailure('location-fetch', { zipCode: newZipCode, error: err.message })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Get initial location on mount
  useEffect(() => {
    handleZipCodeChange(zipCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius)
  }

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus)
  }

  const handleOrderUpdate = async (orderId, newStatus) => {
    try {
      trackStart('order-status-update')
      await orderService.updateOrderStatus(orderId, newStatus)
      trackSuccess('order-status-update', { orderId, newStatus })
      refetch() // Refresh the orders list
    } catch (err) {
      setError('Failed to update order status')
      console.error('Order update error:', err)
      trackFailure('order-status-update', { orderId, error: err.message })
    }
  }

  if (ordersError) {
    return (
      <div className="error">
        Error loading nearby orders: {ordersError}
      </div>
    )
  }

  return (
    <div className="nearby-orders-container">
      <div className="orders-list">
        <h2>Nearby Orders</h2>
        
        <LocationControls
          zipCode={zipCode}
          radius={radius}
          statusFilter={statusFilter}
          isLoading={isLoading}
          error={error}
          onZipCodeChange={handleZipCodeChange}
          onRadiusChange={handleRadiusChange}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {ordersLoading ? (
          <div className="loading">Loading nearby orders...</div>
        ) : nearbyOrders.length === 0 ? (
          <div className="no-orders">
            {userLocation 
              ? `No orders found within ${radius}km radius`
              : 'Please enter a valid zip code to see nearby orders'
            }
          </div>
        ) : (
          nearbyOrders.map(order => {
            // Ensure order has valid location data
            if (!order.location && !order.deliveryLocation) {
              return null // Skip invalid orders
            }
            
            return (
              <OrderCard
                key={order.id}
                order={order}
                userLocation={userLocation}
                onStatusUpdate={handleOrderUpdate}
              />
            )
          })
        )}
      </div>

      {userLocation && (
        <div className="map-container">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User location marker */}
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>
                <strong>Your Location</strong>
              </Popup>
            </Marker>

            {/* Order markers */}
            {nearbyOrders.map(order => {
              // Handle both location and deliveryLocation property names
              const orderLocation = order.deliveryLocation || order.location
              
              if (!orderLocation || !orderLocation.lat || !orderLocation.lng) {
                return null // Skip orders without valid location
              }
              
              return (
                <Marker 
                  key={order.id} 
                  position={[orderLocation.lat, orderLocation.lng]}
                >
                  <Popup>
                    <div>
                      <strong>Order #{order.id}</strong>
                      <br />
                      Status: {order.status}
                      <br />
                      Distance: {order.distance?.toFixed(2)} km
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      )}
    </div>
  )
}

export default NearbyOrdersBoard
