import { useState } from 'react'
import FlightSearch from '../components/FlightSearch'
import FlightResults from '../components/FlightResults'

export default function FlightSearchPage() {
  const [searchResults, setSearchResults] = useState(null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Search Flights</h1>
        <p className="mt-2 text-sm text-gray-600">
          Find and book flights between cities worldwide
        </p>
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
    </div>
  )
} 