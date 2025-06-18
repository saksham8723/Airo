import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import FlightSearch from '../components/FlightSearch'
import FlightResults from '../components/FlightResults'
import { TicketIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { bookingService } from '../services/bookingService'

export default function Dashboard() {
  const [searchResults, setSearchResults] = useState(null)
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  console.log('Dashboard Render:', { user, isAuthenticated })

  useEffect(() => {
    console.log('Dashboard useEffect running')
    // Fetch real bookings from booking service
    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        const userBookings = bookingService.getBookings()
        // Get the 3 most recent bookings
        const recentBookings = userBookings.slice(0, 3)
        setBookings(recentBookings)
      } catch (error) {
        console.error('Failed to fetch bookings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login')
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user?.email || 'User'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Search and book your flights here
          </p>
        </div>
        <Link
          to="/booking-history"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
        >
          View all bookings
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <FlightSearch onSearchResults={setSearchResults} />
      </div>

      {searchResults && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Results</h2>
          <FlightResults flights={searchResults} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No bookings yet</p>
              <Link
                to="/search"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Search Flights
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const flight = booking.flight
                const departure = flight?.itineraries?.[0]?.segments?.[0]?.departure
                const arrival = flight?.itineraries?.[0]?.segments?.[0]?.arrival
                const carrier = flight?.itineraries?.[0]?.segments?.[0]?.carrierCode
                const flightNumber = flight?.itineraries?.[0]?.segments?.[0]?.number

                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <TicketIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {carrier} {flightNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {departure?.iataCode} → {arrival?.iataCode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(departure?.at)} at {formatTime(departure?.at)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.passengers?.length || 0} passenger{(booking.passengers?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link
              to="/booking-history"
              className="w-full btn-secondary flex items-center justify-center"
            >
              View All Bookings
            </Link>
            <button className="w-full btn-secondary">Manage Profile</button>
          </div>
        </div>
      </div>
    </div>
  )
} 