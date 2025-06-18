import axios from 'axios'

const AMADEUS_API_URL = 'https://test.api.amadeus.com/v2'
let accessToken = null
let tokenExpiry = null

// Create separate axios instances for different APIs
const amadeusAxios = axios.create({
  withCredentials: false // Don't send credentials for Amadeus API
})

const getAccessToken = async () => {
  try {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
      console.log('Using existing access token')
      return accessToken
    }

    console.log('Getting new access token...')
    
    const apiKey = import.meta.env.VITE_AMADEUS_API_KEY
    const apiSecret = import.meta.env.VITE_AMADEUS_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error('Missing credentials:', {
        apiKey: apiKey ? 'present' : 'missing',
        apiSecret: apiSecret ? 'present' : 'missing'
      })
      throw new Error('API credentials are missing. Please check your .env file.')
    }

    const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token'
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret
    }).toString()

    const response = await amadeusAxios.post(
      tokenUrl,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    if (!response.data.access_token) {
      throw new Error('No access token received from API')
    }

    accessToken = response.data.access_token
    // Set token expiry to 25 minutes (token usually valid for 30 minutes)
    tokenExpiry = new Date(Date.now() + 25 * 60 * 1000)
    
    console.log('New access token received successfully')
    return accessToken
  } catch (error) {
    console.error('Error getting access token:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    throw new Error('Failed to get access token. Please check your API credentials.')
  }
}

const makeAuthenticatedRequest = async (requestFn) => {
  try {
    if (!accessToken) {
      await getAccessToken()
    }
    return await requestFn()
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('Token expired, getting new token...')
      accessToken = null // Clear the expired token
      await getAccessToken()
      return await requestFn()
    }
    throw error
  }
}

const searchFlights = async (originLocationCode, destinationLocationCode, departureDate, adults = 1) => {
  return makeAuthenticatedRequest(async () => {
    try {
      // Ensure city codes are uppercase
      const originCode = originLocationCode.toUpperCase()
      const destinationCode = destinationLocationCode.toUpperCase()

      const response = await amadeusAxios.get(`${AMADEUS_API_URL}/shopping/flight-offers`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          originLocationCode: originCode,
          destinationLocationCode: destinationCode,
          departureDate,
          adults,
          max: 10,
          currencyCode: 'USD'
        }
      })

      if (!response.data.data || response.data.data.length === 0) {
        throw new Error('No flights found for the selected route')
      }

      return response.data.data
    } catch (error) {
      console.error('Error searching flights:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })

      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors[0].detail || 'Failed to search flights')
      }

      throw error
    }
  })
}

export { searchFlights } 