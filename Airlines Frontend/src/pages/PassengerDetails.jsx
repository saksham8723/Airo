import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeftIcon, UserIcon, IdentificationIcon } from '@heroicons/react/24/outline'

const PassengerDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedFlight } = location.state || {}
  
  const [passengers, setPassengers] = useState([
    {
      type: 'adult',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      passportNumber: '',
      email: '',
      phone: ''
    }
  ])

  const addPassenger = () => {
    if (passengers.length < 6) {
      setPassengers([
        ...passengers,
        {
          type: 'adult',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          passportNumber: '',
          email: '',
          phone: ''
        }
      ])
    }
  }

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      const updatedPassengers = passengers.filter((_, i) => i !== index)
      setPassengers(updatedPassengers)
    }
  }

  const updatePassenger = (index, field, value) => {
    const updatedPassengers = [...passengers]
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value }
    setPassengers(updatedPassengers)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate all passenger details
    const isValid = passengers.every(passenger => 
      passenger.firstName && 
      passenger.lastName && 
      passenger.dateOfBirth && 
      passenger.passportNumber &&
      passenger.email &&
      passenger.phone
    )

    if (!isValid) {
      alert('Please fill in all passenger details')
      return
    }

    // Navigate to payment page with passenger details
    navigate('/payment', {
      state: {
        selectedFlight,
        passengers
      }
    })
  }

  if (!selectedFlight) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No flight selected. Please search for flights first.</p>
        <button
          onClick={() => navigate('/search')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search Flights
        </button>
      </div>
    )
  }

  const formatPrice = (price) => {
    if (typeof price === 'object') {
      const amount = price.currency === 'INR' ? price.total : price.total * 83
      return `₹${amount.toLocaleString('en-IN')}`
    }
    return `₹${price.toLocaleString('en-IN')}`
  }

  const getPriceAmount = (price) => {
    if (typeof price === 'object') {
      return price.currency === 'INR' ? price.total : price.total * 83
    }
    return price
  }

  const totalPrice = getPriceAmount(selectedFlight.price) * passengers.length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/search')}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Passenger Details</h1>
          <p className="text-sm text-gray-600">Enter passenger information for your booking</p>
        </div>
      </div>

      {/* Flight Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="font-semibold text-gray-900 mb-2">Flight Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">From:</span> {selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode}
          </div>
          <div>
            <span className="text-gray-600">To:</span> {selectedFlight.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode}
          </div>
          <div>
            <span className="text-gray-600">Date:</span> {new Date(selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.at).toLocaleDateString()}
          </div>
          <div>
            <span className="text-gray-600">Price per passenger:</span> {formatPrice(selectedFlight.price)}
          </div>
        </div>
      </div>

      {/* Passenger Count */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Number of Passengers</h3>
            <p className="text-sm text-gray-600">Add or remove passengers</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (passengers.length > 1) {
                  const updatedPassengers = passengers.slice(0, -1)
                  setPassengers(updatedPassengers)
                }
              }}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={passengers.length <= 1}
            >
              -
            </button>
            <span className="text-lg font-medium">{passengers.length}</span>
            <button
              onClick={addPassenger}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={passengers.length >= 6}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Passenger Details Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {passengers.map((passenger, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Passenger {index + 1}
              </h3>
              {passengers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePassenger(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={passenger.firstName}
                  onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={passenger.lastName}
                  onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={passenger.dateOfBirth}
                  onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number *
                </label>
                <input
                  type="text"
                  required
                  value={passenger.passportNumber}
                  onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={passenger.email}
                  onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={passenger.phone}
                  onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Passenger Button */}
        {passengers.length < 6 && (
          <button
            type="button"
            onClick={addPassenger}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            + Add Another Passenger
          </button>
        )}

        {/* Total and Continue */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">{formatPrice({ total: totalPrice, currency: 'INR' })}</span>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  )
}

export default PassengerDetails 