import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { businessService } from '../services/businesses/businessService'
import './AIChat.css'

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting with quick options
      const greeting = "Hi! I'm here to help you find what you need. What would you like to order today?"
      setMessages([{ 
        role: 'assistant', 
        content: greeting,
        quickOptions: [
          { text: '🍕 Pizza', query: 'pizza' },
          { text: '🍔 Burger', query: 'burger' },
          { text: '🍣 Sushi', query: 'sushi' },
          { text: '💊 Pharmacy', query: 'pharmacy' },
          { text: '🛒 Groceries', query: 'grocery' },
          { text: '🍽️ Food', query: 'food' }
        ]
      }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const ensureMenu = async (business) => {
    if (business.menu && Array.isArray(business.menu)) return business
    try {
      const menu = await businessService.getMenuItems(business.id)
      return { ...business, menu }
    } catch (err) {
      console.error('AIChat: failed to load menu for business', business?.id, err)
      return { ...business, menu: [] }
    }
  }

  const getBusinessSuggestions = (query) => {
    const lowerQuery = query.toLowerCase()
    const allBusinesses = []
    
    // Get all businesses and their menu items
    businessService.getAllBusinesses().then(async (businesses) => {
      const withMenus = await Promise.all(businesses.map(b => ensureMenu(b)))
      withMenus.forEach(business => {
        (business.menu || []).forEach(item => {
          if (item.name.toLowerCase().includes(lowerQuery) || 
              item.description.toLowerCase().includes(lowerQuery) ||
              item.category.toLowerCase().includes(lowerQuery) ||
              business.name.toLowerCase().includes(lowerQuery) ||
              business.type.toLowerCase().includes(lowerQuery)) {
            allBusinesses.push({
              business,
              item,
              matchType: item.name.toLowerCase().includes(lowerQuery) ? 'item' : 'business'
            })
          }
        })
      })

      // Sort by relevance
      const sorted = allBusinesses.sort((a, b) => {
        if (a.matchType === 'item' && b.matchType !== 'item') return -1
        if (a.matchType !== 'item' && b.matchType === 'item') return 1
        return 0
      })

      setSuggestions(sorted.slice(0, 5))
    }).catch(() => setSuggestions([]))
  }

  const handleSendMessage = async (queryText) => {
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Analyze user query
    const query = queryText.toLowerCase()
    let response = ''
    let foundSuggestions = []

    // Check for pharmacy items
    if (query.includes('pharmacy') || query.includes('medicine') || query.includes('medication') || 
        query.includes('aspirin') || query.includes('bandaid') || query.includes('vitamin') ||
        query.includes('cough') || query.includes('first aid')) {
      const businesses = await businessService.getBusinessesByType('pharmacy')
      if (businesses.length > 0) {
        const pharmacy = await ensureMenu(businesses[0])
        const preview = (pharmacy.menu || []).slice(0, 3).map(m => m.name).join(', ')
        response = `I found ${pharmacy.name}!${preview ? ` They have items like ${preview}.` : ''} Would you like to see their full menu?`
        foundSuggestions = [pharmacy]
      }
    }
    // Check for restaurant items
    else if (query.includes('pizza') || query.includes('burger') || query.includes('sushi') || 
             query.includes('food') || query.includes('restaurant') || query.includes('eat') ||
             query.includes('lunch') || query.includes('dinner') || query.includes('meal')) {
      const businesses = await businessService.getAllBusinesses()
      const restaurants = businesses.filter(b => b.type === 'restaurant')
      
      if (restaurants.length > 0) {
        // Find specific restaurant type
        let matchedRestaurant = null
        if (query.includes('pizza')) {
          matchedRestaurant = restaurants.find(r => r.name.toLowerCase().includes('pizza'))
        } else if (query.includes('burger')) {
          matchedRestaurant = restaurants.find(r => r.name.toLowerCase().includes('burger'))
        } else if (query.includes('sushi')) {
          matchedRestaurant = restaurants.find(r => r.name.toLowerCase().includes('sushi'))
        }
        
        const targetRestaurant = await ensureMenu(matchedRestaurant || restaurants[0])
        const preview = (targetRestaurant.menu || []).slice(0, 3).map(m => m.name).join(', ')
        response = `I found ${targetRestaurant.name}!${preview ? ` They have items like ${preview}.` : ''} Would you like to see their menu?`
        foundSuggestions = [targetRestaurant]
      }
    }
    // Check for supermarket items
    else if (query.includes('grocery') || query.includes('supermarket') || query.includes('milk') ||
             query.includes('bread') || query.includes('eggs') || query.includes('food items')) {
      const businesses = await businessService.getBusinessesByType('supermarket')
      if (businesses.length > 0) {
        const supermarket = await ensureMenu(businesses[0])
        const preview = (supermarket.menu || []).slice(0, 3).map(m => m.name).join(', ')
        response = `I found ${supermarket.name}!${preview ? ` They have items like ${preview}.` : ''} Would you like to see their full selection?`
        foundSuggestions = [supermarket]
      }
    }
    // Generic search
    else {
      getBusinessSuggestions(query)
      const businesses = await businessService.getAllBusinesses()
      const withMenus = await Promise.all(businesses.map(b => ensureMenu(b)))
      const allItems = []
      withMenus.forEach(business => {
        (business.menu || []).forEach(item => {
          if (item.name.toLowerCase().includes(query) || 
              item.description.toLowerCase().includes(query)) {
            allItems.push({ business, item })
          }
        })
      })

      if (allItems.length > 0) {
        const topMatch = allItems[0]
        response = `I found "${topMatch.item.name}" at ${topMatch.business.name}! They also have other items like ${topMatch.business.menu.slice(0, 3).map(m => m.name).join(', ')}. Would you like to browse their menu?`
        foundSuggestions = [topMatch.business]
      } else {
        response = "I can help you find items from restaurants, pharmacy, or supermarket. What specifically are you looking for? For example, you could say 'pizza', 'pharmacy items', or 'groceries'."
      }
    }

    // Wait for async operations to complete
    if (foundSuggestions.length === 0 && response === '') {
      response = "I can help you find items from restaurants, pharmacy, or supermarket. What specifically are you looking for?"
    }

    const assistantMessage = { 
      role: 'assistant', 
      content: response,
      suggestions: foundSuggestions
    }
    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = { role: 'user', content: inputValue }
    setMessages(prev => [...prev, userMessage])
    const query = inputValue
    setInputValue('')
    setIsTyping(true)
    
    await handleSendMessage(query)
  }

  const handleSuggestionClick = (business) => {
    setIsOpen(false)
    navigate(`/businesses?businessId=${business.id}`)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <button 
        className="ai-chat-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="ai-chat-container">
          <div className="ai-chat-header">
            <h3>AI Shopping Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
          </div>
          
          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.role}`}>
                <div className="message-content">{msg.content}</div>
                {msg.quickOptions && msg.quickOptions.length > 0 && (
                  <div className="quick-options">
                    {msg.quickOptions.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        className="quick-option-btn"
                        onClick={async () => {
                          const query = option.query
                          // Simulate user message
                          const userMessage = { role: 'user', content: query }
                          setMessages(prev => [...prev, userMessage])
                          setIsTyping(true)
                          
                          // Process the query
                          await handleSendMessage(query)
                        }}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="suggestions">
                    {msg.suggestions.map((business, bizIdx) => (
                      <button
                        key={bizIdx}
                        className="suggestion-btn"
                        onClick={() => handleSuggestionClick(business)}
                      >
                        <span className="business-icon">{business.image}</span>
                        <span>{business.name}</span>
                        <span className="arrow">→</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message message-assistant">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What would you like to order?"
            />
            <button onClick={handleSend} disabled={!inputValue.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
