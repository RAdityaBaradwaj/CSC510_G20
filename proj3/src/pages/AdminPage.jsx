import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { batchService } from '../services/batches/batchService'
import { driverService } from '../services/drivers/driverService'
import { orderService } from '../services/orders/orderService'
import './AdminPage.css'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
})

export default function AdminPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [batches, setBatches] = useState([])
  const [drivers, setDrivers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false)

  useEffect(() => {
    console.log('AdminPage: Component mounted, user:', user)
    console.log('AdminPage: Loading data...')
    loadData()
  }, [])

  // Auto-assign orders every 5 minutes
  useEffect(() => {
    if (!autoAssignEnabled) return

    const interval = setInterval(async () => {
      try {
        console.log('AdminPage: Auto-assigning orders...')
        const newBatches = await batchService.assignOrdersToDrivers({
          maxOrdersPerBatch: 10,
          maxDistanceKm: 20
        })
        
        if (newBatches.length > 0) {
          await loadData() // Refresh data
          showToast(`Auto-assigned ${newBatches.length} batch(es) to drivers`, 'success')
        }
      } catch (err) {
        console.error('AdminPage: Error in auto-assign:', err)
        showToast(`Auto-assign error: ${err.message}`, 'error')
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [autoAssignEnabled, showToast])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('AdminPage: Fetching batches, drivers, and orders...')
      const [batchesData, driversData, ordersData] = await Promise.all([
        batchService.getAllBatches(),
        driverService.getAllDrivers(),
        orderService.getAllOrders()
      ])
      
      console.log('AdminPage: Data loaded:', { 
        batches: batchesData.length, 
        drivers: driversData.length, 
        orders: ordersData.length 
      })
      
      setBatches(batchesData)
      setDrivers(driversData)
      setOrders(ordersData)
    } catch (err) {
      console.error('AdminPage: Error loading data:', err)
      setError(err.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
      console.log('AdminPage: Loading complete')
    }
  }

  const handleAutoAssign = async () => {
    try {
      setIsAssigning(true)
      setError(null)
      
      console.log('AdminPage: Auto-assigning orders to drivers...')
      const newBatches = await batchService.assignOrdersToDrivers({
        maxOrdersPerBatch: 10,
        maxDistanceKm: 20
      })
      
      console.log('AdminPage: Created batches:', newBatches.length)
      await loadData() // Refresh data
      
      if (newBatches.length > 0) {
        showToast(`Successfully assigned ${newBatches.length} batch(es) to drivers!`, 'success')
      } else {
        showToast('No batches were created. All orders may already be assigned or no drivers available.', 'info')
      }
    } catch (err) {
      console.error('AdminPage: Error auto-assigning:', err)
      setError(err.message)
      showToast(`Error: ${err.message}`, 'error')
    } finally {
      setIsAssigning(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      processing: '#4169E1',
      ready: '#32CD32',
      assigned: '#4169E1',
      'in-progress': '#9370DB',
      'picked-up': '#9370DB',
      delivered: '#228B22',
      cancelled: '#DC143C',
      completed: '#228B22'
    }
    return colors[status] || '#666'
  }

  // Calculate estimated time of arrival based on distance
  // Assumes average speed of 30 km/h in urban areas
  const calculateETA = (distanceKm) => {
    const averageSpeedKmPerHour = 30
    const timeInHours = distanceKm / averageSpeedKmPerHour
    const timeInMinutes = Math.ceil(timeInHours * 60)
    return timeInMinutes
  }

  const unassignedOrders = orders.filter(o => !o.driverId && ['pending', 'ready'].includes(o.status))

  // Always show something, even while loading
  if (loading) {
    return (
      <div className="admin-page" style={{ 
        padding: '20px', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: '0 0 15px 0', color: '#333' }}>Admin Dashboard - Driver Assignment</h1>
        </div>
        <div className="loading-container" style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333' }}>Loading admin dashboard...</h2>
          <p style={{ color: '#666' }}>Please wait...</p>
          <div style={{ marginTop: '20px', color: '#999', fontSize: '14px' }}>
            Loading batches, drivers, and orders...
          </div>
        </div>
      </div>
    )
  }

  console.log('AdminPage: Rendering with data:', { 
    batches: batches.length, 
    drivers: drivers.length, 
    orders: orders.length,
    loading,
    error,
    user: user?.email
  })

  return (
    <div className="admin-page" style={{ 
      minHeight: '100vh', 
      padding: '20px', 
      backgroundColor: '#f5f5f5',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Debug info */}
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '10px', 
        marginBottom: '15px', 
        borderRadius: '4px', 
        fontSize: '12px',
        color: '#1976d2',
        border: '1px solid #90caf9'
      }}>
        <strong>Admin Page Status:</strong> User: {user?.email || 'None'} | 
        Batches: {batches.length} | 
        Drivers: {drivers.length} | 
        Orders: {orders.length} | 
        Loading: {loading ? 'Yes' : 'No'} |
        Error: {error || 'None'}
      </div>
      
      <div className="admin-header" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '28px' }}>Admin Dashboard - Driver Assignment</h1>
        <div className="admin-actions">
          <button 
            onClick={handleAutoAssign} 
            disabled={isAssigning}
            className="assign-btn"
          >
            {isAssigning ? 'Assigning...' : 'Auto-Assign Orders to Drivers'}
          </button>
          <button 
            onClick={() => setAutoAssignEnabled(!autoAssignEnabled)}
            className={autoAssignEnabled ? 'toggle-btn active' : 'toggle-btn'}
          >
            {autoAssignEnabled ? '🟢 Auto-Assign On (Every 5 min)' : '⚪ Auto-Assign Off'}
          </button>
          <button onClick={loadData} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="admin-stats" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-value">{drivers.length}</div>
          <div className="stat-label">Total Drivers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{batches.length}</div>
          <div className="stat-label">Active Batches</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{unassignedOrders.length}</div>
          <div className="stat-label">Unassigned Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Total Orders</div>
        </div>
      </div>

      <div className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Orders Section */}
        <div className="orders-section">
          <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '24px' }}>All Orders ({orders.length})</h2>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            {orders.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No orders found</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map(order => {
                  const orderLocation = order.location || order.deliveryLocation
                  return (
                    <div 
                      key={order.id} 
                      style={{
                        padding: '15px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        backgroundColor: order.driverId ? '#f0f8ff' : '#fff9e6'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '16px', color: '#333' }}>Order #{order.id}</strong>
                          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                            Customer: {order.customerName || 'N/A'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            Business: {order.businessName || 'N/A'}
                          </div>
                        </div>
                        <div style={{ 
                          padding: '4px 12px', 
                          borderRadius: '12px', 
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {order.status}
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#555' }}>
                        <div>
                          <strong>Total:</strong> ${order.total?.toFixed(2) || '0.00'}
                        </div>
                        <div>
                          <strong>Items:</strong> {order.items?.length || 0}
                        </div>
                        <div>
                          <strong>Location:</strong> {orderLocation?.address || orderLocation?.zipCode || 'N/A'}
                        </div>
                        <div>
                          <strong>Driver:</strong> {order.driverId || 'Unassigned'}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                        Created: {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="batches-section">
          <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '24px' }}>Order Batches ({batches.length})</h2>
          
          {batches.length === 0 ? (
            <div className="no-data" style={{ 
              backgroundColor: 'white', 
              padding: '40px', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <p>No batches created yet. Click "Auto-Assign Orders to Drivers" to create batches.</p>
            </div>
          ) : (
            <div className="batches-list" style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              {batches.map(batch => (
                <div 
                  key={batch.id} 
                  className={`batch-card ${selectedBatch?.id === batch.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBatch(batch)}
                >
                  <div className="batch-header">
                    <div className="batch-id">Batch #{batch.id}</div>
                    <div 
                      className="batch-status"
                      style={{ backgroundColor: getStatusColor(batch.status) }}
                    >
                      {batch.status}
                    </div>
                  </div>
                  
                  <div className="batch-details">
                    <p><strong>Driver:</strong> {batch.driverName} ({batch.driverId})</p>
                    <p><strong>Orders:</strong> {batch.orders?.length || 0}</p>
                    <p><strong>Total Distance:</strong> {batch.totalDistance?.toFixed(2) || '0.00'} km</p>
                    <p><strong>Assigned:</strong> {new Date(batch.assignedAt).toLocaleString()}</p>
                    {batch.estimatedDeliveryTime && (
                      <p style={{ color: '#228B22', fontWeight: '600' }}>
                        <strong>ETA:</strong> {new Date(batch.estimatedDeliveryTime).toLocaleString()}
                      </p>
                    )}
                    {!batch.estimatedDeliveryTime && batch.totalDistance && (
                      <p style={{ color: '#666', fontStyle: 'italic' }}>
                        <strong>Estimated ETA:</strong> {calculateETA(batch.totalDistance)} minutes
                      </p>
                    )}
                  </div>

                  {batch.orders && batch.orders.length > 0 && (
                    <div className="batch-orders">
                      <strong>Order IDs:</strong>
                      <div className="order-ids">
                        {batch.orders.map(order => (
                          <span key={order.id} className="order-id-tag">
                            {order.id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="map-section" style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '24px' }}>Batch Map View</h2>
          {selectedBatch ? (
            <MapContainer
              center={(() => {
                const firstOrder = selectedBatch.orders?.[0]
                const orderLocation = firstOrder?.location || firstOrder?.deliveryLocation
                return orderLocation ? [orderLocation.lat, orderLocation.lng] : [40.7128, -74.0060]
              })()}
              zoom={12}
              style={{ height: '500px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Driver location */}
              {selectedBatch.driverId && (() => {
                const driver = drivers.find(d => d.id === selectedBatch.driverId)
                if (driver?.currentLocation) {
                  return (
                    <Marker
                      position={[driver.currentLocation.lat, driver.currentLocation.lng]}
                    >
                      <Popup>
                        <strong>Driver: {driver.name}</strong>
                      </Popup>
                    </Marker>
                  )
                }
                return null
              })()}

              {/* Order locations */}
              {selectedBatch.orders?.map(order => {
                const orderLocation = order.location || order.deliveryLocation
                if (!orderLocation || !orderLocation.lat || !orderLocation.lng) {
                  return null
                }
                return (
                  <Marker
                    key={order.id}
                    position={[orderLocation.lat, orderLocation.lng]}
                  >
                    <Popup>
                      <div>
                        <strong>Order: {order.id}</strong>
                        <p>{orderLocation.address || `${orderLocation.zipCode || 'N/A'}`}</p>
                        <p>Status: {order.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}

              {/* Route line */}
              {selectedBatch.route && selectedBatch.route.length > 1 && (
                <Polyline
                  positions={selectedBatch.route.map(point => [point.lat, point.lng])}
                  color="#681a75"
                  weight={3}
                />
              )}
            </MapContainer>
          ) : (
            <div className="map-placeholder">
              <p>Select a batch to view on map</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

