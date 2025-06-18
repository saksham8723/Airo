import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircleIcon, DocumentTextIcon, ArrowDownTrayIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline'
import jsPDF from 'jspdf'

const BookingConfirmation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedFlight, passengers, bookingId, paymentId } = location.state || {}

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

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!selectedFlight || !passengers || !bookingId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No booking information found.</p>
        <button
          onClick={() => navigate('/search')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search Flights
        </button>
      </div>
    )
  }

  const handleDownloadTicket = () => {
    // Create PDF document
    const doc = new jsPDF()
    
    // Set document properties
    doc.setProperties({
      title: `Flight Ticket - ${bookingId}`,
      subject: 'Airline Ticket',
      author: 'Airlines Pro',
      creator: 'Airlines Pro Booking System'
    })

    // Add professional header with logo
    doc.setFillColor(59, 130, 246) // Blue background
    doc.rect(0, 0, 210, 30, 'F')
    
    // Airlines Pro Logo
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont(undefined, 'bold')
    doc.text('Airlines Pro', 105, 18, { align: 'center' })
    
    // Subtitle
    doc.setFontSize(12)
    doc.setFont(undefined, 'normal')
    doc.text('Premium Air Travel Services', 105, 26, { align: 'center' })
    
    // Main title
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246)
    doc.setFont(undefined, 'bold')
    doc.text('ELECTRONIC TICKET', 105, 45, { align: 'center' })
    
    // Add booking details section
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    
    // Booking Information Box
    doc.setDrawColor(59, 130, 246)
    doc.setFillColor(248, 250, 252) // Light gray background
    doc.roundedRect(15, 55, 80, 35, 3, 3, 'FD')
    
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text('Booking Information', 20, 65)
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(`Booking ID: ${bookingId}`, 20, 75)
    doc.text(`Payment ID: ${paymentId}`, 20, 82)
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, 89)
    
    // Flight Information Box
    doc.setDrawColor(59, 130, 246)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(105, 55, 80, 35, 3, 3, 'FD')
    
    const departure = selectedFlight.itineraries?.[0]?.segments?.[0]?.departure
    const arrival = selectedFlight.itineraries?.[0]?.segments?.[0]?.arrival
    const carrier = selectedFlight.itineraries?.[0]?.segments?.[0]?.carrierCode
    const flightNumber = selectedFlight.itineraries?.[0]?.segments?.[0]?.number
    
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text('Flight Details', 110, 65)
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(`${carrier} ${flightNumber}`, 110, 75)
    doc.text(`${departure?.iataCode} → ${arrival?.iataCode}`, 110, 82)
    doc.text(`${formatDate(departure?.at)}`, 110, 89)
    
    // Travel Details Section
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text('Travel Details', 20, 110)
    
    // Departure and Arrival times in a professional layout
    doc.setDrawColor(59, 130, 246)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(15, 120, 80, 25, 3, 3, 'FD')
    doc.roundedRect(115, 120, 80, 25, 3, 3, 'FD')
    
    // Departure
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text('DEPARTURE', 55, 130, { align: 'center' })
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(formatTime(departure?.at), 55, 140, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(departure?.iataCode, 55, 147, { align: 'center' })
    
    // Arrival
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text('ARRIVAL', 155, 130, { align: 'center' })
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(formatTime(arrival?.at), 155, 140, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(arrival?.iataCode, 155, 147, { align: 'center' })
    
    // Passenger Information Section
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text('Passenger Information', 20, 165)
    
    // Passenger details in a table format
    passengers.forEach((passenger, index) => {
      const yPos = 175 + (index * 20)
      if (yPos < 250) { // Prevent overflow
        doc.setDrawColor(226, 232, 240)
        doc.setFillColor(248, 250, 252)
        doc.roundedRect(15, yPos - 5, 180, 15, 2, 2, 'FD')
        
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(59, 130, 246)
        doc.text(`Passenger ${index + 1}`, 20, yPos)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(0, 0, 0)
        doc.text(`${passenger.firstName} ${passenger.lastName}`, 50, yPos)
        doc.text(`Passport: ${passenger.passportNumber}`, 120, yPos)
      }
    })
    
    // Price Information Section
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text('Price Summary', 20, 220)
    
    // Price details in a professional box
    doc.setDrawColor(59, 130, 246)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(15, 230, 180, 30, 3, 3, 'FD')
    
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(`Base Fare (${passengers.length} × ${formatPrice(selectedFlight.price)}):`, 20, 240)
    doc.text(`${formatPrice({ total: totalPrice, currency: 'INR' })}`, 160, 240, { align: 'right' })
    doc.text(`Taxes & Fees:`, 20, 250)
    doc.text(`₹0`, 160, 250, { align: 'right' })
    
    // Total amount with emphasis
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text(`Total Amount:`, 20, 260)
    doc.text(`${formatPrice({ total: totalPrice, currency: 'INR' })}`, 160, 260, { align: 'right' })
    
    // Footer with professional styling
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 270, 210, 30, 'F')
    
    doc.setFontSize(8)
    doc.setTextColor(255, 255, 255)
    doc.text('This is an official electronic ticket issued by Airlines Pro.', 105, 280, { align: 'center' })
    doc.text('Please keep this document safe and present it at check-in.', 105, 285, { align: 'center' })
    doc.text('For support, contact: support@airlinespro.com | +1-800-AIRLINES', 105, 290, { align: 'center' })
    
    // Save the PDF
    doc.save(`AirlinesPro-Ticket-${bookingId}.pdf`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center py-8">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">Your flight has been successfully booked</p>
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
          <p className="text-green-800 font-medium">Booking ID: {bookingId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Flight Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Departure</h3>
                  <div className="space-y-1 text-sm">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTime(selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.at)}
                    </div>
                    <div className="text-gray-600">
                      {formatDate(selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.at)}
                    </div>
                    <div className="font-medium">
                      {selectedFlight.itineraries?.[0]?.segments?.[0]?.departure?.iataCode}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Arrival</h3>
                  <div className="space-y-1 text-sm">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTime(selectedFlight.itineraries?.[0]?.segments?.[0]?.arrival?.at)}
                    </div>
                    <div className="text-gray-600">
                      {formatDate(selectedFlight.itineraries?.[0]?.segments?.[0]?.arrival?.at)}
                    </div>
                    <div className="font-medium">
                      {selectedFlight.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Flight Number:</span>
                  <div className="font-medium">{selectedFlight.itineraries?.[0]?.segments?.[0]?.carrierCode} {selectedFlight.itineraries?.[0]?.segments?.[0]?.number}</div>
                </div>
                <div>
                  <span className="text-gray-600">Aircraft:</span>
                  <div className="font-medium">Boeing 737</div>
                </div>
                <div>
                  <span className="text-gray-600">Class:</span>
                  <div className="font-medium">Economy</div>
                </div>
                <div>
                  <span className="text-gray-600">Seat:</span>
                  <div className="font-medium">To be assigned</div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Passenger Information
            </h2>
            
            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Passenger {index + 1}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {passenger.firstName} {passenger.lastName}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-600">Passport</div>
                      <div className="font-medium">{passenger.passportNumber}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base fare:</span>
                <span>{formatPrice({ total: totalPrice, currency: 'INR' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes & fees:</span>
                <span>₹0</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                <span>Total paid:</span>
                <span className="text-blue-600">{formatPrice({ total: totalPrice, currency: 'INR' })}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Payment ID: {paymentId}</div>
                <div>Payment Method: Credit Card</div>
                <div>Status: Confirmed</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h2>
            
            <div className="space-y-3">
              <button
                onClick={handleDownloadTicket}
                className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download PDF Ticket
              </button>
              
              <button
                onClick={() => navigate('/booking-history')}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                View All Bookings
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Important Information</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Check-in opens 24 hours before departure</li>
              <li>• Arrive at airport 2 hours before departure</li>
              <li>• Keep your booking ID handy</li>
              <li>• Download your ticket for offline access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation 