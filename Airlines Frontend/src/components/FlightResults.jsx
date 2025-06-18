import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaperAirplaneIcon, ClockIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const FlightResults = ({ flights }) => {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('price') // 'price' or 'seats'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' or 'desc'

  const handleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(type)
      setSortOrder('asc')
    }
  }

  const handleBookFlight = (flight) => {
    navigate('/passenger-details', {
      state: { selectedFlight: flight }
    })
  }

  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = typeof a.price === 'object' ? a.price.total : a.price
      const priceB = typeof b.price === 'object' ? b.price.total : b.price
      return sortOrder === 'asc' 
        ? priceA - priceB 
        : priceB - priceA
    } else {
      return sortOrder === 'asc'
        ? a.availableSeats - b.availableSeats
        : b.availableSeats - a.availableSeats
    }
  })

  const formatPrice = (price) => {
    if (typeof price === 'object') {
      // Convert to INR if the price is in a different currency
      const amount = price.currency === 'INR' ? price.total : price.total * 83 // Assuming 1 USD = 83 INR
      return `₹${amount.toLocaleString('en-IN')}`
    }
    // If price is a number, assume it's in INR
    return `₹${price.toLocaleString('en-IN')}`
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (duration) => {
    if (!duration) return 'N/A'
    const match = duration.match(/(\d+)H(\d+)?M?/)
    if (match) {
      const hours = match[1]
      const minutes = match[2] || '00'
      return `${hours}h ${minutes}m`
    }
    return duration
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No flights found. Try different search criteria.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sorting Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">Sort by:</div>
          <div className="flex space-x-4">
            <button
              onClick={() => handleSort('price')}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'price'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('seats')}
              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'seats'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserGroupIcon className="h-4 w-4 mr-1" />
              Seats {sortBy === 'seats' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Flight Results */}
      <div className="space-y-4">
        {sortedFlights.map((flight) => {
          // Extract flight details from the Amadeus API response
          const carrier = flight.itineraries?.[0]?.segments?.[0]?.carrierCode || 'N/A'
          const flightNumber = flight.itineraries?.[0]?.segments?.[0]?.number || 'N/A'
          const departure = flight.itineraries?.[0]?.segments?.[0]?.departure
          const arrival = flight.itineraries?.[0]?.segments?.[0]?.arrival
          const duration = flight.itineraries?.[0]?.duration
          const price = flight.price
          const availableSeats = flight.numberOfBookableSeats || 'N/A'

          return (
            <div
              key={flight.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <PaperAirplaneIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {carrier}
                    </div>
                    <div className="text-sm text-gray-500">
                      Flight {flightNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {availableSeats} seats left
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    <div className="font-medium text-gray-900">
                      {formatTime(departure?.at)}
                    </div>
                    <div>{departure?.iataCode}</div>
                  </div>
                  <div className="flex-1">
                    <div className="h-0.5 bg-gray-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="text-xs text-center text-gray-500 mt-1">
                      {formatDuration(duration)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="font-medium text-gray-900">
                      {formatTime(arrival?.at)}
                    </div>
                    <div>{arrival?.iataCode}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleBookFlight(flight)}
                  className="ml-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FlightResults 