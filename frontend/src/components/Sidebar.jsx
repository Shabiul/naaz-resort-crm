import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, Users, Phone, Building2,
  Sparkles, UtensilsCrossed, PlusCircle, MessageCircle,
  CheckSquare, Mountain, AlertTriangle, Star, PartyPopper, LogOut, User, UserCog,
  Wrench, Home, History, FileText, MapPin, CreditCard, Receipt,
  ChevronLeft, ChevronRight,
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
    { to: '/service-requests', label: 'Service Requests', icon: FileText },
    { to: '/loyalty', label: 'Loyalty', icon: Star },
    { to: '/events', label: 'Events', icon: PartyPopper },
    { to: '/venues', label: 'Venues', icon: MapPin },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/invoices', label: 'GST Invoices', icon: Receipt },
  ],
  staff: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/bookings/new', label: 'New Booking', icon: PlusCircle },
    { to: '/leads', label: 'Guest Leads', icon: Users },
    { to: '/chat', label: 'Chat', icon: MessageCircle },
    { to: '/service-requests', label: 'Service Requests', icon: FileText },
    { to: '/rooms', label: 'Rooms', icon: Building2 },
    { to: '/spa', label: 'Spa', icon: Sparkles },
    { to: '/restaurant', label: 'Restaurant', icon: UtensilsCrossed },
    { to: '/activities', label: 'Activities', icon: Mountain },
    { to: '/events', label: 'Events', icon: PartyPopper },
    { to: '/venues', label: 'Venues', icon: MapPin },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/invoices', label: 'GST Invoices', icon: Receipt },
  ],
  housekeeping: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/housekeeping', label: 'Housekeeping Tasks', icon: CheckSquare },
    { to: '/service-requests', label: 'Service Requests', icon: FileText },
  ],
  spa: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/spa', label: 'Spa Bookings', icon: Sparkles },
    { to: '/service-requests', label: 'Service Requests', icon: FileText },
  ],
  restaurant: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/restaurant', label: 'Restaurant Reservations', icon: UtensilsCrossed },
    { to: '/service-requests', label: 'Service Requests', icon: FileText },
  ],
  rooms: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/rooms', label: 'Rooms', icon: Home },
    { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/service-requests', label: 'Service Requests', icon: FileText },
  ],
  maintenance: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/housekeeping', label: 'Maintenance Tasks', icon: Wrench },
    { to: '/service-requests', label: 'Service Requests', icon: FileText },
  ],
  customer: [
    { to: '/my-bookings', label: 'My Bookings', icon: CalendarCheck },
    { to: '/my-requests', label: 'My Requests', icon: MessageCircle },
    { to: '/my-invoices', label: 'My Invoices', icon: CreditCard },
    { to: '/my-profile', label: 'My Profile', icon: User },
  ],
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const navItems = roleNavItems[user?.role] || roleNavItems.staff

  return (
    <aside
      className={`
        relative flex flex-col shrink-0 bg-white border-r border-gray-200
        transition-all duration-200 ease-in-out
        ${collapsed ? 'w-16' : 'w-56 xl:w-64'}
      `}
    >
      {/* Logo / brand */}
      <div className={`flex items-center border-b border-gray-100 h-14 shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
        {collapsed ? (
          <span className="text-resort-700 font-bold text-lg font-serif">N</span>
        ) : (
          <div>
            <h1 className="text-base font-bold text-resort-700 font-serif leading-tight">Naaz Resort</h1>
            <p className="text-[11px] text-gray-400 leading-tight">
              {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal` : 'Portal'}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 mx-1.5 my-px rounded-lg text-[13px] font-medium transition-colors
               ${collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-1.5'}
               ${isActive
                 ? 'bg-resort-50 text-resort-700'
                 : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
               }`
            }
          >
            <item.icon className="w-[15px] h-[15px] shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className={`border-t border-gray-100 py-3 ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate leading-tight">
                {user?.full_name || user?.username}
              </p>
              <p className="text-[11px] text-gray-400 truncate leading-tight">{user?.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Logout"
          className={`w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && 'Logout'}
        </button>

        {!collapsed && (
          <p className="text-[10px] text-gray-300 px-2 pt-1">v2.0.0</p>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-12 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-gray-500" />
          : <ChevronLeft className="w-3 h-3 text-gray-500" />
        }
      </button>
    </aside>
  )
}
