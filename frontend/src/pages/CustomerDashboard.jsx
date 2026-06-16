import { useAuth } from '../context/AuthContext'
import { CalendarCheck, CreditCard, MessageCircle } from 'lucide-react'

export default function CustomerDashboard() {
  const { user } = useAuth()

  const stats = [
    { title: 'Current Bookings', value: 1, icon: CalendarCheck, color: 'bg-blue-100 text-blue-600' },
    { title: 'Pending Requests', value: 0, icon: MessageCircle, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Total Transactions', value: 2, icon: CreditCard, color: 'bg-green-100 text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name || user?.username}!</h1>
        <p className="text-gray-500 mt-1">Manage your bookings and requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/my-bookings'}
            className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <CalendarCheck className="w-6 h-6 text-gray-500 hover:text-blue-600" />
            <span className="font-medium text-gray-700 hover:text-blue-700">View My Bookings</span>
          </button>
          <button
            onClick={() => window.location.href = '/my-requests'}
            className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <MessageCircle className="w-6 h-6 text-gray-500 hover:text-blue-600" />
            <span className="font-medium text-gray-700 hover:text-blue-700">My Requests</span>
          </button>
        </div>
      </div>
    </div>
  )
}
