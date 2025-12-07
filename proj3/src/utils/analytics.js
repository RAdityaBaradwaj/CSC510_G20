// Simple analytics tracking for success/failure and time
class Analytics {
  constructor() {
    this.events = []
    this.startTimes = new Map()
  }

  // Track operation start
  startOperation(operationName) {
    this.startTimes.set(operationName, Date.now())
  }

  // Track operation completion (success or failure)
  trackOperation(operationName, success, metadata = {}) {
    const startTime = this.startTimes.get(operationName)
    const duration = startTime ? Date.now() - startTime : 0
    
    const event = {
      operation: operationName,
      success,
      duration,
      timestamp: new Date().toISOString(),
      ...metadata
    }
    
    this.events.push(event)
    this.startTimes.delete(operationName)
    
    // Log to console for now
    console.log(`📊 Analytics: ${operationName} - ${success ? '✅ Success' : '❌ Failed'} (${duration}ms)`)
    
    return event
  }

  // Get analytics summary
  getSummary() {
    const total = this.events.length
    const successful = this.events.filter(e => e.success).length
    const failed = this.events.filter(e => !e.success).length
    const avgDuration = this.events.reduce((sum, e) => sum + e.duration, 0) / total
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total * 100).toFixed(1) + '%' : '0%',
      avgDuration: avgDuration.toFixed(0) + 'ms'
    }
  }

  // Get all events
  getEvents() {
    return this.events
  }

  // Clear analytics
  clear() {
    this.events = []
    this.startTimes.clear()
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Convenience functions
export const trackStart = (operationName) => analytics.startOperation(operationName)
export const trackSuccess = (operationName, metadata) => analytics.trackOperation(operationName, true, metadata)
export const trackFailure = (operationName, metadata) => analytics.trackOperation(operationName, false, metadata)
export const getAnalytics = () => analytics.getSummary()

export default analytics

