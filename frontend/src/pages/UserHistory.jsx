import { useState, useEffect } from 'react'
import { History } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function UserHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const data = await api.getUserHistory()
      setHistory(data)
    } catch (err) {
      console.error('Failed to fetch user history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A'
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate - startDate
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffMonths / 12)
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ${diffMonths % 12} month${diffMonths % 12 > 1 ? 's' : ''}`
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ${diffDays % 30} day${diffDays % 30 > 1 ? 's' : ''}`
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500 mt-2">Only admins can view user history</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User History</h1>
        <p className="text-gray-500 mt-1">Track user creation and deletion</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.full_name || entry.username}</div>
                    <div className="text-sm text-gray-500">@{entry.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      entry.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                      entry.role === 'housekeeping' ? 'bg-yellow-100 text-yellow-800' :
                      entry.role === 'spa' ? 'bg-pink-100 text-pink-800' :
                      entry.role === 'restaurant' ? 'bg-orange-100 text-orange-800' :
                      entry.role === 'rooms' ? 'bg-teal-100 text-teal-800' :
                      entry.role === 'maintenance' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {entry.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.action === 'created' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.action_by}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.action === 'deleted' ? calculateDuration(entry.started_at, entry.ended_at) : 'Active'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.action_at).toLocaleDateString()} {new Date(entry.action_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {history.length === 0 && (
          <div className="p-8 text-center text-gray-500">No user history available</div>
        )}
      </div>
    </div>
  )
}
