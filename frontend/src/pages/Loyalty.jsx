import { useState, useEffect } from 'react'
import { Star, Plus, Crown } from 'lucide-react'
import { api } from '../services/api'

const tierStyle = {
  silver: { badge: 'bg-gray-100 text-gray-700 border border-gray-300', icon: '🥈', label: 'Silver', min: 0, max: 1999 },
  gold: { badge: 'bg-yellow-100 text-yellow-700 border border-yellow-300', icon: '🥇', label: 'Gold', min: 2000, max: 4999 },
  platinum: { badge: 'bg-purple-100 text-purple-700 border border-purple-300', icon: '💎', label: 'Platinum', min: 5000, max: null },
}

export default function Loyalty() {
  const [guests, setGuests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ guest_name: '', phone: '', email: '', points: 0 })

  const load = () => api.getLoyalty().then(setGuests).catch(() => setGuests([]))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.createLoyalty(form)
    setShowForm(false)
    setForm({ guest_name: '', phone: '', email: '', points: 0 })
    load()
  }

  const platinum = guests.filter(g => g.tier === 'platinum').length
  const gold = guests.filter(g => g.tier === 'gold').length
  const silver = guests.filter(g => g.tier === 'silver').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loyalty Program</h2>
          <p className="text-gray-500 mt-1">Silver · Gold · Platinum tiers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Platinum', 'platinum', platinum], ['Gold', 'gold', gold], ['Silver', 'silver', silver]].map(([label, tier, count]) => (
          <div key={tier} className="card text-center">
            <div className="text-3xl mb-2">{tierStyle[tier].icon}</div>
            <p className="font-bold text-gray-900 text-xl">{count}</p>
            <p className="text-sm text-gray-500">{label} Members</p>
            <p className="text-xs text-gray-400 mt-1">{tierStyle[tier].min.toLocaleString()}+ pts</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Add Loyalty Member</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label><input value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Starting Points</label><input type="number" min="0" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value)})} className="input-field" /></div>
          </div>
          <div className="p-3 bg-resort-50 rounded-lg text-sm text-gray-600">
            Tier: <strong>{form.points >= 5000 ? '💎 Platinum' : form.points >= 2000 ? '🥇 Gold' : '🥈 Silver'}</strong>
            <span className="ml-4 text-gray-400">Silver: 0–1,999 · Gold: 2,000–4,999 · Platinum: 5,000+</span>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Add Member</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-500">Guest</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Tier</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Points</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Total Stays</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Total Spent</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Last Stay</th>
          </tr></thead>
          <tbody>
            {guests.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No loyalty members yet</td></tr>
            ) : guests.map(g => (
              <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3"><p className="font-medium text-gray-900">{g.guest_name}</p><p className="text-xs text-gray-400">{g.phone}</p></td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${tierStyle[g.tier]?.badge}`}>{tierStyle[g.tier]?.icon} {g.tier}</span></td>
                <td className="px-4 py-3 font-bold text-resort-700">{g.points.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600">{g.total_stays}</td>
                <td className="px-4 py-3 text-gray-600">₹{(g.total_spent || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{g.last_stay || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
