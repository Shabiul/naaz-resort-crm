import { useState, useEffect } from 'react'
import { MessageSquare, Plus, CheckCircle, Filter, XCircle } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['housekeeping', 'maintenance', 'restaurant', 'spa', 'complaint', 'booking', 'general', 'emergency']
const PRIORITIES = ['low', 'medium', 'high', 'critical']
const STATUSES = ['open', 'assigned', 'in_progress', 'completed', 'closed']
const SOURCES = ['admin', 'customer', 'voice_agent', 'whatsapp']
const ROLES = ['admin', 'staff', 'housekeeping', 'maintenance', 'restaurant', 'spa', 'rooms']

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

const sourceStyle = {
  admin: 'bg-purple-100 text-purple-700',
  customer: 'bg-cyan-100 text-cyan-700',
  voice_agent: 'bg-pink-100 text-pink-700',
  whatsapp: 'bg-green-100 text-green-700',
}

export default function ServiceRequests() {
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ category: '', priority: '', status: '', source: '' })
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [assignRole, setAssignRole] = useState('')
  const [form, setForm] = useState({ title: '', description: '', room_number: '', category: 'general', priority: 'medium', source: 'admin' })
  const { user } = useAuth()

  const isAdmin = user?.role === 'admin'
  const isStaff = user?.role === 'staff' || isAdmin
  const isCustomer = user?.role === 'customer'

  const load = () => api.getServiceRequests(filters).then(setRequests).catch(() => setRequests([]))
  useEffect(() => { load() }, [filters])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.createServiceRequest(form)
    setShowForm(false)
    setForm({ title: '', description: '', room_number: '', category: 'general', priority: 'medium', source: 'admin' })
    load()
  }

  const handleUpdateStatus = async (request) => {
    await api.updateRequestStatus(request.id, statusUpdate)
    setSelectedRequest(null)
    setStatusUpdate('')
    load()
  }

  const handleAssign = async (request) => {
    await api.assignServiceRequest(request.id, assignRole)
    setSelectedRequest(null)
    setAssignRole('')
    load()
  }

  const handleDelete = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      await api.deleteServiceRequest(requestId)
      load()
    }
  }

  const open = requests.filter(r => r.status === 'open').length
  const inProgress = requests.filter(r => r.status === 'in_progress').length
  const completed = requests.filter(r => r.status === 'completed' || r.status === 'closed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-500 mt-1">Manage all guest and staff service requests</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filters
          </button>
          {(isAdmin || isStaff || user?.role === 'rooms') && (
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              <Plus className="w-4 h-4" /> New Request
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-red-500" /></div>
          <div>
            <p className="text-sm text-gray-500">Open</p>
            <p className="text-xl font-bold text-gray-900">{open}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-blue-500" /></div>
          <div>
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-xl font-bold text-gray-900">{inProgress}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-500" /></div>
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-xl font-bold text-gray-900">{completed}</p>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="">All</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="">All</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="">All</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select value={filters.source} onChange={e => setFilters({ ...filters, source: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="">All</option>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFilters({ category: '', priority: '', status: '', source: '' })} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Reset</button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">New Service Request</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  {SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</option>)}
                </select>
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Submit</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No service requests</h3>
            <p>Create your first request above</p>
          </div>
        ) : requests.map(req => (
          <div key={req.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{req.request_number}</span>
                  <span className="text-lg font-medium text-gray-800">{req.title}</span>
                  {req.room_number && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Room {req.room_number}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(priorityStyle[req.priority] || priorityStyle.medium).badge}`}>{(priorityStyle[req.priority] || priorityStyle.medium).label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[req.status] || statusStyle.open}`}>{req.status.replace('_', ' ').charAt(0).toUpperCase() + req.status.replace('_', ' ').slice(1)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceStyle[req.source] || sourceStyle.admin}`}>{req.source.replace('_', ' ').charAt(0).toUpperCase() + req.source.replace('_', ' ').slice(1)}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{req.category}</span>
                  {req.assigned_role && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Assigned: {req.assigned_role}</span>}
                </div>
                <p className="text-sm text-gray-700 mb-2">{req.description}</p>
                <p className="text-xs text-gray-500">Created: {new Date(req.created_at).toLocaleString()}</p>
                {req.resolved_at && <p className="text-xs text-green-700 mt-1">Resolved: {new Date(req.resolved_at).toLocaleString()}</p>}
              </div>
              <div className="ml-4 flex flex-col gap-2">
                {selectedRequest?.id === req.id ? (
                  <div className="space-y-2">
                    {!isCustomer && (
                      <div className="flex gap-2">
                        <select value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)} className="px-2 py-1 text-xs border border-gray-300 rounded">
                          <option value="">Change Status</option>
                          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</option>)}
                        </select>
                        <button onClick={() => handleUpdateStatus(req)} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100">Update</button>
                      </div>
                    )}
                    {isAdmin && (
                      <div className="flex gap-2">
                        <select value={assignRole} onChange={e => setAssignRole(e.target.value)} className="px-2 py-1 text-xs border border-gray-300 rounded">
                          <option value="">Assign To</option>
                          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                        <button onClick={() => handleAssign(req)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">Assign</button>
                      </div>
                    )}
                    <button onClick={() => setSelectedRequest(null)} className="text-xs px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedRequest(req)} className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100">Actions</button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(req.id)} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
