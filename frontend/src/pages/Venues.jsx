import { useState, useEffect } from 'react'
import { Building2, Plus, Users, IndianRupee, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../services/api'

const VENUE_TYPES = ['lawn', 'hall', 'banquet', 'poolside', 'outdoor']
const typeStyle = {
  lawn: 'bg-emerald-100 text-emerald-700',
  hall: 'bg-blue-100 text-blue-700',
  banquet: 'bg-purple-100 text-purple-700',
  poolside: 'bg-cyan-100 text-cyan-700',
  outdoor: 'bg-amber-100 text-amber-700',
}

const emptyForm = {
  name: '', venue_type: 'lawn', capacity_min: 0, capacity_max: 100,
  price_per_event: 0, description: '', amenities: '',
}

export default function Venues() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = () => api.getVenues().then((d) => setVenues(Array.isArray(d) ? d : [])).catch(() => setVenues([])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (v) => {
    setEditingId(v.id)
    setForm({
      name: v.name, venue_type: v.venue_type, capacity_min: v.capacity_min,
      capacity_max: v.capacity_max, price_per_event: v.price_per_event,
      description: v.description || '', amenities: (v.amenities || []).join(', '),
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      await api.updateVenue(editingId, form)
    } else {
      await api.createVenue(form)
    }
    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    load()
  }

  const toggleActive = async (v) => {
    await api.updateVenue(v.id, { is_active: !v.is_active })
    load()
  }

  const remove = async (v) => {
    if (!window.confirm(`Delete venue "${v.name}"? This cannot be undone.`)) return
    await api.deleteVenue(v.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Venues</h2>
          <p className="text-gray-500 mt-1">Manage event spaces, capacity, and pricing</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Venue
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Venue' : 'New Venue'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.venue_type} onChange={e => setForm({ ...form, venue_type: e.target.value })} className="input-field capitalize">
                {VENUE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Capacity</label><input type="number" min="0" value={form.capacity_min} onChange={e => setForm({ ...form, capacity_min: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label><input type="number" min="0" value={form.capacity_max} onChange={e => setForm({ ...form, capacity_max: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Price per Event (₹)</label><input type="number" min="0" value={form.price_per_event} onChange={e => setForm({ ...form, price_per_event: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma-separated)</label><input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} className="input-field" placeholder="Stage, Parking, Power Backup" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">{editingId ? 'Save Changes' : 'Create Venue'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-resort-500" /></div>
      ) : venues.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No venues yet. Add your first event space.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map(v => (
            <div key={v.id} className={`card ${!v.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-resort-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-resort-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{v.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${typeStyle[v.venue_type] || 'bg-gray-100 text-gray-600'}`}>{v.venue_type}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(v)} title="Edit" className="p-1.5 text-gray-400 hover:text-resort-600 hover:bg-resort-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(v)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {v.description && <p className="text-sm text-gray-500 mb-3">{v.description}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1"><Users className="w-4 h-4 text-gray-400" /> {v.capacity_min}–{v.capacity_max}</span>
                <span className="flex items-center gap-1 font-medium text-gray-800"><IndianRupee className="w-4 h-4 text-gray-400" />{v.price_per_event?.toLocaleString('en-IN')}</span>
              </div>
              {v.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {v.amenities.map((a, i) => <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{a}</span>)}
                </div>
              )}
              <button onClick={() => toggleActive(v)} className={`text-xs flex items-center gap-1 font-medium ${v.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                {v.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {v.is_active ? 'Active' : 'Inactive'} · click to toggle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
