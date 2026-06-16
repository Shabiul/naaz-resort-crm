import { useState, useEffect } from 'react'
import { PartyPopper, Plus } from 'lucide-react'
import { api } from '../services/api'

const EVENT_TYPES = ['wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'other']
const statusStyle = {
  inquiry: 'bg-blue-100 text-blue-700',
  proposal_sent: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ guest_name: '', phone: '', email: '', event_type: 'wedding', event_date: '', guests_count: 50, budget: '', requirements: '', notes: '' })

  const load = () => api.getEvents().then(setEvents).catch(() => setEvents([]))
  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.createEvent(form)
    setShowForm(false)
    setForm({ guest_name: '', phone: '', email: '', event_type: 'wedding', event_date: '', guests_count: 50, budget: '', requirements: '', notes: '' })
    load()
  }

  const updateStatus = async (id, status) => {
    await api.updateEventStatus(id, status)
    load()
  }

  const eventIcon = { wedding: '💍', corporate: '🏢', birthday: '🎂', anniversary: '💑', conference: '🎤', other: '🎉' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events & Weddings</h2>
          <p className="text-gray-500 mt-1">Manage event inquiries and bookings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Inquiry
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {EVENT_TYPES.slice(0, 4).map(type => (
          <div key={type} className="card text-center">
            <div className="text-2xl mb-1">{eventIcon[type]}</div>
            <p className="text-sm font-medium text-gray-700 capitalize">{type}</p>
            <p className="text-lg font-bold text-resort-700">{events.filter(e => e.event_type === type).length}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">New Event Inquiry</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label><input value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} className="input-field">
                {EVENT_TYPES.map(t => <option key={t} className="capitalize">{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label><input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Expected Guests</label><input type="number" min="1" value={form.guests_count} onChange={e => setForm({...form, guests_count: parseInt(e.target.value)})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Budget</label><input value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="input-field" placeholder="e.g. ₹5,00,000" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label><textarea rows={2} value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} className="input-field" placeholder="Decor, catering, A/V, seating arrangement..." /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save Inquiry</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No event inquiries yet</div>
        ) : events.map(ev => (
          <div key={ev.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{eventIcon[ev.event_type] || '🎉'}</span>
                  <span className="font-semibold text-gray-900">{ev.guest_name}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-700 capitalize">{ev.event_type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[ev.status] || 'bg-gray-100 text-gray-600'}`}>{ev.status?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{ev.phone}</span>
                  {ev.event_date && <span>📅 {ev.event_date}</span>}
                  <span>👥 {ev.guests_count} guests</span>
                  {ev.budget && <span>💰 {ev.budget}</span>}
                </div>
                {ev.requirements && <p className="text-xs text-gray-500 mt-1">{ev.requirements}</p>}
              </div>
              {ev.status === 'inquiry' && (
                <div className="ml-4 flex gap-2">
                  <button onClick={() => updateStatus(ev.id, 'proposal_sent')} className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">Send Proposal</button>
                  <button onClick={() => updateStatus(ev.id, 'confirmed')} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Confirm</button>
                </div>
              )}
              {ev.status === 'proposal_sent' && (
                <button onClick={() => updateStatus(ev.id, 'confirmed')} className="ml-4 text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Confirm Event</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
