import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LocationControls from '../../src/components/LocationControls'

describe('LocationControls', () => {
  const defaultProps = {
    zipCode: '10001',
    radius: 10,
    statusFilter: 'all',
    isLoading: false,
    error: null,
    onZipCodeChange: vi.fn(),
    onRadiusChange: vi.fn(),
    onStatusFilterChange: vi.fn()
  }

  const renderControls = (props = {}) => {
    return render(<LocationControls {...defaultProps} {...props} />)
  }

  test('should render all controls', () => {
    renderControls()
    
    expect(screen.getByText('Location & Filters')).toBeInTheDocument()
    expect(screen.getByLabelText(/Zip Code/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Search Radius/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Filter by Status/i)).toBeInTheDocument()
  })

  test('should display zip code value', () => {
    renderControls()
    const zipInput = screen.getByLabelText(/Zip Code/i)
    expect(zipInput.value).toBe('10001')
  })

  test('should call onZipCodeChange when zip code changes', () => {
    const onZipCodeChange = vi.fn()
    renderControls({ onZipCodeChange })
    
    const zipInput = screen.getByLabelText(/Zip Code/i)
    fireEvent.change(zipInput, { target: { value: '90210' } })
    
    expect(onZipCodeChange).toHaveBeenCalledWith('90210')
  })

  test('should display radius value', () => {
    renderControls({ radius: 25 })
    expect(screen.getByText('25 km')).toBeInTheDocument()
  })

  test('should call onRadiusChange when radius changes', () => {
    const onRadiusChange = vi.fn()
    renderControls({ onRadiusChange })
    
    const radiusSlider = screen.getByLabelText(/Search Radius/i)
    fireEvent.change(radiusSlider, { target: { value: '25' } })
    
    expect(onRadiusChange).toHaveBeenCalledWith(25)
  })

  test('should display status filter options', () => {
    renderControls()
    
    const statusSelect = screen.getByLabelText(/Filter by Status/i)
    expect(statusSelect.value).toBe('all')
    expect(statusSelect.querySelector('option[value="pending"]')).toBeInTheDocument()
    expect(statusSelect.querySelector('option[value="ready"]')).toBeInTheDocument()
  })

  test('should call onStatusFilterChange when status changes', () => {
    const onStatusFilterChange = vi.fn()
    renderControls({ onStatusFilterChange })
    
    const statusSelect = screen.getByLabelText(/Filter by Status/i)
    fireEvent.change(statusSelect, { target: { value: 'processing' } })
    
    expect(onStatusFilterChange).toHaveBeenCalledWith('processing')
  })

  test('should display error message when error exists', () => {
    const errorMessage = 'Invalid zip code'
    renderControls({ error: errorMessage })
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  test('should disable input when loading', () => {
    renderControls({ isLoading: true })
    
    const zipInput = screen.getByLabelText(/Zip Code/i)
    expect(zipInput.disabled).toBe(true)
  })

  test('should not display error when no error', () => {
    renderControls()
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

