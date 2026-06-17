import { useState, useEffect } from 'react'
import { FileText, CreditCard, X, Download } from 'lucide-react'
import { api } from '../services/api'
import { payForBooking } from '../services/payments'
import { useAuth } from '../context/AuthContext'

const payStyle = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-blue-100 text-blue-700',
  due: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-500',
}
const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

export default function MyInvoices() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('mock')
  const [payFor, setPayFor] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [realInvoices, setRealInvoices] = useState({}) // bookingId -> invoice
  const [downloading, setDownloading] = useState(null)

  const load = () => api.getMyInvoices().then((d) => setInvoices(Array.isArray(d) ? d : [])).catch(() => setInvoices([])).finally(() => setLoading(false))
  useEffect(() => {
    load()
    api.getPaymentConfig().then((c) => setMode(c.mode)).catch(() => {})
    api.getInvoices().then((d) => {
      const map = {}
      if (Array.isArray(d)) d.forEach((inv) => { map[inv.booking_id] = inv })
      setRealInvoices(map)
    }).catch(() => {})
  }, [])

  const handleDownload = async (inv) => {
    setDownloading(inv.id)
    try { await api.downloadInvoicePdf(inv.id, inv.invoice_number) }
    catch { alert('Could not download PDF') }
    finally { setDownloading(null) }
  }

  const totalDue = invoices.reduce((s, i) => s + (i.due_amount || 0), 0)

  const openPay = (inv) => { setPayFor(inv); setPayAmount(String(inv.due_amount)); setError('') }

  const submitPay = async (e) => {
    e?.preventDefault()
    setProcessing(true)
    setError('')
    try {
      const amt = parseFloat(payAmount)
      await payForBooking({ bookingId: payFor.booking_id, amount: amt, user })
      setPayFor(null)
      load()
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Invoices</h1>
          <p className="text-gray-500 mt-1">Billing and payments for your stays</p>
        </div>
        {totalDue > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg text-sm">
            <span className="text-gray-600">Outstanding: </span>
            <span className="font-bold text-yellow-800">{money(totalDue)}</span>
          </div>
        )}
      </div>

      {mode === 'mock' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-2 rounded-lg">
          Payments are in <strong>test mode</strong> — clicking Pay completes instantly without a real charge.
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">No invoices yet</h2>
          <p className="text-gray-500 mt-2">Invoices are generated from your bookings.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Paid</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.invoice_number} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> {inv.invoice_number}</td>
                  <td className="px-4 py-3 text-gray-700">{inv.room_type} <span className="text-gray-400">· {inv.nights}n</span></td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{money(inv.amount)}</td>
                  <td className="px-4 py-3 text-gray-600">{money(inv.paid_amount)}</td>
                  <td className="px-4 py-3 text-gray-600">{money(inv.due_amount)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${payStyle[inv.payment_status] || 'bg-gray-100 text-gray-600'}`}>{inv.payment_status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {realInvoices[inv.booking_id] && (
                        <button
                          onClick={() => handleDownload(realInvoices[inv.booking_id])}
                          disabled={downloading === realInvoices[inv.booking_id].id}
                          className="inline-flex items-center gap-1 px-2 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs"
                          title="Download GST Invoice PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloading === realInvoices[inv.booking_id].id ? '…' : 'PDF'}
                        </button>
                      )}
                      {inv.due_amount > 0 && inv.payment_status !== 'cancelled' ? (
                        <button onClick={() => openPay(inv)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium">
                          <CreditCard className="w-3.5 h-3.5" /> Pay Now
                        </button>
                      ) : inv.payment_status === 'paid' ? (
                        <span className="text-xs text-green-600 font-medium">✓ Settled</span>
                      ) : <span className="text-gray-300">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pay modal */}
      {payFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setPayFor(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Pay {payFor.invoice_number}</h2>
            <p className="text-sm text-gray-500 mb-4">{payFor.room_type} · Outstanding {money(payFor.due_amount)}</p>
            <form onSubmit={submitPay} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to pay (₹)</label>
                <input type="number" min="1" max={payFor.due_amount} step="0.01" value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setPayAmount(String(payFor.due_amount))} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">Full ({money(payFor.due_amount)})</button>
                  <button type="button" onClick={() => setPayAmount(String(Math.round(payFor.due_amount / 2)))} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">Half</button>
                </div>
              </div>
              {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
              <button type="submit" disabled={processing} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50">
                <CreditCard className="w-4 h-4" /> {processing ? 'Processing...' : `Pay ${money(parseFloat(payAmount) || 0)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 flex items-center gap-1">
        <CreditCard className="w-3.5 h-3.5" /> Secured by Razorpay{mode === 'mock' ? ' (test mode)' : ''}. Detailed GST invoices are coming soon.
      </p>
    </div>
  )
}
