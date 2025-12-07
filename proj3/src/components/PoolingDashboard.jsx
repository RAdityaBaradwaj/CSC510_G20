import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import { poolingService } from '../services/pooling/poolingService'
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

const PoolingDashboard = () => {
  const [zipCode, setZipCode] = useState('10001')
  const [userLocation, setUserLocation] = useState(null)
  const [pools, setPools] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [activeTab, setActiveTab] = useState('pools') // 'pools', 'suggestions', 'create'
  const [selectedOrders, setSelectedOrders] = useState([])
  const [availableOrders, setAvailableOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load pools on mount
  useEffect(() => {
    loadPools()
    loadLocation()
  }, [])

  const loadLocation = async () => {
    try {
      setIsLoading(true)
      const location = await locationService.getCoordinatesFromZip(zipCode)
      setUserLocation(location)
    } catch (err) {
      console.error('Location error:', err)
      setError('Could not load location')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPools = async () => {
    try {
      trackStart('fetch-pools')
      setIsLoading(true)
      const data = await poolingService.getAllPools()
      setPools(data)
      trackSuccess('fetch-pools', { count: data.length })
    } catch (err) {
      console.error('Error loading pools:', err)
      setError('Failed to load pools')
      trackFailure('fetch-pools', { error: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSuggestions = async () => {
    if (!userLocation) return

    try {
      trackStart('fetch-suggestions')
      setIsLoading(true)
      const data = await poolingService.getSuggestions(userLocation, 10, 5)
      setSuggestions(data)
      trackSuccess('fetch-suggestions', { count: data.length })
    } catch (err) {
      console.error('Error loading suggestions:', err)
      setError('Failed to load suggestions')
      trackFailure('fetch-suggestions', { error: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAvailableOrders = async () => {
    if (!userLocation) return

    try {
      setIsLoading(true)
      const data = await orderService.getNearbyOrders(userLocation, 10, { status: 'pending' })
      setAvailableOrders(data)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePoolFromSuggestion = async (suggestion) => {
    try {
      trackStart('create-pool')
      setIsLoading(true)
      
      const pool = await poolingService.createPool({
        name: `Pool ${Date.now()}`,
        description: 'Created from suggestion',
        orders: suggestion.orders,
        startLocation: userLocation,
        status: 'pending'
      })

      // Reload pools
      await loadPools()
      setActiveTab('pools')
      setError(null)
      trackSuccess('create-pool', { poolId: pool.id })
    } catch (err) {
      console.error('Error creating pool:', err)
      setError(err.message || 'Failed to create pool')
      trackFailure('create-pool', { error: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateManualPool = async () => {
    if (selectedOrders.length < 2) {
      setError('Please select at least 2 orders')
      return
    }

    try {
      trackStart('create-pool')
      setIsLoading(true)
      
      const pool = await poolingService.createPool({
        name: `Manual Pool ${Date.now()}`,
        description: 'Manually created pool',
        orders: selectedOrders,
        startLocation: userLocation,
        status: 'pending'
      })

      // Reload pools
      await loadPools()
      setSelectedOrders([])
      setActiveTab('pools')
      setError(null)
      trackSuccess('create-pool', { poolId: pool.id })
    } catch (err) {
      console.error('Error creating pool:', err)
      setError(err.message || 'Failed to create pool')
      trackFailure('create-pool', { error: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartDelivery = async (poolId) => {
    try {
      trackStart('start-delivery')
      await poolingService.startDelivery(poolId)
      await loadPools()
      trackSuccess('start-delivery', { poolId })
    } catch (err) {
      console.error('Error starting delivery:', err)
      setError(err.message || 'Failed to start delivery')
      trackFailure('start-delivery', { error: err.message })
    }
  }

  const handleCompleteDelivery = async (poolId) => {
    try {
      trackStart('complete-delivery')
      await poolingService.completeDelivery(poolId)
      await loadPools()
      trackSuccess('complete-delivery', { poolId })
    } catch (err) {
      console.error('Error completing delivery:', err)
      setError(err.message || 'Failed to complete delivery')
      trackFailure('complete-delivery', { error: err.message })
    }
  }

  useEffect(() => {
    if (activeTab === 'suggestions' && userLocation) {
      loadSuggestions()
    } else if (activeTab === 'create' && userLocation) {
      loadAvailableOrders()
    }
  }, [activeTab, userLocation])

  const toggleOrderSelection = (order) => {
    if (selectedOrders.find(o => o.id === order.id)) {
      setSelectedOrders(selectedOrders.filter(o => o.id !== order.id))
    } else {
      if (selectedOrders.length >= 10) {
        setError('Maximum 10 orders per pool')
        return
      }
      setSelectedOrders([...selectedOrders, order])
    }
  }

  const getRouteColor = (pool) => {
    switch (pool.status) {
      case 'pending': return 'blue'
      case 'active': return 'green'
      case 'in-progress': return 'orange'
      case 'completed': return 'gray'
      default: return 'blue'
    }
  }

  return (
    <div className="pooling-dashboard">
      <div className="dashboard-header">
        <h1>🏘️ Pooling Dashboard</h1>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Zip Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadLocation()}
            className="zip-input"
          />
          <button onClick={loadLocation} disabled={isLoading}>
            Load Location
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="tabs">
        <button
          className={activeTab === 'pools' ? 'active' : ''}
          onClick={() => setActiveTab('pools')}
        >
          Active Pools ({pools.length})
        </button>
        <button
          className={activeTab === 'suggestions' ? 'active' : ''}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions ({suggestions.length})
        </button>
        <button
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          Create Pool
        </button>
      </div>

      <div className="dashboard-content">
        {/* Pools Tab */}
        {activeTab === 'pools' && (
          <div className="pools-view">
            <h2>Active Pools</h2>
            {isLoading ? (
              <div className="loading">Loading pools...</div>
            ) : pools.length === 0 ? (
              <div className="empty-state">No active pools</div>
            ) : (
              <div className="pools-grid">
                {pools.map(pool => (
                  <div key={pool.id} className="pool-card">
                    <h3>{pool.name}</h3>
                    <div className="pool-stats">
                      <span>📦 {pool.orders.length} orders</span>
                      <span>📏 {pool.estimatedDistance.toFixed(1)} km</span>
                      <span>💰 ${pool.savings.toFixed(2)} savings</span>
                    </div>
                    <div className="pool-status">Status: {pool.status}</div>
                    {pool.driverName && <div className="pool-driver">Driver: {pool.driverName}</div>}
                    <div className="pool-actions">
                      {pool.status === 'pending' && (
                        <button onClick={() => handleStartDelivery(pool.id)}>
                          Start Delivery
                        </button>
                      )}
                      {pool.status === 'in-progress' && (
                        <button onClick={() => handleCompleteDelivery(pool.id)}>
                          Complete Delivery
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="suggestions-view">
            <h2>Pool Suggestions</h2>
            {isLoading ? (
              <div className="loading">Loading suggestions...</div>
            ) : suggestions.length === 0 ? (
              <div className="empty-state">No suggestions available</div>
            ) : (
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-card">
                    <h3>Suggestion {index + 1}</h3>
                    <div className="suggestion-info">
                      <span>📦 {suggestion.orders.length} orders</span>
                      <span>📏 {suggestion.estimatedDistance.toFixed(1)} km</span>
                      <span>💰 ${suggestion.potentialSavings.toFixed(2)} savings</span>
                      <span>🏷️ {suggestion.confidence} confidence</span>
                    </div>
                    <button onClick={() => handleCreatePoolFromSuggestion(suggestion)}>
                      Create Pool
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="create-view">
            <h2>Create Manual Pool</h2>
            <div className="create-info">
              <p>Selected: {selectedOrders.length} orders</p>
              {selectedOrders.length >= 2 && (
                <button onClick={handleCreateManualPool} disabled={isLoading}>
                  Create Pool
                </button>
              )}
            </div>
            {isLoading ? (
              <div className="loading">Loading orders...</div>
            ) : (
              <div className="orders-grid">
                {availableOrders.map(order => (
                  <div
                    key={order.id}
                    className={`order-select-card ${selectedOrders.find(o => o.id === order.id) ? 'selected' : ''}`}
                    onClick={() => toggleOrderSelection(order)}
                  >
                    <h4>Order {order.id}</h4>
                    <div>{order.customerName}</div>
                    <div>${order.total.toFixed(2)}</div>
                    <div>{order.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map View */}
        <div className="map-container">
          {userLocation && (
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={12}
              style={{ height: '500px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Start location marker */}
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>Start Location</Popup>
              </Marker>

              {/* Pool routes and markers */}
              {pools.map(pool => {
                if (!pool.optimizedRoute || !pool.optimizedRoute.waypoints) return null
                
                const routeColor = getRouteColor(pool)
                const positions = pool.optimizedRoute.waypoints
                  .map(wp => [wp.location.lat, wp.location.lng])
                  .filter(pos => pos[0] && pos[1])

                return (
                  <React.Fragment key={pool.id}>
                    {positions.length > 1 && (
                      <Polyline positions={positions} color={routeColor} />
                    )}
                    {positions.map((pos, idx) => (
                      <Marker key={idx} position={pos}>
                        <Popup>Order {idx + 1} - {pool.name}</Popup>
                      </Marker>
                    ))}
                  </React.Fragment>
                )
              })}
            </MapContainer>
          )}
        </div>
      </div>

      <style jsx>{`
        .pooling-dashboard {
          padding: 20px;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .dashboard-header h1 {
          margin: 0;
        }
        .header-controls {
          display: flex;
          gap: 10px;
        }
        .zip-input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .error-banner {
          background: #ff6b6b;
          color: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .tabs button {
          padding: 10px 20px;
          border: 1px solid #ccc;
          background: white;
          cursor: pointer;
          border-radius: 4px 4px 0 0;
        }
        .tabs button.active {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }
        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .map-container {
          grid-column: span 2;
        }
        .pools-grid, .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pool-card, .suggestion-card {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 15px;
          background: white;
        }
        .pool-stats, .suggestion-info {
          display: flex;
          gap: 15px;
          margin: 10px 0;
        }
        .pool-status {
          margin: 5px 0;
          font-weight: bold;
        }
        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        .order-select-card {
          border: 2px solid #ccc;
          border-radius: 4px;
          padding: 10px;
          cursor: pointer;
          background: white;
        }
        .order-select-card.selected {
          border-color: #4CAF50;
          background: #e8f5e9;
        }
        .loading, .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        .create-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        button {
          padding: 8px 16px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #45a049;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

export default PoolingDashboard

