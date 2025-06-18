import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { searchFlights } from '../services/amadeusService'
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import FlightResults from './FlightResults'

// Common city codes for selection
const commonCities = [
  { name: 'New York', code: 'NYC', country: 'US' },
  { name: 'London', code: 'LON', country: 'GB' },
  { name: 'Paris', code: 'PAR', country: 'FR' },
  { name: 'Tokyo', code: 'TYO', country: 'JP' },
  { name: 'Dubai', code: 'DXB', country: 'AE' },
  { name: 'Singapore', code: 'SIN', country: 'SG' },
  { name: 'Los Angeles', code: 'LAX', country: 'US' },
  { name: 'Sydney', code: 'SYD', country: 'AU' },
  { name: 'Mumbai', code: 'BOM', country: 'IN' },
  { name: 'Delhi', code: 'DEL', country: 'IN' },
  { name: 'Bangalore', code: 'BLR', country: 'IN' },
  { name: 'Chennai', code: 'MAA', country: 'IN' },
  { name: 'Kolkata', code: 'CCU', country: 'IN' },
  { name: 'Hyderabad', code: 'HYD', country: 'IN' },
  { name: 'Pune', code: 'PNQ', country: 'IN' },
  { name: 'Ahmedabad', code: 'AMD', country: 'IN' },
  { name: 'Kochi', code: 'COK', country: 'IN' },
  { name: 'Lucknow', code: 'LKO', country: 'IN' },
  { name: 'Jaipur', code: 'JAI', country: 'IN' },
  { name: 'Chandigarh', code: 'IXC', country: 'IN' },
  { name: 'Guwahati', code: 'GAU', country: 'IN' },
  { name: 'Patna', code: 'PAT', country: 'IN' },
  { name: 'Bhopal', code: 'BHO', country: 'IN' },
  { name: 'Indore', code: 'IDR', country: 'IN' },
  { name: 'Varanasi', code: 'VNS', country: 'IN' },
  { name: 'Amritsar', code: 'ATQ', country: 'IN' },
  { name: 'Goa', code: 'GOI', country: 'IN' },
  { name: 'Nagpur', code: 'NAG', country: 'IN' },
  { name: 'Vishakhapatnam', code: 'VTZ', country: 'IN' },
  { name: 'Thiruvananthapuram', code: 'TRV', country: 'IN' },
  { name: 'Coimbatore', code: 'CJB', country: 'IN' },
  { name: 'Madurai', code: 'IXM', country: 'IN' },
  { name: 'Mangalore', code: 'IXE', country: 'IN' },
  { name: 'Bhubaneswar', code: 'BBI', country: 'IN' },
  { name: 'Ranchi', code: 'IXR', country: 'IN' },
  { name: 'Raipur', code: 'RPR', country: 'IN' },
  { name: 'Jodhpur', code: 'JDH', country: 'IN' },
  { name: 'Dehradun', code: 'DED', country: 'IN' },
  { name: 'Imphal', code: 'IMF', country: 'IN' },
  { name: 'Agartala', code: 'IXA', country: 'IN' },
  { name: 'Aizawl', code: 'AJL', country: 'IN' },
  { name: 'Dimapur', code: 'DMU', country: 'IN' },
  { name: 'Silchar', code: 'IXS', country: 'IN' },
  { name: 'Port Blair', code: 'IXZ', country: 'IN' }
]

