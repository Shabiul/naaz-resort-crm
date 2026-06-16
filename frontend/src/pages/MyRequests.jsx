import { useState, useEffect } from 'react'
import { MessageCircle, Plus } from 'lucide-react'
import { api } from '../services/api'

const CATEGORIES = ['housekeeping', 'maintenance', 'restaurant', 'spa', 'complaint', 'booking', 'general', 'emergency']
const priorityStyle = {
  low: { badge: 'bg-gray-100 text-gray-700', label: 'Low' },
  medium: { badge: 'bg-blue-100 text-blue-700', label: 'Medium' },
  high: { badge: 'bg-orange-100 text-orange-700', label: 'High' },
  critical: { badge: 'bg-red-100 text-red-700', label: 'Critical' },
}
const statusStyle = {
  open: 'bg-red-100 text-red-700',
  assigned: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

export default function MyRequests() {
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', room_number: '', category: 'general', priority: 'medium' })

  const load = () => api.getServiceRequests().then(setRequests).catch(() => setRequests([]))
  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.createServiceRequest({ ...formData, source: 'customer' })
    setShowForm(false)
    setFormData({ title: '', description: '', room_number: '', category: 'general', priority: 'medium' })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 mt-1">View and submit service requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit a New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700">No requests yet</h2>
            <p className="text-gray-500 mt-2">Submit your first request above</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{request.request_number}</span>
                    <span className="text-lg font-medium text-gray-800">{request.title}</span>
                    {request.room_number && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Room {request.room_number}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(priorityStyle[request.priority] || priorityStyle.medium).badge}`}>{(priorityStyle[request.priority] || priorityStyle.medium).label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[request.status] || statusStyle.open}`}>{request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{request.category}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                  <p className="text-xs text-gray-500">Created: {new Date(request.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
