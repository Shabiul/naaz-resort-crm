import { useState, useEffect } from 'react'
import { Calendar, Home, CreditCard, CheckCircle } from 'lucide-react'
import { api } from '../services/api'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For demo, let's just show some mock data
    setBookings([
      {
        id: 1,
        room_type: 'Deluxe Room',
        check_in: new Date().toISOString().split('T')[0],
        check_out: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'confirmed',
        total_price: 2500,
      },
    ])
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">View your current and past bookings</p>
      </div>

      <div className="grid gap-6">
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700">No bookings yet</h2>
            <p className="text-gray-500 mt-2">Contact the front desk to make a booking</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{booking.room_type}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {booking.check_in} - {booking.check_out}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        ₹{booking.total_price}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  <CheckCircle className="w-4 h-4" />
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
