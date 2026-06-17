import { useState, useEffect } from 'react'
import { Receipt, Download, RefreshCw, Search } from 'lucide-react'
import { api } from '../services/api'

const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`
const statusStyle = {
  issued: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [genBookingId, setGenBookingId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [downloading, setDownloading] = useState(null)

  const load = () =>
    api.getInvoices()
      .then((d) => setInvoices(Array.isArray(d) ? d : []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleGenerate = async (e) => {
    e?.preventDefault()
    const id = parseInt(genBookingId)
    if (!id) return
    setGenerating(true)
    setGenError('')
    try {
      await api.generateInvoice(id)
      setGenBookingId('')
      load()
    } catch {
      setGenError('Booking not found or error generating invoice.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async (inv) => {
    setDownloading(inv.id)
    try {
      await api.downloadInvoicePdf(inv.id, inv.invoice_number)
    } catch {
      alert('PDF generation failed')
    } finally {
      setDownloading(null)
    }
  }

  const totals = invoices.reduce((acc, inv) => {
    acc.base += inv.base_amount || 0
    acc.gst += inv.total_gst || 0
    acc.total += inv.total_amount || 0
    return acc
  }, { base: 0, gst: 0, total: 0 })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GST Invoices</h2>
          <p className="text-gray-500 mt-1">Generate and download tax invoices</p>
        </div>
        <form onSubmit={handleGenerate} className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={genBookingId}
            onChange={(e) => setGenBookingId(e.target.value)}
            placeholder="Booking ID"
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-resort-500 outline-none"
          />
          <button
            type="submit"
            disabled={generating || !genBookingId}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating…' : 'Generate Invoice'}
          </button>
          {genError && <span className="text-xs text-red-600">{genError}</span>}
        </form>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500">Taxable Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{money(totals.base)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total GST Collected</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{money(totals.gst)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Invoice Total (incl. GST)</p>
          <p className="text-2xl font-bold text-resort-700 mt-1">{money(totals.total)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-resort-500" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="card text-center py-12">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No invoices yet. Enter a Booking ID above to generate one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice #</th>
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Base</th>
                <th className="px-4 py-3 font-medium">CGST</th>
                <th className="px-4 py-3 font-medium">SGST</th>
                <th className="px-4 py-3 font-medium">IGST</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 font-medium">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-gray-600">#{inv.booking_id}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{inv.guest_name}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.room_type} <span className="text-gray-400">· {inv.nights}n</span></td>
                  <td className="px-4 py-3 text-gray-700">{money(inv.base_amount)}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.cgst_rate > 0 ? money(inv.cgst_amount) : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.sgst_rate > 0 ? money(inv.sgst_amount) : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.igst_rate > 0 ? money(inv.igst_amount) : '—'}</td>
                  <td className="px-4 py-3 font-semibold text-resort-700">{money(inv.total_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusStyle[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDownload(inv)}
                      disabled={downloading === inv.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-resort-600 hover:bg-resort-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {downloading === inv.id ? '…' : 'PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        GST @ {invoices[0]?.cgst_rate > 0
          ? `${invoices[0].cgst_rate}% CGST + ${invoices[0].sgst_rate}% SGST`
          : invoices[0]?.igst_rate > 0
          ? `${invoices[0].igst_rate}% IGST`
          : '12% (6% CGST + 6% SGST)'}
        · Amounts are in INR
      </p>
    </div>
  )
}
