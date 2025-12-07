import React from 'react'

const LocationControls = ({
  zipCode,
  radius,
  statusFilter,
  isLoading,
  error,
  onZipCodeChange,
  onRadiusChange,
  onStatusFilterChange
}) => {
  return (
    <div className="location-controls">
      <h3>Location & Filters</h3>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="controls-row">
        <label htmlFor="zipCode">Zip Code:</label>
        <input
          id="zipCode"
          type="text"
          value={zipCode}
          onChange={(e) => onZipCodeChange(e.target.value)}
          placeholder="Enter zip code"
          disabled={isLoading}
        />
      </div>

      <div className="controls-row">
        <label htmlFor="radius">Search Radius:</label>
        <input
          id="radius"
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => onRadiusChange(parseInt(e.target.value))}
        />
        <span>{radius} km</span>
      </div>

      <div className="controls-row">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="ready">Ready for Pickup</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
    </div>
  )
}

export default LocationControls
