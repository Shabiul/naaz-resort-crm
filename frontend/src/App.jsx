import { useState } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import MyBookings from './pages/MyBookings'
import BookingDetail from './pages/BookingDetail'
import Leads from './pages/Leads'
import CallLogs from './pages/CallLogs'
import Rooms from './pages/Rooms'
import SpaReservations from './pages/SpaReservations'
import RestaurantReservations from './pages/RestaurantReservations'
import NewBooking from './pages/NewBooking'
import ChatConversations from './pages/ChatConversations'
import Housekeeping from './pages/Housekeeping'
import Activities from './pages/Activities'
import Complaints from './pages/Complaints'
import Loyalty from './pages/Loyalty'
import Events from './pages/Events'
import Venues from './pages/Venues'
import Payments from './pages/Payments'
import Invoices from './pages/Invoices'
import Users from './pages/Users'
import UserHistory from './pages/UserHistory'
import MyRequests from './pages/MyRequests'
import MyProfile from './pages/MyProfile'
import MyInvoices from './pages/MyInvoices'
import ServiceRequests from './pages/ServiceRequests'
import ChatWidget from './components/ChatWidget'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'

// Customers go straight to My Bookings; all other roles see the admin Dashboard
function DashboardPage() {
  const { user } = useAuth()
  if (user?.role === 'customer') return <Navigate to="/my-bookings" replace />
  return <Dashboard />
}

// Layout: sidebar + scrollable content area + chat widget
function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  )

  const toggle = () =>
    setCollapsed((v) => {
      localStorage.setItem('sidebar-collapsed', String(!v))
      return !v
    })

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 md:p-5 xl:p-7">
            <ErrorBoundary key={location.pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
        {user?.role !== 'customer' && <ChatWidget />}
      </div>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected layout — all child paths rendered inside AppLayout via <Outlet> */}
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          {/* Admin only */}
          <Route path="users" element={<RoleProtectedRoute allowedRoles={['admin']}><Users /></RoleProtectedRoute>} />
          <Route path="users/history" element={<RoleProtectedRoute allowedRoles={['admin']}><UserHistory /></RoleProtectedRoute>} />

          {/* Bookings */}
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/new" element={<NewBooking />} />
          <Route path="bookings/:id" element={<BookingDetail />} />

          {/* CRM */}
          <Route path="leads" element={<Leads />} />
          <Route path="calls" element={<RoleProtectedRoute allowedRoles={['admin', 'staff']}><CallLogs /></RoleProtectedRoute>} />
          <Route path="chat" element={<ChatConversations />} />

          {/* Operations */}
          <Route path="rooms" element={<Rooms />} />
          <Route path="spa" element={<SpaReservations />} />
          <Route path="restaurant" element={<RestaurantReservations />} />
          <Route path="activities" element={<Activities />} />
          <Route path="housekeeping" element={<RoleProtectedRoute allowedRoles={['admin', 'staff', 'housekeeping', 'maintenance']}><Housekeeping /></RoleProtectedRoute>} />
          <Route path="complaints" element={<RoleProtectedRoute allowedRoles={['admin', 'staff']}><Complaints /></RoleProtectedRoute>} />
          <Route path="loyalty" element={<RoleProtectedRoute allowedRoles={['admin', 'staff']}><Loyalty /></RoleProtectedRoute>} />
          <Route path="service-requests" element={<ServiceRequests />} />

          {/* Events & Venues */}
          <Route path="events" element={<RoleProtectedRoute allowedRoles={['admin', 'staff']}><Events /></RoleProtectedRoute>} />
          <Route path="venues" element={<RoleProtectedRoute allowedRoles={['admin', 'staff']}><Venues /></RoleProtectedRoute>} />

          {/* Finance */}
          <Route path="payments" element={<RoleProtectedRoute allowedRoles={['admin', 'staff']}><Payments /></RoleProtectedRoute>} />
          <Route path="invoices" element={<RoleProtectedRoute allowedRoles={['admin', 'staff']}><Invoices /></RoleProtectedRoute>} />

          {/* Customer portal */}
          <Route path="my-bookings" element={<RoleProtectedRoute allowedRoles={['customer']}><MyBookings /></RoleProtectedRoute>} />
          <Route path="my-requests" element={<RoleProtectedRoute allowedRoles={['customer']}><MyRequests /></RoleProtectedRoute>} />
          <Route path="my-invoices" element={<RoleProtectedRoute allowedRoles={['customer']}><MyInvoices /></RoleProtectedRoute>} />
          <Route path="my-profile" element={<RoleProtectedRoute allowedRoles={['customer']}><MyProfile /></RoleProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
