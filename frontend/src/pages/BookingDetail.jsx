import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, XCircle, Mail, Phone, Calendar, Users, Home, QrCode, CheckCircle, MessageCircle } from 'lucide-react'
import { api } from '../services/api'

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getBooking(id)
      .then(setBooking)
      .catch(() => setBooking(null))
      .finally(() => setLoading(false))
  }, [id])

  const [paymentStep, setPaymentStep] = useState(0) // 0=hidden, 1=show QR, 2=paid
  const [payLoading, setPayLoading] = useState(false)
  const [waLink, setWaLink] = useState(null)
  const [emailSent, setEmailSent] = useState(null)

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return
    await api.cancelBooking(booking.id)
    navigate('/bookings')
  }

  const handleMarkPaid = async () => {
    setPayLoading(true)
    try {
      const res = await api.markBookingPaid(booking.id)
      setPaymentStep(2)
      setBooking({ ...booking, status: 'confirmed' })
      if (res.whatsapp_link) setWaLink(res.whatsapp_link)
      if (res.email_sent !== undefined) setEmailSent(res.email_sent)
    } catch {
      setPaymentStep(0)
    } finally {
      setPayLoading(false)
    }
  }

  const handleConfirmDirect = async () => {
    setPayLoading(true)
    try {
      const res = await api.confirmBooking(booking.id)
      setBooking({ ...booking, status: 'confirmed' })
      if (res.whatsapp_link) setWaLink(res.whatsapp_link)
      if (res.email_sent !== undefined) setEmailSent(res.email_sent)
    } catch {
      // ignore
    } finally {
      setPayLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-resort-500" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Booking not found</p>
        <Link to="/bookings" className="btn-primary mt-4 inline-block">Back to Bookings</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/bookings" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Booking #{booking.id}</h2>
        {booking.status !== 'cancelled' && (
          <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <XCircle className="w-4 h-4" /> Cancel Booking
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{booking.guest_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`badge-${booking.status} inline-block mt-0.5`}>{booking.status}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                <p className="font-medium">{booking.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                <p className="font-medium">{booking.email}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Stay Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Check In</p>
                <p className="font-medium">{booking.check_in}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Check Out</p>
                <p className="font-medium">{booking.check_out}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Guests</p>
                <p className="font-medium">{booking.adults} Adults, {booking.children} Children</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Home className="w-3 h-3" /> Room Type</p>
                <p className="font-medium">{booking.room_type}</p>
              </div>
            </div>
          </div>

          {booking.special_requests && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Special Requests</h3>
              <p className="text-gray-600">{booking.special_requests}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Room Type</span>
                <span>{booking.room_type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Amount</span>
                <span className="text-xl font-bold text-resort-600">${booking.total_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Status</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${booking.status === 'confirmed' || booking.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {booking.status === 'confirmed' || booking.status === 'checked_in' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            {booking.status === 'pending' && paymentStep === 0 && (
              <button onClick={() => setPaymentStep(1)} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4" /> Collect Payment
              </button>
            )}

            {paymentStep === 1 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-3">Scan QR to pay ₹{Math.round((booking.total_amount || 0) * 83).toLocaleString()}</p>
                <div className="w-40 h-40 mx-auto bg-gray-100 rounded-xl flex items-center justify-center border-2 border-resort-300 mb-3">
                  <div className="grid grid-cols-5 gap-0.5 p-2">
                    {Array.from({length: 25}).map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-sm ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,7,12,17].includes(i) ? 'bg-gray-900' : 'bg-white'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">UPI · Card · Net Banking</p>
                <button onClick={handleMarkPaid} disabled={payLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {payLoading ? 'Processing...' : 'Mark as Paid'}
                </button>
              </div>
            )}

            {paymentStep === 2 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-700">Payment Received!</p>
                <p className="text-xs text-green-600">Booking confirmed successfully.</p>
                {emailSent === true && <p className="text-xs text-blue-600">✓ Confirmation email sent</p>}
                {emailSent === false && <p className="text-xs text-gray-400">Email not sent (no key configured)</p>}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {booking.status === 'pending' && (
                <button onClick={handleConfirmDirect} disabled={payLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {payLoading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              )}
              {booking.status === 'confirmed' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-green-700">Booking Confirmed</span>
                </div>
              )}
              {emailSent === true && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-sm text-blue-700">Confirmation email sent</span>
                </div>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary w-full flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Send WhatsApp Confirmation
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
