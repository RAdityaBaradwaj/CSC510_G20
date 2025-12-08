import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { orderService } from '../services/orders/orderService'
import './CheckoutPage.css'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cart, clearCart, getCartTotal, updateQuantity, removeFromCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState({ lat: null, lng: null })
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const processingRef = useRef(new Set())
  const addressInputRef = useRef(null)
  const placesLoadedRef = useRef(false)
  const autocompleteServiceRef = useRef(null)
  const geocoderRef = useRef(null)

  const handleAddressInput = (value) => {
    if (!value || value.length < 3) {
      setSuggestions([])
      return
    }
    if (autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: value, types: ['address'] },
        (preds) => setSuggestions(preds || [])
      )
    }
  }

  const handleSelectSuggestion = (sug) => {
    setAddress(sug.description)
    setSuggestions([])
    if (geocoderRef.current && sug.place_id) {
      geocoderRef.current.geocode({ placeId: sug.place_id }, (results, status) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location
          setCoords({ lat: loc.lat(), lng: loc.lng() })
        }
      })
    }
  }

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key || placesLoadedRef.current) return

    const init = () => {
      if (window.google?.maps?.places) {
        placesLoadedRef.current = true
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
        geocoderRef.current = new window.google.maps.Geocoder()
      }
    }

    if (window.google?.maps?.places) {
      init()
    } else {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = init
      document.head.appendChild(script)
    }
  }, [])

  const handlePlaceOrder = async () => {
    if (!user) {
      showToast('Please log in to place an order', 'error')
      return
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning')
      return
    }

    if (!address.trim()) {
      showToast('Please enter a complete street address', 'error')
      return
    }

    let location = coords
    if (!location.lat || !location.lng) {
      const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!key) {
        showToast('Select an address from suggestions to capture location.', 'error')
        return
      }
      try {
        location = await geocodeAddress(address, key)
        setCoords(location)
      } catch (err) {
        showToast('Unable to geocode address. Please try a different address.', 'error')
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      // Create order for each business in cart
      const orderPromises = cart.map(async (businessCart) => {
        const items = businessCart.items.map(item => ({
          id: item.menuItem.id,
          productId: item.menuItem.id,
          productName: item.menuItem.name,
          quantity: item.quantity,
          price: item.menuItem.price,
          subtotal: item.menuItem.price * item.quantity
        }))

        const total = businessCart.items.reduce((sum, item) => 
          sum + (item.menuItem.price * item.quantity), 0
        )

        return orderService.createOrder({
          customerId: user.uid,
          customerName: user.displayName || user.email?.split('@')[0] || 'Customer',
          businessId: businessCart.businessId,
          businessName: businessCart.businessName,
          location: {
            lat: location.lat,
            lng: location.lng,
            address: address.trim()
          },
          pickupLocation: businessCart.businessLocation ? {
            lat: businessCart.businessLocation.lat,
            lng: businessCart.businessLocation.lng,
            address: businessCart.businessLocation.address
          } : null,
          businessLocation: businessCart.businessLocation ? {
            lat: businessCart.businessLocation.lat,
            lng: businessCart.businessLocation.lng,
            address: businessCart.businessLocation.address
          } : null,
          items: items,
          total: total,
          status: 'pending',
          notes: ''
        })
      })

      await Promise.all(orderPromises)
      clearCart()
      showToast('Order placed successfully!', 'success')
      navigate('/orders')
    } catch (err) {
      setError(err.message)
      console.error('Error placing order:', err)
      showToast(`Error placing order: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Browse businesses to add items to your cart</p>
          <button onClick={() => navigate('/businesses')} className="browse-btn">
            Browse Businesses
          </button>
        </div>
      </div>
    )
  }

  const total = getCartTotal()

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      <div className="checkout-content">
        <div className="cart-section">
          <h2>Your Order</h2>
          {cart.map(businessCart => (
            <div key={businessCart.businessId} className="business-order">
              <h3>{businessCart.businessName}</h3>
              <div className="order-items">
                {businessCart.items.map(item => (
                  <div key={item.menuItem.id} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.menuItem.name}</span>
                      <span className="item-price">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="item-controls">
                      <button 
                        onClick={() => {
                          const key = `update-${businessCart.businessId}-${item.menuItem.id}`
                          if (processingRef.current.has(key)) return
                          
                          try {
                            processingRef.current.add(key)
                            updateQuantity(businessCart.businessId, item.menuItem.id, item.quantity - 1)
                            setTimeout(() => processingRef.current.delete(key), 300)
                          } catch (err) {
                            processingRef.current.delete(key)
                            showToast(`Failed to update quantity: ${err.message}`, 'error')
                            console.error('Error updating quantity:', err)
                          }
                        }}
                        className="quantity-btn"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => {
                          const key = `update-${businessCart.businessId}-${item.menuItem.id}`
                          if (processingRef.current.has(key)) return
                          
                          try {
                            processingRef.current.add(key)
                            updateQuantity(businessCart.businessId, item.menuItem.id, item.quantity + 1)
                            setTimeout(() => processingRef.current.delete(key), 300)
                          } catch (err) {
                            processingRef.current.delete(key)
                            showToast(`Failed to update quantity: ${err.message}`, 'error')
                            console.error('Error updating quantity:', err)
                          }
                        }}
                        className="quantity-btn"
                        disabled={item.quantity >= 100}
                      >
                        +
                      </button>
                      <button 
                        onClick={() => {
                          const key = `remove-${businessCart.businessId}-${item.menuItem.id}`
                          if (processingRef.current.has(key)) return
                          
                          try {
                            processingRef.current.add(key)
                            removeFromCart(businessCart.businessId, item.menuItem.id)
                            showToast(`Removed ${item.menuItem.name} from cart`, 'success')
                            setTimeout(() => processingRef.current.delete(key), 300)
                          } catch (err) {
                            processingRef.current.delete(key)
                            showToast(`Failed to remove item: ${err.message}`, 'error')
                            console.error('Error removing from cart:', err)
                          }
                        }}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="business-subtotal">
                Subtotal: ${businessCart.items.reduce((sum, item) => 
                  sum + (item.menuItem.price * item.quantity), 0
                ).toFixed(2)}
              </div>
            </div>
          ))}

          <div className="cart-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="delivery-section">
          <h2>Delivery Information</h2>
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="address">Delivery Address *</label>
            <input
              id="address"
              ref={addressInputRef}
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value)
                handleAddressInput(e.target.value)
              }}
              placeholder="Street address, apartment, etc."
              required
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <div className="autocomplete-list">
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    className="autocomplete-item"
                    onClick={() => handleSelectSuggestion(sug)}
                  >
                    {sug.description}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handlePlaceOrder}
            disabled={loading || !address.trim()}
            className="place-order-btn"
          >
            {loading ? 'Placing Order...' : `Place Order ($${total.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  )
}
