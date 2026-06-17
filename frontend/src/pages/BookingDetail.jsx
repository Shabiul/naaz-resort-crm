import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, XCircle, Mail, Phone, Calendar, Users, Home, CheckCircle, MessageCircle, CreditCard, RotateCcw, Receipt, Download, RefreshCw } from 'lucide-react'
import { api } from '../services/api'
import { payForBooking } from '../services/payments'
import { useAuth } from '../context/AuthContext'

const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`
const payStatusStyle = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-200 text-gray-600',
}

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [booking, setBooking] = useState(null)
  const [summary, setSummary] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payAmount, setPayAmount] = useState('')
  const [showPay, setShowPay] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [invBusy, setInvBusy] = useState(false)

  const loadSummary = () => api.getBookingPaymentSummary(id).then(setSummary).catch(() => setSummary(null))
  const loadInvoice = () => api.getInvoiceByBooking(id).then(setInvoice).catch(() => setInvoice(null))

  useEffect(() => {
    api.getBooking(id).then(setBooking).catch(() => setBooking(null)).finally(() => setLoading(false))
    loadSummary()
    loadInvoice()
  }, [id])

  const handleGenerateInvoice = async () => {
    setInvBusy(true)
    try { const inv = await api.generateInvoice(id); setInvoice(inv) }
    catch { alert('Failed to generate invoice') }
    finally { setInvBusy(false) }
  }

  const handleDownloadInvoice = async () => {
    if (!invoice) return
    setInvBusy(true)
    try { await api.downloadInvoicePdf(invoice.id, invoice.invoice_number) }
    catch { alert('PDF generation failed') }
    finally { setInvBusy(false) }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return
    await api.cancelBooking(booking.id)
    navigate('/bookings')
  }

  const handleConfirmDirect = async () => {
    setBusy(true)
    try {
      await api.confirmBooking(booking.id)
      setBooking({ ...booking, status: 'confirmed' })
    } finally {
      setBusy(false)
    }
  }

  const handlePay = async (e) => {
    e?.preventDefault()
    setBusy(true)
    setError('')
    try {
      await payForBooking({ bookingId: booking.id, amount: parseFloat(payAmount), user })
      setShowPay(false)
      await loadSummary()
      const fresh = await api.getBooking(id)
      setBooking(fresh)
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setBusy(false)
    }
  }

  const refund = async (p) => {
    if (!confirm(`Refund ${money(p.amount)}?`)) return
    await api.refundPayment(p.id)
    loadSummary()
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-resort-500" /></div>
  }
  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Booking not found</p>
        <Link to="/bookings" className="btn-primary mt-4 inline-block">Back to Bookings</Link>
      </div>
    )
  }

  const due = summary?.due_amount ?? 0
  const isAdmin = user?.role === 'admin'
  const isStaff = ['admin', 'staff'].includes(user?.role)

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
              <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{booking.guest_name}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><span className={`badge-${booking.status} inline-block mt-0.5`}>{booking.status}</span></div>
              <div><p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p><p className="font-medium">{booking.phone}</p></div>
              <div><p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p><p className="font-medium">{booking.email}</p></div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Stay Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Check In</p><p className="font-medium">{booking.check_in}</p></div>
              <div><p className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Check Out</p><p className="font-medium">{booking.check_out}</p></div>
              <div><p className="text-sm text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Guests</p><p className="font-medium">{booking.adults} Adults, {booking.children} Children</p></div>
              <div><p className="text-sm text-gray-500 flex items-center gap-1"><Home className="w-3 h-3" /> Room Type</p><p className="font-medium">{booking.room_type}</p></div>
            </div>
          </div>

          {booking.special_requests && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">Special Requests</h3>
              <p className="text-gray-600">{booking.special_requests}</p>
            </div>
          )}

          {/* Payment history */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Payment History</h3>
            {summary?.payments?.length ? (
              <div className="space-y-2">
                {summary.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${payStatusStyle[p.payment_status]}`}>{p.payment_status}</span>
                      <span className="text-gray-700">{money(p.amount)}</span>
                      <span className="text-gray-400 capitalize">· {p.payment_type}</span>
                      <span className="text-gray-300 text-xs font-mono">{p.transaction_id || p.order_id}</span>
                    </div>
                    {isAdmin && p.payment_status === 'paid' && (
                      <button onClick={() => refund(p)} className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Refund</button>
                    )}
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">No payments recorded yet.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total</span><span className="font-semibold">{money(summary?.total_amount ?? booking.total_amount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Paid</span><span className="text-green-600 font-medium">{money(summary?.paid_amount)}</span></div>
              <div className="flex justify-between text-sm border-t pt-2"><span className="text-gray-500">Due</span><span className="text-xl font-bold text-resort-600">{money(due)}</span></div>
            </div>

            {booking.status !== 'cancelled' && due > 0 && !showPay && (
              <button onClick={() => { setShowPay(true); setPayAmount(String(due)); setError('') }} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" /> Record Payment
              </button>
            )}
            {due <= 0 && summary && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-center text-sm font-medium text-green-700 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Fully Paid
              </div>
            )}

            {showPay && (
              <form onSubmit={handlePay} className="mt-4 space-y-3">
                <input type="number" min="1" max={due} step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resort-500 outline-none" placeholder="Amount" required />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={busy} className="btn-primary flex-1 disabled:opacity-50">{busy ? 'Processing...' : `Charge ${money(parseFloat(payAmount) || 0)}`}</button>
                  <button type="button" onClick={() => setShowPay(false)} className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                </div>
              </form>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {booking.status === 'pending' && (
                <button onClick={handleConfirmDirect} disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {busy ? 'Confirming...' : 'Confirm Booking'}
                </button>
              )}
              {booking.status === 'confirmed' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm font-medium text-green-700">Booking Confirmed</span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Receipt className="w-4 h-4 text-gray-500" /> GST Invoice</h3>
            {invoice ? (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                  <p className="font-mono text-xs text-resort-700 font-semibold">{invoice.invoice_number}</p>
                  <p className="text-gray-600">Base: {money(invoice.base_amount)}</p>
                  {invoice.igst_rate > 0
                    ? <p className="text-gray-500">IGST {invoice.igst_rate}%: {money(invoice.igst_amount)}</p>
                    : <>
                        <p className="text-gray-500">CGST {invoice.cgst_rate}%: {money(invoice.cgst_amount)}</p>
                        <p className="text-gray-500">SGST {invoice.sgst_rate}%: {money(invoice.sgst_amount)}</p>
                      </>
                  }
                  <p className="font-semibold text-gray-900 border-t pt-1 mt-1">Total: {money(invoice.total_amount)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleDownloadInvoice} disabled={invBusy} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-resort-600 hover:bg-resort-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    <Download className="w-4 h-4" /> {invBusy ? '…' : 'Download PDF'}
                  </button>
                  {isStaff && (
                    <button onClick={handleGenerateInvoice} disabled={invBusy} title="Regenerate invoice" className="px-3 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-lg">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : isStaff ? (
              <button onClick={handleGenerateInvoice} disabled={invBusy} className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 text-gray-500 hover:border-resort-400 hover:text-resort-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${invBusy ? 'animate-spin' : ''}`} />
                {invBusy ? 'Generating…' : 'Generate GST Invoice'}
              </button>
            ) : (
              <p className="text-sm text-gray-400">Invoice not yet generated.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
