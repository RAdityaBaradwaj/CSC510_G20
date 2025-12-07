import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { businessService } from '../services/businesses/businessService'
import './BusinessesPage.css'

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState([])
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToCart, setAddingToCart] = useState({}) // Track which items are being added
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const processingRef = useRef(new Set()) // Track items currently being processed

  useEffect(() => {
    loadBusinesses()
  }, [])

  useEffect(() => {
    // Check if businessId is in URL params (from AI chat redirect)
    const businessId = searchParams.get('businessId')
    if (businessId && businesses.length > 0) {
      const business = businesses.find(b => b.id === businessId)
      if (business) {
        setSelectedBusiness(business)
      }
    }
  }, [searchParams, businesses])

  const loadBusinesses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await businessService.getAllBusinesses()
      setBusinesses(data)
    } catch (err) {
      setError(err.message)
      console.error('Error loading businesses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = useCallback((menuItem) => {
    // Prevent double-clicks and rapid clicks
    const itemKey = `${selectedBusiness?.id}-${menuItem.id}`
    
    if (processingRef.current.has(itemKey)) {
      return // Already processing this item
    }

    // Validate inputs
    if (!selectedBusiness || !selectedBusiness.id || !selectedBusiness.name) {
      showToast('Error: Business information is missing', 'error')
      return
    }

    if (!menuItem || !menuItem.id || !menuItem.name) {
      showToast('Error: Item information is missing', 'error')
      return
    }

    try {
      // Mark as processing
      processingRef.current.add(itemKey)
      setAddingToCart(prev => ({ ...prev, [itemKey]: true }))

      // Add to cart
      addToCart(selectedBusiness.id, selectedBusiness.name, menuItem, 1)
      showToast(`Added ${menuItem.name} to cart!`, 'success')
    } catch (err) {
      console.error('Error adding to cart:', err)
      showToast(`Failed to add ${menuItem.name} to cart: ${err.message || 'Unknown error'}`, 'error')
    } finally {
      // Remove from processing after a short delay to prevent rapid clicks
      setTimeout(() => {
        processingRef.current.delete(itemKey)
        setAddingToCart(prev => {
          const next = { ...prev }
          delete next[itemKey]
          return next
        })
      }, 500) // 500ms debounce
    }
  }, [selectedBusiness, addToCart, showToast])

  if (loading) {
    return (
      <div className="businesses-page">
        <div className="loading">Loading businesses...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="businesses-page">
        <div className="error">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="businesses-page">
      <h1>Browse Businesses</h1>
      
      {!selectedBusiness ? (
        <div className="businesses-grid">
          {businesses.map(business => (
            <div 
              key={business.id} 
              className="business-card"
              onClick={() => setSelectedBusiness(business)}
            >
              <div className="business-icon">{business.image}</div>
              <h2>{business.name}</h2>
              <p className="business-type">{business.type.charAt(0).toUpperCase() + business.type.slice(1)} • {business.category}</p>
              <p className="business-description">{business.description}</p>
              <button className="view-menu-btn">View Menu →</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="menu-view">
          <button className="back-btn" onClick={() => setSelectedBusiness(null)}>
            ← Back to Businesses
          </button>
          
          <div className="business-header">
            <div className="business-icon-large">{selectedBusiness.image}</div>
            <div>
              <h2>{selectedBusiness.name}</h2>
              <p className="business-type">{selectedBusiness.type.charAt(0).toUpperCase() + selectedBusiness.type.slice(1)} • {selectedBusiness.category}</p>
              <p className="business-description">{selectedBusiness.description}</p>
            </div>
          </div>

          <div className="menu-section">
            <h3>Menu</h3>
            <div className="menu-grid">
              {selectedBusiness.menu.map(item => (
                <div key={item.id} className="menu-item-card">
                  <div className="menu-item-info">
                    <h4>{item.name}</h4>
                    <p className="menu-item-description">{item.description}</p>
                    <p className="menu-item-category">{item.category}</p>
                    <p className="menu-item-price">${item.price.toFixed(2)}</p>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAddToCart(item)
                    }}
                    disabled={addingToCart[`${selectedBusiness.id}-${item.id}`]}
                  >
                    {addingToCart[`${selectedBusiness.id}-${item.id}`] ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

