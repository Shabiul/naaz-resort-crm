import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QrCode, CheckCircle, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'

const ROOM_RATES = {
  'Standard Room': 120,
  'Deluxe Room': 200,
  'Suite': 350,
  'Villa': 550,
  'Presidential Suite': 1200,
}

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  return Math.max(0, (new Date(checkOut) - new Date(checkIn)) / 86400000)
}

export default function BookingForm({ variant = 'page' }) {
  const [params] = useSearchParams()
  const [step, setStep] = useState(1) // 1=form, 2=payment, 3=done
  const [form, setForm] = useState({
    guest_name: '',
    phone: '',
    email: '',
    check_in: '',
    check_out: '',
    adults: '2',
    children: '0',
    room_type: params.get('room') || 'Standard Room',
    special_requests: '',
  })
  const [paying, setPaying] = useState(false)
  const [bookingId, setBookingId] = useState(null)
  const [error, setError] = useState('')

  const nights = calcNights(form.check_in, form.check_out)
  const amount = (ROOM_RATES[form.room_type] || 0) * nights
  const amountINR = Math.round(amount * 83)

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
    setError('')
    try {
      const res = await api.createBooking({ ...form, status: 'confirmed' })
      setBookingId(res.booking_id)
      setStep(3)
    } catch {
      setError('Payment recorded but booking failed. Please try again.')
      setStep(1)
    } finally {
      setPaying(false)
    }
  }

  const reset = () => {
    setStep(1)
    setBookingId(null)
    setError('')
    setForm({ guest_name: '', phone: '', email: '', check_in: '', check_out: '', adults: '2', children: '0', room_type: 'Standard Room', special_requests: '' })
  }

  // Step 3 — Done
  if (step === 3) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-navy-800 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-500 mb-2">Payment received. Your reservation is confirmed.</p>
        <p className="text-resort-600 font-medium">Booking ID: #{bookingId}</p>
        <p className="text-gray-400 text-sm mt-1">Total paid: ${amount.toLocaleString()} (₹{amountINR.toLocaleString()})</p>
        <p className="text-gray-400 text-sm mt-3">A confirmation will be sent to your email shortly.</p>
        <button onClick={reset} className="btn-gold mt-6">Make Another Booking</button>
      </motion.div>
    )
  }

  // Step 2 — Payment
  if (step === 2) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </button>

        <h3 className="font-serif font-bold text-2xl text-navy-800 mb-6">Complete Payment</h3>

        {/* Booking summary */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Guest</span><span className="font-medium">{form.guest_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Room</span><span>{form.room_type}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span>{form.check_in}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span>{form.check_out}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Nights</span><span>{nights}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Rate</span><span>${ROOM_RATES[form.room_type]}/night</span></div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-bold text-base">
            <span className="text-navy-800">Total Amount</span>
            <div className="text-right">
              <span className="text-resort-600 text-xl">${amount.toLocaleString()}</span>
              <p className="text-xs text-gray-400 font-normal">₹{amountINR.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-3 font-medium">Scan to pay ₹{amountINR.toLocaleString()}</p>
          <div className="w-48 h-48 mx-auto rounded-2xl border-2 border-resort-300 flex items-center justify-center bg-white shadow-md">
            <div className="grid grid-cols-5 gap-0.5 p-3">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={`w-5 h-5 rounded-sm ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,7,12,17].includes(i) ? 'bg-gray-900' : 'bg-white'}`} />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">UPI · Card · Net Banking · Wallet</p>
        </div>

        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}

        <button onClick={handleConfirmPayment} disabled={paying} className="btn-gold w-full flex items-center justify-center gap-2 text-base py-4">
          <CheckCircle className="w-5 h-5" />
          {paying ? 'Processing...' : 'Confirm Payment & Complete Booking'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">Click after completing payment via QR</p>
      </motion.div>
    )
  }

  // Step 1 — Form
  return (
    <form onSubmit={handleProceed} className="space-y-4">
      <h3 className="font-serif font-bold text-2xl text-navy-800 mb-6">Reserve Your Stay</h3>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input name="guest_name" value={form.guest_name} onChange={handleChange} className="input-luxury" placeholder="Your full name" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="input-luxury" placeholder="+91 98765 43210" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="input-luxury" placeholder="your@email.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
          <input name="check_in" type="date" value={form.check_in} onChange={handleChange} className="input-luxury" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
          <input name="check_out" type="date" value={form.check_out} onChange={handleChange} className="input-luxury" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
          <input name="adults" type="number" min="1" value={form.adults} onChange={handleChange} className="input-luxury" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
          <input name="children" type="number" min="0" value={form.children} onChange={handleChange} className="input-luxury" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
          <select name="room_type" value={form.room_type} onChange={handleChange} className="input-luxury">
            {Object.entries(ROOM_RATES).map(([r, rate]) => <option key={r} value={r}>{r} — ${rate}/night</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
          <textarea name="special_requests" rows="2" value={form.special_requests} onChange={handleChange} className="input-luxury" placeholder="Any preferences or special requests..." />
        </div>
      </div>

      {/* Live price preview */}
      {nights > 0 && (
        <div className="p-4 bg-resort-50 rounded-xl flex justify-between items-center border border-resort-100">
          <span className="text-sm text-gray-600">{nights} night{nights > 1 ? 's' : ''} × ${ROOM_RATES[form.room_type]}</span>
          <div className="text-right">
            <span className="font-bold text-resort-700 text-xl">${amount.toLocaleString()}</span>
            <p className="text-xs text-gray-400">₹{amountINR.toLocaleString()}</p>
          </div>
        </div>
      )}

      <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2 text-base py-4">
        <QrCode className="w-5 h-5" />
        Proceed to Payment
      </button>
    </form>
  )
}
