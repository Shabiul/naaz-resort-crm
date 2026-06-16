import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, QrCode, CheckCircle, ArrowLeft } from 'lucide-react'
import { api } from '../services/api'

const ROOM_RATES = {
  'Standard Room': 120,
  'Deluxe Room': 200,
  'Suite': 350,
  'Villa': 550,
  'Presidential Suite': 1200,
}

function calcAmount(form) {
  if (!form.check_in || !form.check_out) return 0
  const nights = Math.max(0, (new Date(form.check_out) - new Date(form.check_in)) / 86400000)
  return (ROOM_RATES[form.room_type] || 0) * nights
}

export default function NewBooking() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=form, 2=payment, 3=done
  const [form, setForm] = useState({
    guest_name: '', phone: '', email: '',
    check_in: '', check_out: '',
    adults: '1', children: '0',
    room_type: 'Standard Room', special_requests: '',
  })
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  const amount = calcAmount(form)
  const nights = form.check_in && form.check_out
    ? Math.max(0, (new Date(form.check_out) - new Date(form.check_in)) / 86400000)
    : 0

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleProceed = (e) => {
    e.preventDefault()
    setError('')
    if (!form.guest_name || !form.phone || !form.check_in || !form.check_out) {
      setError('Please fill in all required fields.')
      return
    }
    if (nights <= 0) {
      setError('Check-out must be after check-in.')
      return
    }
    setStep(2)
  }

  const handleConfirmPayment = async () => {
    setPaying(true)
    try {
      const result = await api.createBooking({ ...form, status: 'confirmed' })
      setStep(3)
      setTimeout(() => navigate(`/bookings/${result.booking_id}`), 1800)
    } catch {
      setError('Payment recorded but booking failed. Please try again.')
      setStep(1)
    } finally {
      setPaying(false)
    }
  }

  if (step === 3) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <div className="card py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Payment Confirmed!</h2>
          <p className="text-gray-500 mt-2">Booking created and confirmed.</p>
          <p className="text-sm text-gray-400 mt-1">Redirecting to booking details...</p>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-md mx-auto">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Payment</h2>
          <p className="text-gray-500 text-sm mb-6">Review and confirm payment to complete booking</p>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Guest</span><span className="font-medium">{form.guest_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Room</span><span>{form.room_type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span>{form.check_in}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span>{form.check_out}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Nights</span><span>{nights}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Rate</span><span>${ROOM_RATES[form.room_type]}/night</span></div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-resort-600">${amount.toLocaleString()} <span className="text-xs font-normal text-gray-400">(₹{Math.round(amount * 83).toLocaleString()})</span></span>
            </div>
          </div>

          {/* QR */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-3">Scan to pay ₹{Math.round(amount * 83).toLocaleString()}</p>
            <div className="w-44 h-44 mx-auto bg-white rounded-xl border-2 border-resort-300 flex items-center justify-center shadow-sm">
              <div className="grid grid-cols-5 gap-0.5 p-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-sm ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,7,12,17].includes(i) ? 'bg-gray-900' : 'bg-white'}`} />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">UPI · Card · Net Banking</p>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button onClick={handleConfirmPayment} disabled={paying} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <CheckCircle className="w-5 h-5" />
            {paying ? 'Processing...' : 'Confirm Payment & Book'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">New Booking</h2>
        <p className="text-gray-500 mt-1">Fill in details, then complete payment to confirm</p>
      </div>

      <form onSubmit={handleProceed} className="card space-y-5">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
            <input name="guest_name" value={form.guest_name} onChange={handleChange} className="input-field" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="guest@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
            <input name="check_in" type="date" value={form.check_in} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
            <input name="check_out" type="date" value={form.check_out} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
            <input name="adults" type="number" min="1" value={form.adults} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
            <input name="children" type="number" min="0" value={form.children} onChange={handleChange} className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <select name="room_type" value={form.room_type} onChange={handleChange} className="input-field">
              {Object.entries(ROOM_RATES).map(([type, rate]) => (
                <option key={type} value={type}>{type} — ${rate}/night</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
            <textarea name="special_requests" rows="2" value={form.special_requests} onChange={handleChange} className="input-field" placeholder="Any special requests..." />
          </div>
        </div>

        {/* Live amount preview */}
        {nights > 0 && (
          <div className="p-3 bg-resort-50 rounded-lg flex justify-between items-center">
            <span className="text-sm text-gray-600">{nights} night{nights > 1 ? 's' : ''} × ${ROOM_RATES[form.room_type]}</span>
            <span className="font-bold text-resort-700 text-lg">${amount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <QrCode className="w-4 h-4" /> Proceed to Payment
          </button>
          <button type="button" onClick={() => navigate('/bookings')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
