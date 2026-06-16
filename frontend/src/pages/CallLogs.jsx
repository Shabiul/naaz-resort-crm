import { useState, useEffect } from 'react'
import { Search, Phone, PhoneIncoming, PhoneOutgoing } from 'lucide-react'
import { api } from '../services/api'

export default function CallLogs() {
  const [calls, setCalls] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCallLogs()
      .then((data) => setCalls(Array.isArray(data) ? data : []))
      .catch(() => setCalls([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = calls.filter(
    (c) =>
      c.caller_number?.includes(search) ||
      c.caller_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Call Logs</h2>
        <p className="text-gray-500 mt-1">Incoming voice call history</p>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by number or caller name..."
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
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Caller</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Number</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Duration</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Summary</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No call logs found</td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.caller_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-gray-600">{c.caller_number}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          c.status === 'completed' ? 'bg-green-100 text-green-700' :
                          c.status === 'booking_confirmed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.duration ? `${c.duration}s` : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{c.summary || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : '—'}
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
