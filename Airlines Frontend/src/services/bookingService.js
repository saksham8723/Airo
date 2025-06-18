// Booking service to handle booking storage and retrieval via Spring Boot backend
// This connects to Firebase Realtime Database through the backend API

const API_BASE_URL = 'http://localhost:8080/api'

export const bookingService = {
  // Get all bookings for the current user
  getBookings: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${userId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const bookings = await response.json()
      return bookings || []
    } catch (error) {
      console.error('Error getting bookings:', error)
      // Fallback to localStorage if API fails
      try {
        const bookings = localStorage.getItem('airline_bookings')
        return bookings ? JSON.parse(bookings) : []
      } catch (localError) {
        console.error('Error getting bookings from localStorage:', localError)
        return []
      }
    }
  },

  // Save a new booking
  saveBooking: async (booking) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const savedBooking = await response.json()
      
      // Also save to localStorage as backup
      try {
        const existingBookings = JSON.parse(localStorage.getItem('airline_bookings') || '[]')
        existingBookings.push(savedBooking)
        localStorage.setItem('airline_bookings', JSON.stringify(existingBookings))
      } catch (localError) {
        console.error('Error saving to localStorage backup:', localError)
      }
      
      return savedBooking
    } catch (error) {
      console.error('Error saving booking to API:', error)
      
      // Fallback to localStorage if API fails
      try {
        const existingBookings = JSON.parse(localStorage.getItem('airline_bookings') || '[]')
        const newBooking = {
          ...booking,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: 'Confirmed'
        }
        
        const updatedBookings = [...existingBookings, newBooking]
        localStorage.setItem('airline_bookings', JSON.stringify(updatedBookings))
        
        return newBooking
      } catch (localError) {
        console.error('Error saving booking to localStorage:', localError)
        throw error
      }
    }
  },

  // Get a specific booking by ID
  getBookingById: async (userId, bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${userId}/${bookingId}`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting booking by ID:', error)
      
      // Fallback to localStorage
      try {
        const bookings = JSON.parse(localStorage.getItem('airline_bookings') || '[]')
        return bookings.find(booking => booking.id === bookingId) || null
      } catch (localError) {
        console.error('Error getting booking from localStorage:', localError)
        return null
      }
    }
  },

  // Update booking status
  updateBookingStatus: async (userId, bookingId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${userId}/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return true
    } catch (error) {
      console.error('Error updating booking status:', error)
      
      // Fallback to localStorage
      try {
        const bookings = JSON.parse(localStorage.getItem('airline_bookings') || '[]')
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        )
        localStorage.setItem('airline_bookings', JSON.stringify(updatedBookings))
        return true
      } catch (localError) {
        console.error('Error updating booking status in localStorage:', localError)
        return false
      }
    }
  },

  // Delete a booking
  deleteBooking: async (userId, bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${userId}/${bookingId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return true
    } catch (error) {
      console.error('Error deleting booking:', error)
      
      // Fallback to localStorage
      try {
        const bookings = JSON.parse(localStorage.getItem('airline_bookings') || '[]')
        const updatedBookings = bookings.filter(booking => booking.id !== bookingId)
        localStorage.setItem('airline_bookings', JSON.stringify(updatedBookings))
        return true
      } catch (localError) {
        console.error('Error deleting booking from localStorage:', localError)
        return false
      }
    }
  },

  // Clear all bookings (for testing)
  clearAllBookings: () => {
    try {
      localStorage.removeItem('airline_bookings')
      return true
    } catch (error) {
      console.error('Error clearing bookings:', error)
      return false
    }
  }
}

export default bookingService 