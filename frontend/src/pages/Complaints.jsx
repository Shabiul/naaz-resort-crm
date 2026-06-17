import { useState, useEffect } from 'react'
import { AlertTriangle, Plus, CheckCircle } from 'lucide-react'
import { api } from '../services/api'

const CATEGORIES = ['general', 'room', 'food', 'staff', 'facilities', 'noise', 'billing']
const priorityStyle = {
  normal: { badge: 'bg-blue-100 text-blue-700', label: 'Normal' },
  high: { badge: 'bg-orange-100 text-orange-700', label: 'High' },
  critical: { badge: 'bg-red-100 text-red-700', label: 'Critical' },
}
const statusStyle = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
}

export default function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [resolveId, setResolveId] = useState(null)
  const [resolution, setResolution] = useState('')
  const [form, setForm] = useState({ guest_name: '', phone: '', room_number: '', category: 'general', description: '', priority: 'normal', assigned_to: '' })

  const load = () => api.getComplaints().then(setComplaints).catch(() => setComplaints([]))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.createComplaint(form)
    setShowForm(false)
    setForm({ guest_name: '', phone: '', room_number: '', category: 'general', description: '', priority: 'normal', assigned_to: '' })
    load()
  }

  const handleResolve = async (id) => {
    await api.resolveComplaint(id, resolution)
    setResolveId(null)
    setResolution('')
    load()
  }

  const open = complaints.filter(c => c.status === 'open').length
  const critical = complaints.filter(c => c.priority === 'critical').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Complaints & Escalation</h2>
          <p className="text-gray-500 mt-1">Track and resolve guest complaints</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Complaint
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-500" /></div><div><p className="text-sm text-gray-500">Open</p><p className="text-xl font-bold text-gray-900">{open}</p></div></div>
        <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-orange-500" /></div><div><p className="text-sm text-gray-500">Critical</p><p className="text-xl font-bold text-gray-900">{critical}</p></div></div>
        <div className="card flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-500" /></div><div><p className="text-sm text-gray-500">Resolved</p><p className="text-xl font-bold text-gray-900">{complaints.filter(c => c.status === 'resolved').length}</p></div></div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">New Complaint</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label><input value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label><input value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                <option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label><input value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} className="input-field" placeholder="Department or staff" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" required /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Submit</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No complaints logged</div>
        ) : complaints.map(c => (
          <div key={c.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{c.guest_name}</span>
                  {c.room_number && <span className="text-xs text-gray-500">Room {c.room_number}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(priorityStyle[c.priority] || priorityStyle.normal).badge}`}>{(priorityStyle[c.priority] || priorityStyle.normal).label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[c.status] || statusStyle.open}`}>{c.status}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.category}</span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{c.description}</p>
                {c.assigned_to && <p className="text-xs text-gray-500">Assigned: {c.assigned_to}</p>}
                {c.resolution && <p className="text-xs text-green-700 mt-1">Resolution: {c.resolution}</p>}
              </div>
              {c.status === 'open' && (
                <div className="ml-4">
                  {resolveId === c.id ? (
                    <div className="flex gap-2">
                      <input value={resolution} onChange={e => setResolution(e.target.value)} className="input-field text-xs w-40" placeholder="Resolution notes" />
                      <button onClick={() => handleResolve(c.id)} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Confirm</button>
                      <button onClick={() => setResolveId(null)} className="text-xs px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setResolveId(c.id)} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
