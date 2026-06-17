import { useState, useEffect } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import { api } from '../services/api'

const spaServices = ['Swedish Massage', 'Deep Tissue Massage', 'Aromatherapy', 'Facial Treatment', 'Body Scrub', 'Hydrotherapy', 'Hot Stone Massage', 'Couples Massage']

export default function SpaReservations() {
  const [reservations, setReservations] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ guest_name: '', phone: '', email: '', service: 'Swedish Massage', date: '', time: '10:00', notes: '' })
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => api.getSpa().then(setReservations).catch(() => setReservations([]))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.bookSpa(form)
      setMessage('Spa session booked successfully!')
      setShowForm(false)
      setForm({ guest_name: '', phone: '', email: '', service: 'Swedish Massage', date: '', time: '10:00', notes: '' })
      load()
    } catch {
      setMessage('Failed to book spa session.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Spa & Wellness</h2>
          <p className="text-gray-500 mt-1">Spa session bookings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Book Session
        </button>
      </div>

      {message && <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label><input value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <select value={form.service} onChange={e => setForm({...form, service: e.target.value})} className="input-field">
                {spaServices.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="input-field" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2"><Sparkles className="w-4 h-4" />{submitting ? 'Booking...' : 'Book Session'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-500">Guest</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Service</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Date & Time</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Notes</th>
          </tr></thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">No spa bookings yet</td></tr>
            ) : reservations.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3"><p className="font-medium text-gray-900">{r.guest_name}</p><p className="text-xs text-gray-400">{r.phone}</p></td>
                <td className="px-4 py-3 text-gray-700">{r.service}</td>
                <td className="px-4 py-3 text-gray-600">{r.date} {r.time}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
