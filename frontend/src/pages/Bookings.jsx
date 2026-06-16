import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Eye, XCircle, CheckCircle, MessageCircle } from 'lucide-react'
import { api } from '../services/api'

const statusBadge = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  checked_in: 'badge bg-blue-100 text-blue-800',
  checked_out: 'badge bg-gray-100 text-gray-800',
}

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(null)
  const [waLinks, setWaLinks] = useState({}) // bookingId -> wa link

  const load = () => {
    setLoading(true)
    api.getBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = bookings.filter(
    (b) =>
      b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search) ||
      b.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleConfirm = async (id) => {
    setConfirming(id)
    try {
      const res = await api.confirmBooking(id)
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'confirmed' } : b))
      if (res.whatsapp_link) setWaLinks((prev) => ({ ...prev, [id]: res.whatsapp_link }))
    } finally {
      setConfirming(null)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    await api.cancelBooking(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
          <p className="text-gray-500 mt-1">Manage all room reservations</p>
        </div>
        <Link to="/bookings/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Booking
        </Link>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-resort-500" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Guest</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Room</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Check In</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Check Out</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No bookings found</td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{b.guest_name}</p>
                        <p className="text-xs text-gray-400">{b.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{b.room_type}</td>
                      <td className="px-4 py-3 text-gray-600">{b.check_in}</td>
                      <td className="px-4 py-3 text-gray-600">{b.check_out}</td>
                      <td className="px-4 py-3 font-medium">${b.total_amount?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={statusBadge[b.status] || 'badge'}>{b.status}</span>
                          {b.status === 'confirmed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/bookings/${b.id}`} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {b.status === 'pending' && (
                            <button
                              onClick={() => handleConfirm(b.id)}
                              disabled={confirming === b.id}
                              className="p-1.5 hover:bg-green-50 rounded text-gray-400 hover:text-green-600"
                              title="Confirm booking"
                            >
                              {confirming === b.id
                                ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                                : <CheckCircle className="w-4 h-4" />}
                            </button>
                          )}
                          {waLinks[b.id] && (
                            <a href={waLinks[b.id]} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 hover:bg-green-50 rounded text-gray-400 hover:text-green-600" title="Send WhatsApp">
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          {(b.status === 'pending' || b.status === 'confirmed') && (
                            <button onClick={() => handleCancel(b.id)} className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500" title="Cancel">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
