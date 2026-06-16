import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, Users, Phone, Building2,
  Sparkles, UtensilsCrossed, PlusCircle, MessageCircle,
  CheckSquare, Mountain, AlertTriangle, Star, PartyPopper, LogOut, User, UserCog,
  Wrench, Home, History
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const roleNavItems = {
  admin: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/users', label: 'Users', icon: UserCog },
    { to: '/users/history', label: 'User History', icon: History },
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
  ],
  staff: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/bookings/new', label: 'New Booking', icon: PlusCircle },
    { to: '/leads', label: 'Guest Leads', icon: Users },
    { to: '/chat', label: 'Chat', icon: MessageCircle },
    { to: '/rooms', label: 'Rooms', icon: Building2 },
    { to: '/spa', label: 'Spa', icon: Sparkles },
    { to: '/restaurant', label: 'Restaurant', icon: UtensilsCrossed },
    { to: '/activities', label: 'Activities', icon: Mountain },
  ],
  housekeeping: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/housekeeping', label: 'Housekeeping Tasks', icon: CheckSquare },
  ],
  spa: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/spa', label: 'Spa Bookings', icon: Sparkles },
  ],
  restaurant: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/restaurant', label: 'Restaurant Reservations', icon: UtensilsCrossed },
  ],
  rooms: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/rooms', label: 'Rooms', icon: Home },
    { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  ],
  maintenance: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/housekeeping', label: 'Maintenance Tasks', icon: Wrench },
  ],
  customer: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/my-bookings', label: 'My Bookings', icon: CalendarCheck },
    { to: '/my-requests', label: 'My Requests', icon: MessageCircle },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navItems = roleNavItems[user?.role] || roleNavItems.staff

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-xl font-bold text-resort-700 font-serif">Naaz Resort</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal` : 'Portal'}
        </p>
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

      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">Naaz Resort Voice Agent</p>
          <p className="text-xs text-gray-400">v2.0.0</p>
        </div>
      </div>
    </aside>
  )
}
