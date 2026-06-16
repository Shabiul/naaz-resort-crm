import { useState, useEffect } from 'react'
import { CalendarCheck, Users, Phone, DollarSign, Sparkles, UtensilsCrossed, MessageCircle, AlertTriangle, CheckSquare, Mountain, PartyPopper, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../services/api'

const statCards = [
  { key: 'total_bookings', label: 'Total Bookings', icon: CalendarCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'confirmed_bookings', label: 'Confirmed', icon: CalendarCheck, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'checked_in', label: 'Checked In', icon: CalendarCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'total_revenue', label: 'Total Revenue', icon: DollarSign, color: 'text-resort-600', bg: 'bg-resort-50', format: 'currency' },
  { key: 'total_leads', label: 'Guest Leads', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'total_calls', label: 'Voice Calls', icon: Phone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'total_spa', label: 'Spa Bookings', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50' },
  { key: 'total_restaurant', label: 'Restaurant', icon: UtensilsCrossed, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'total_activities', label: 'Activities', icon: Mountain, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'total_events', label: 'Events', icon: PartyPopper, color: 'text-violet-600', bg: 'bg-violet-50' },
  { key: 'open_complaints', label: 'Open Complaints', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { key: 'pending_housekeeping', label: 'HK Pending', icon: CheckSquare, color: 'text-yellow-600', bg: 'bg-yellow-50' },
]

const chartData = [
  { name: 'Mon', bookings: 4, leads: 2 },
  { name: 'Tue', bookings: 3, leads: 5 },
  { name: 'Wed', bookings: 6, leads: 3 },
  { name: 'Thu', bookings: 2, leads: 4 },
  { name: 'Fri', bookings: 5, leads: 6 },
  { name: 'Sat', bookings: 8, leads: 7 },
  { name: 'Sun', bookings: 7, leads: 4 },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-resort-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome to Naaz Resort management overview</p>
      </div>

      {/* Occupancy Banner */}
      {stats && (
        <div className="card mb-6 flex items-center justify-between bg-gradient-to-r from-resort-600 to-resort-800 text-white">
          <div>
            <p className="text-resort-200 text-sm">Today's Occupancy Rate</p>
            <p className="text-4xl font-bold">{stats.occupancy_rate || 0}%</p>
          </div>
          <TrendingUp className="w-12 h-12 text-resort-300" />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? (card.format === 'currency' ? `$${(stats[card.key] || 0).toLocaleString()}` : stats[card.key] || 0) : '—'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Activity</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#d4882e" radius={4} />
              <Bar dataKey="leads" fill="#f2d7b0" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
