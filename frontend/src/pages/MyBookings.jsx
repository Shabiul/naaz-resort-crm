import { useState, useEffect } from 'react'
import { Calendar, Home, CreditCard, Users, BedDouble } from 'lucide-react'
import { api } from '../services/api'

const statusStyle = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  checked_in: 'bg-blue-100 text-blue-800',
  checked_out: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}
// Stages shown in the status tracker (cancelled handled separately)
const STAGES = ['pending', 'confirmed', 'checked_in', 'checked_out']
const stageLabel = { pending: 'Booked', confirmed: 'Confirmed', checked_in: 'Checked In', checked_out: 'Checked Out' }
const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

function StatusTracker({ status }) {
  if (status === 'cancelled') {
    return <span className="text-sm text-red-600 font-medium">This booking was cancelled.</span>
  }
  const currentIdx = STAGES.indexOf(status)
  return (
    <div className="flex items-center gap-1 mt-4">
      {STAGES.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${i <= currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
            <span className={`text-[10px] mt-1 ${i <= currentIdx ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{stageLabel[s]}</span>
          </div>
          {i < STAGES.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyBookings().then((d) => setBookings(Array.isArray(d) ? d : [])).catch(() => setBookings([])).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">View your current and past bookings</p>
      </div>

      <div className="grid gap-5">
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700">No bookings yet</h2>
            <p className="text-gray-500 mt-2">Bookings made under your email will appear here. Contact the front desk to make a reservation.</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{b.room_type}</h3>
                    {b.room?.description && <p className="text-sm text-gray-500 mt-0.5 max-w-md">{b.room.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {b.check_in} → {b.check_out} ({b.nights} {b.nights === 1 ? 'night' : 'nights'})</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {b.adults} adults{b.children ? `, ${b.children} children` : ''}</span>
                      {b.room_count > 1 && <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" /> {b.room_count} rooms</span>}
                      <span className="flex items-center gap-1 font-medium text-gray-800"><CreditCard className="w-4 h-4" /> {money(b.total_amount)}</span>
                    </div>
                    {b.room?.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {b.room.amenities.slice(0, 6).map((a, i) => <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{a}</span>)}
                      </div>
                    )}
                    {b.special_requests && <p className="text-xs text-gray-500 mt-2 italic">Note: {b.special_requests}</p>}
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${statusStyle[b.status] || 'bg-gray-100 text-gray-700'}`}>
                  {b.status.replace('_', ' ')}
                </span>
              </div>
              <StatusTracker status={b.status} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
