import { useState, useEffect } from 'react'
import { Mountain, Plus, Users } from 'lucide-react'
import { api } from '../services/api'

const ACTIVITIES = [
  { name: 'Trekking', price: 800, icon: '🥾' },
  { name: 'ATV Ride', price: 1500, icon: '🏍️' },
  { name: 'Kayaking', price: 1200, icon: '🛶' },
  { name: 'Cycling', price: 600, icon: '🚴' },
  { name: 'Safari', price: 2500, icon: '🦁' },
  { name: 'Bonfire', price: 500, icon: '🔥' },
]

export default function Activities() {
  const [bookings, setBookings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ guest_name: '', phone: '', email: '', activity: 'Trekking', date: '', time: '09:00', participants: 1, notes: '' })

  const load = () => api.getActivities().then(setBookings).catch(() => setBookings([]))
  useEffect(load, [])

  const selectedActivity = ACTIVITIES.find(a => a.name === form.activity)
  const total = (selectedActivity?.price || 0) * form.participants

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.createActivity({ ...form, amount: total })
    setShowForm(false)
    setForm({ guest_name: '', phone: '', email: '', activity: 'Trekking', date: '', time: '09:00', participants: 1, notes: '' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
          <p className="text-gray-500 mt-1">Adventure & recreational bookings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Book Activity
        </button>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {ACTIVITIES.map(a => (
          <div key={a.name} className="card text-center cursor-pointer hover:border-resort-300 border-2 border-transparent" onClick={() => { setForm({...form, activity: a.name}); setShowForm(true) }}>
            <div className="text-3xl mb-2">{a.icon}</div>
            <p className="font-semibold text-gray-900">{a.name}</p>
            <p className="text-sm text-resort-600 font-medium">₹{a.price.toLocaleString()}/person</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">New Activity Booking</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
              <input value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
              <select value={form.activity} onChange={e => setForm({...form, activity: e.target.value})} className="input-field">
                {ACTIVITIES.map(a => <option key={a.name}>{a.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
              <input type="number" min="1" value={form.participants} onChange={e => setForm({...form, participants: parseInt(e.target.value)})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="input-field" /></div>
          </div>
          <div className="p-3 bg-resort-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount: <span className="font-bold text-resort-700 text-lg">₹{total.toLocaleString()}</span></p>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Confirm Booking</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-500">Guest</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Activity</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Date & Time</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Participants</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Amount</th>
          </tr></thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No activity bookings yet</td></tr>
            ) : bookings.map(b => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3"><p className="font-medium text-gray-900">{b.guest_name}</p><p className="text-xs text-gray-400">{b.phone}</p></td>
                <td className="px-4 py-3">{ACTIVITIES.find(a => a.name === b.activity)?.icon ?? '🎯'} {b.activity}</td>
                <td className="px-4 py-3 text-gray-600">{b.date} {b.time}</td>
                <td className="px-4 py-3"><span className="flex items-center gap-1"><Users className="w-3 h-3 text-gray-400" /> {b.participants}</span></td>
                <td className="px-4 py-3 font-medium text-resort-700">₹{b.amount?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
