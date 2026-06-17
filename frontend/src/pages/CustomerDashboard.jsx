import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CalendarCheck, MessageCircle, CreditCard, User, CalendarClock, IndianRupee } from 'lucide-react'
import { api } from '../services/api'

const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)

  useEffect(() => { api.getMySummary().then(setSummary).catch(() => setSummary(null)) }, [])

  const stats = [
    { title: 'Active Bookings', value: summary?.active_bookings ?? '—', icon: CalendarCheck, color: 'bg-blue-100 text-blue-600' },
    { title: 'Upcoming Stays', value: summary?.upcoming_bookings ?? '—', icon: CalendarClock, color: 'bg-indigo-100 text-indigo-600' },
    { title: 'Open Requests', value: summary?.open_requests ?? '—', icon: MessageCircle, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Amount Due', value: summary ? money(summary.amount_due) : '—', icon: IndianRupee, color: 'bg-green-100 text-green-600' },
  ]

  const actions = [
    { to: '/my-bookings', label: 'View My Bookings', icon: CalendarCheck },
    { to: '/my-requests', label: 'My Requests', icon: MessageCircle },
    { to: '/my-invoices', label: 'My Invoices', icon: CreditCard },
    { to: '/my-profile', label: 'My Profile', icon: User },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name || user?.username}!</h1>
        <p className="text-gray-500 mt-1">Manage your bookings, requests, and account</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((a) => (
            <Link key={a.to} to={a.to}
              className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <a.icon className="w-7 h-7 text-gray-400 group-hover:text-green-600" />
              <span className="font-medium text-gray-700 group-hover:text-green-700 text-sm text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
