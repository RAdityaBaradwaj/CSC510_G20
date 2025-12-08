import React, { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]) // [{ businessId, businessName, businessLocation, items: [{ menuItem, quantity }] }]

  const addToCart = useCallback((businessId, businessName, menuItem, quantity = 1, businessLocation = null) => {
    // Validate inputs
    if (!businessId || !businessName) {
      throw new Error('Business ID and name are required')
    }
    
    if (!menuItem || !menuItem.id) {
      throw new Error('Menu item is required and must have an ID')
    }
    
    if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer')
    }
    
    if (!menuItem.price || typeof menuItem.price !== 'number' || menuItem.price < 0) {
      throw new Error('Menu item must have a valid price')
    }

    try {
      setCart(prevCart => {
        const businessIndex = prevCart.findIndex(item => item.businessId === businessId)
        
        if (businessIndex === -1) {
          // New business - add new entry
          return [...prevCart, {
            businessId,
            businessName,
            businessLocation,
            items: [{ menuItem, quantity }]
          }]
        } else {
          // Business exists - add/update item
          const updatedCart = [...prevCart]
          const itemIndex = updatedCart[businessIndex].items.findIndex(
            item => item.menuItem.id === menuItem.id
          )
          
          if (itemIndex === -1) {
            // New item for this business
            updatedCart[businessIndex].items.push({ menuItem, quantity })
          } else {
            // Update quantity - calculate new quantity
            const currentQuantity = updatedCart[businessIndex].items[itemIndex].quantity
            const newQuantity = currentQuantity + quantity
            if (newQuantity > 100) {
              throw new Error('Maximum quantity per item is 100')
            }
            updatedCart[businessIndex].items[itemIndex].quantity = newQuantity
          }
          
          return updatedCart
        }
      })
    } catch (error) {
      console.error('Error in addToCart:', error)
      throw error
    }
  }, [])

  const updateQuantity = useCallback((businessId, menuItemId, quantity) => {
    // Validate inputs
    if (!businessId || !menuItemId) {
      throw new Error('Business ID and menu item ID are required')
    }
    
    if (typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a non-negative integer')
    }
    
    if (quantity > 100) {
      throw new Error('Maximum quantity per item is 100')
    }

    try {
      setCart(prevCart => {
        const businessIndex = prevCart.findIndex(item => item.businessId === businessId)
        if (businessIndex === -1) {
          throw new Error('Business not found in cart')
        }
        
        const updatedCart = [...prevCart]
        const itemIndex = updatedCart[businessIndex].items.findIndex(
          item => item.menuItem.id === menuItemId
        )
        
        if (itemIndex === -1) {
          throw new Error('Menu item not found in cart')
        }
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          updatedCart[businessIndex].items.splice(itemIndex, 1)
          // Remove business entry if no items left
          if (updatedCart[businessIndex].items.length === 0) {
            updatedCart.splice(businessIndex, 1)
          }
        } else {
          updatedCart[businessIndex].items[itemIndex].quantity = quantity
        }
        
        return updatedCart
      })
    } catch (error) {
      console.error('Error in updateQuantity:', error)
      throw error
    }
  }, [])

  const removeFromCart = useCallback((businessId, menuItemId) => {
    // Validate inputs
    if (!businessId || !menuItemId) {
      throw new Error('Business ID and menu item ID are required')
    }

    try {
      setCart(prevCart => {
        const businessIndex = prevCart.findIndex(item => item.businessId === businessId)
        if (businessIndex === -1) {
          throw new Error('Business not found in cart')
        }
        
        const updatedCart = [...prevCart]
        const itemIndex = updatedCart[businessIndex].items.findIndex(
          item => item.menuItem.id === menuItemId
        )
        
        if (itemIndex === -1) {
          throw new Error('Menu item not found in cart')
        }
        
        updatedCart[businessIndex].items.splice(itemIndex, 1)
        
        // Remove business entry if no items left
        if (updatedCart[businessIndex].items.length === 0) {
          updatedCart.splice(businessIndex, 1)
        }
        
        return updatedCart
      })
    } catch (error) {
      console.error('Error in removeFromCart:', error)
      throw error
    }
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, business) => {
      const businessTotal = business.items.reduce((sum, item) => {
        return sum + (item.menuItem.price * item.quantity)
      }, 0)
      return total + businessTotal
    }, 0)
  }, [cart])

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, business) => {
      return count + business.items.reduce((sum, item) => sum + item.quantity, 0)
    }, 0)
  }, [cart])

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
