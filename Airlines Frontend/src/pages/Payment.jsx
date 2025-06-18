import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeftIcon, CreditCardIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { bookingService } from '../services/bookingService'
import { useAuthStore } from '../store/authStore'

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedFlight, passengers } = location.state || {}
  const { user } = useAuthStore()
  
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleCardChange = (field, value) => {
    setCardDetails(prev => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (paymentMethod === 'card') {
      // Validate card details
      if (!cardDetails.cardNumber || !cardDetails.cardholderName || !cardDetails.expiryDate || !cardDetails.cvv) {
        alert('Please fill in all card details')
        return
      }
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Generate booking and payment IDs
        const bookingId = generateBookingId()
        const paymentId = generatePaymentId()
        
        // Save booking to backend API
        const bookingData = {
          bookingId,
          paymentId,
          userId: user?.uid || user?.email || 'anonymous',
          flight: selectedFlight,
          passengers,
          totalAmount: totalPrice,
          paymentMethod,
          status: 'Confirmed'
        }
        
        await bookingService.saveBooking(bookingData)
        
        setIsProcessing(false)
        setIsSuccess(true)
        
        // Navigate to confirmation after a short delay
        setTimeout(() => {
          navigate('/booking-confirmation', {
            state: {
              selectedFlight,
              passengers,
              bookingId,
              paymentId
            }
          })
        }, 2000)
      } catch (error) {
        console.error('Error saving booking:', error)
        setIsProcessing(false)
        alert('Payment failed. Please try again.')
      }
    }, 3000)
  }

  const generateBookingId = () => {
    return 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  const generatePaymentId = () => {
    return 'PAY' + Math.random().toString(36).substr(2, 9).toUpperCase()
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

  const totalPrice = getPriceAmount(selectedFlight?.price) * passengers?.length

  if (!selectedFlight || !passengers) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No booking information found. Please start over.</p>
        <button
          onClick={() => navigate('/search')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search Flights
        </button>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Your booking is being confirmed...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/passenger-details', { state: { selectedFlight } })}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payment</h1>
          <p className="text-sm text-gray-600">Complete your booking with secure payment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <CreditCardIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Credit/Debit Card</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">UPI</span>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength="19"
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardChange('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardDetails.cardholderName}
                      onChange={(e) => handleCardChange('cardholderName', e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength="5"
                        value={cardDetails.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '')
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4)
                          }
                          handleCardChange('expiryDate', value)
                        }}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength="4"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardChange('cvv', e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UPI ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="username@upi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="h-4 w-4 mr-2" />
                    Pay {formatPrice({ total: totalPrice, currency: 'INR' })}
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-xs text-gray-500 text-center">
              <LockClosedIcon className="h-3 w-3 inline mr-1" />
              Your payment information is secure and encrypted
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h2>
            
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Flight Details</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span>{selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span>{selectedFlight.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flight:</span>
                    <span>{selectedFlight.itineraries?.[0]?.segments?.[0]?.carrierCode} {selectedFlight.itineraries?.[0]?.segments?.[0]?.number}</span>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Passengers</h3>
                <div className="text-sm space-y-1">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">Passenger {index + 1}:</span>
                      <span>{passenger.firstName} {passenger.lastName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Price Breakdown</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base fare ({passengers.length} × {formatPrice(selectedFlight.price)})</span>
                    <span>{formatPrice({ total: totalPrice, currency: 'INR' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & fees</span>
                    <span>₹0</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice({ total: totalPrice, currency: 'INR' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment 