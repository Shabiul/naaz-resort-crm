import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, Users, Phone, Building2,
  Sparkles, UtensilsCrossed, PlusCircle, MessageCircle,
  CheckSquare, Mountain, AlertTriangle, Star, PartyPopper,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/bookings/new', label: 'New Booking', icon: PlusCircle },
  { to: '/leads', label: 'Guest Leads', icon: Users },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/calls', label: 'Call Logs', icon: Phone },
  { to: '/rooms', label: 'Rooms', icon: Building2 },
  { to: '/spa', label: 'Spa', icon: Sparkles },
  { to: '/restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { to: '/activities', label: 'Activities', icon: Mountain },
  { to: '/housekeeping', label: 'Housekeeping', icon: CheckSquare },
  { to: '/complaints', label: 'Complaints', icon: AlertTriangle },
  { to: '/loyalty', label: 'Loyalty', icon: Star },
  { to: '/events', label: 'Events', icon: PartyPopper },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-resort-700 font-serif">Naaz Resort</h1>
        <p className="text-xs text-gray-500 mt-0.5">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-resort-50 text-resort-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">Naaz Resort Voice Agent</p>
        <p className="text-xs text-gray-400">v2.0.0</p>
      </div>
    </aside>
  )
}
