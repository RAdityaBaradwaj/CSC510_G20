import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { orderService } from '../services/orders/orderService'
import { locationService } from '../services/locationService'
import './CheckoutPage.css'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cart, clearCart, getCartTotal, updateQuantity, removeFromCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  const [zipCode, setZipCode] = useState('10001')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const processingRef = useRef(new Set())

  const handlePlaceOrder = async () => {
    if (!user) {
      showToast('Please log in to place an order', 'error')
      return
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning')
      return
    }

    if (!zipCode || zipCode.length !== 5) {
      showToast('Please enter a valid 5-digit zip code', 'error')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get coordinates from zip code
      const location = await locationService.getCoordinatesFromZip(zipCode)
      
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
            zipCode: zipCode,
            lat: location.lat,
            lng: location.lng,
            address: address || `${zipCode}`
          },
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
          <div className="form-group">
            <label htmlFor="zipCode">Zip Code *</label>
            <input
              id="zipCode"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="10001"
              maxLength={5}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Delivery Address (Optional)</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address, apartment, etc."
            />
          </div>

          <button 
            onClick={handlePlaceOrder}
            disabled={loading || !zipCode || zipCode.length !== 5}
            className="place-order-btn"
          >
            {loading ? 'Placing Order...' : `Place Order ($${total.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  )
}