export default function FlightSearch() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)
  const [isOriginFocused, setIsOriginFocused] = useState(false)
  const [isDestinationFocused, setIsDestinationFocused] = useState(false)
  const originRef = useRef(null)
  const destinationRef = useRef(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const originInput = watch('origin')
  const destinationInput = watch('destination')

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (originRef.current && !originRef.current.contains(event.target)) {
        setShowOriginDropdown(false)
        setIsOriginFocused(false)
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target)) {
        setShowDestinationDropdown(false)
        setIsDestinationFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCitySelect = (city, isOrigin = true) => {
    console.log('Selected city:', city)
    if (isOrigin) {
      setValue('origin', `${city.name} (${city.code})`)
      setValue('originCode', city.code)
      setShowOriginDropdown(false)
      setIsOriginFocused(false)
    } else {
      setValue('destination', `${city.name} (${city.code})`)
      setValue('destinationCode', city.code)
      setShowDestinationDropdown(false)
      setIsDestinationFocused(false)
    }
  }

  const filterCities = (input) => {
    if (!input) return commonCities
    const searchTerm = input.toLowerCase()
    return commonCities.filter(city => 
      city.name.toLowerCase().includes(searchTerm) || 
      city.code.toLowerCase().includes(searchTerm)
    )
  }

  const renderCityDropdown = (cities, isOrigin = true) => (
    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-60 overflow-auto">
      {cities.length > 0 ? (
        cities.map((city) => (
          <button
            key={city.code}
            type="button"
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleCitySelect(city, isOrigin)}
          >
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
              <div>
                <div className="font-medium">{city.name}</div>
                <div className="text-xs text-gray-500">
                  {city.code} • {city.country}
                </div>
              </div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-gray-500">No cities found</div>
      )}
    </div>
  )

  const handleFlightSelect = (flight) => {
    if (!isAuthenticated) {
      toast.error('Please log in to book flights')
      navigate('/login')
      return
    }
    
    // TODO: Implement flight booking logic
    console.log('Selected flight:', flight)
    toast.success('Flight selected! Proceeding to booking...')
  }

  const onSubmit = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please log in to search flights')
      navigate('/login')
      return
    }

    try {
      console.log('Submitting search with data:', data)
      setIsLoading(true)
      
      // Validate city selection
      if (!data.origin || !data.destination) {
        toast.error('Please select both origin and destination cities')
        return
      }

      if (!data.originCode || !data.destinationCode) {
        toast.error('Please select valid cities from the dropdown')
        return
      }

      if (data.originCode === data.destinationCode) {
        toast.error('Origin and destination cannot be the same city')
        return
      }

      // Log the city codes being used
      console.log('Using city codes:', {
        origin: data.originCode,
        destination: data.destinationCode
      })

      const results = await searchFlights(
        data.originCode,
        data.destinationCode,
        data.departureDate,
        data.passengers
      )
      
      console.log('Search results:', results)
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      toast.error(error.message || 'Failed to search flights. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="relative" ref={originRef}>
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
              From
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="origin"
                className={`input-field ${errors.origin ? 'border-red-500' : ''}`}
                placeholder="Search city or airport"
                {...register('origin', { 
                  required: 'Origin is required',
                  validate: value => {
                    const city = commonCities.find(c => 
                      value.toLowerCase().includes(c.name.toLowerCase()) || 
                      value.toLowerCase().includes(c.code.toLowerCase())
                    )
                    return city ? true : 'Please select a valid city from the dropdown'
                  }
                })}
                onFocus={() => {
                  setIsOriginFocused(true)
                  setShowOriginDropdown(true)
                }}
              />
              {errors.origin && (
                <p className="mt-2 text-sm text-red-600">{errors.origin.message}</p>
              )}
            </div>
            {showOriginDropdown && renderCityDropdown(filterCities(originInput), true)}
          </div>

          <div className="relative" ref={destinationRef}>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
              To
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="destination"
                className={`input-field ${errors.destination ? 'border-red-500' : ''}`}
                placeholder="Search city or airport"
                {...register('destination', { 
                  required: 'Destination is required',
                  validate: value => {
                    const city = commonCities.find(c => 
                      value.toLowerCase().includes(c.name.toLowerCase()) || 
                      value.toLowerCase().includes(c.code.toLowerCase())
                    )
                    return city ? true : 'Please select a valid city from the dropdown'
                  }
                })}
                onFocus={() => {
                  setIsDestinationFocused(true)
                  setShowDestinationDropdown(true)
                }}
              />
              {errors.destination && (
                <p className="mt-2 text-sm text-red-600">{errors.destination.message}</p>
              )}
            </div>
            {showDestinationDropdown && renderCityDropdown(filterCities(destinationInput), false)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">
              Departure Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="departureDate"
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                {...register('departureDate', { required: 'Departure date is required' })}
              />
              {errors.departureDate && (
                <p className="mt-2 text-sm text-red-600">{errors.departureDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="passengers" className="block text-sm font-medium text-gray-700">
              Passengers
            </label>
            <div className="mt-1">
              <select
                id="passengers"
                className="input-field"
                {...register('passengers', { required: 'Number of passengers is required' })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
              {errors.passengers && (
                <p className="mt-2 text-sm text-red-600">{errors.passengers.message}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Search Flights
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {searchResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Available Flights
          </h2>
          <FlightResults 
            flights={searchResults} 
            onSelectFlight={handleFlightSelect}
          />
        </div>
      )}
    </div>
  )
} 