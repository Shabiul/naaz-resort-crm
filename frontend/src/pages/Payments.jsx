import { useState, useEffect } from 'react'
import { CreditCard, RotateCcw, IndianRupee } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STATUSES = ['pending', 'paid', 'failed', 'refunded']
const statusStyle = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-200 text-gray-600',
}
const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

export default function Payments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [mode, setMode] = useState('mock')

  const load = () => api.getPayments(filter ? { status: filter } : {}).then((d) => setPayments(Array.isArray(d) ? d : [])).catch(() => setPayments([])).finally(() => setLoading(false))
  useEffect(() => { load() }, [filter])
  useEffect(() => { api.getPaymentConfig().then((c) => setMode(c.mode)).catch(() => {}) }, [])

  const refund = async (p) => {
    if (!window.confirm(`Refund ${money(p.amount)} for booking #${p.booking_id}?`)) return
    await api.refundPayment(p.id)
    load()
  }

  const totals = payments.reduce((acc, p) => {
    if (p.payment_status === 'paid') acc.collected += p.amount || 0
    if (p.payment_status === 'refunded') acc.refunded += p.amount || 0
    return acc
  }, { collected: 0, refunded: 0 })

  const isAdmin = user?.role === 'admin'

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="text-gray-500 mt-1">All booking transactions</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${mode === 'live' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          Razorpay: {mode === 'live' ? 'Live' : 'Test mode'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center"><IndianRupee className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-gray-500">Collected</p><p className="text-2xl font-bold text-gray-900">{money(totals.collected)}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"><RotateCcw className="w-6 h-6 text-gray-500" /></div>
          <div><p className="text-sm text-gray-500">Refunded</p><p className="text-2xl font-bold text-gray-900">{money(totals.refunded)}</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center"><CreditCard className="w-6 h-6 text-blue-600" /></div>
          <div><p className="text-sm text-gray-500">Transactions</p><p className="text-2xl font-bold text-gray-900">{payments.length}</p></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter('')} className={`text-xs px-3 py-1.5 rounded-full font-medium ${!filter ? 'bg-resort-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${filter === s ? 'bg-resort-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-resort-500" /></div>
      ) : payments.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No payments{filter ? ` with status "${filter}"` : ''} yet</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Transaction</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">#{p.booking_id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{money(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{p.payment_type}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{p.transaction_id || p.order_id || '—'}{p.is_mock && <span className="ml-1 text-blue-400">(test)</span>}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyle[p.payment_status] || 'bg-gray-100 text-gray-600'}`}>{p.payment_status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && p.payment_status === 'paid' ? (
                      <button onClick={() => refund(p)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium">
                        <RotateCcw className="w-3.5 h-3.5" /> Refund
                      </button>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
