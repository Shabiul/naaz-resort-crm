import { useState, useEffect } from 'react'
import { Search, Phone, Mail } from 'lucide-react'
import { api } from '../services/api'

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getLeads()
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search)
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Guest Leads</h2>
        <p className="text-gray-500 mt-1">Captured leads from voice calls and website</p>
      </div>

      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
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
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Preference</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No leads found</td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{l.name}</td>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1 text-gray-600"><Phone className="w-3 h-3" /> {l.phone}</p>
                        {l.email && <p className="flex items-center gap-1 text-gray-400 text-xs mt-0.5"><Mail className="w-3 h-3" /> {l.email}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{l.preference || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-gray-100 text-gray-700">{l.source}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}
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
