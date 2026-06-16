import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CustomerDashboard from './pages/CustomerDashboard'
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
import Users from './pages/Users'
import UserHistory from './pages/UserHistory'
import MyRequests from './pages/MyRequests'
import ChatWidget from './components/ChatWidget'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppRoutes() {
  const location = useLocation()
  const { user, loading } = useAuth()

  const DashboardComponent = () => {
    if (user?.role === 'customer') {
      return <CustomerDashboard />
    }
    return <Dashboard />
  }

  return (
    <ErrorBoundary key={location.pathname}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                  <Routes>
                    <Route path="/" element={<DashboardComponent />} />
                    <Route
              path="/users"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/users/history"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <UserHistory />
                </RoleProtectedRoute>
              }
            />
            <Route path="/bookings" element={<Bookings />} />
                    <Route path="/bookings/new" element={<NewBooking />} />
                    <Route path="/bookings/:id" element={<BookingDetail />} />
                    <Route path="/leads" element={<Leads />} />
                    <Route
                      path="/calls"
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                          <CallLogs />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/spa" element={<SpaReservations />} />
                    <Route path="/restaurant" element={<RestaurantReservations />} />
                    <Route path="/chat" element={<ChatConversations />} />
                    <Route
                      path="/housekeeping"
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'staff', 'housekeeping', 'maintenance']}>
                          <Housekeeping />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route path="/activities" element={<Activities />} />
                    <Route
                      path="/complaints"
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                          <Complaints />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route
                      path="/loyalty"
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                          <Loyalty />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route
                      path="/events"
                      element={
                        <RoleProtectedRoute allowedRoles={['admin', 'staff']}>
                          <Events />
                        </RoleProtectedRoute>
                      }
                    />
                    {/* Customer Routes */}
                    <Route
                      path="/my-bookings"
                      element={
                        <RoleProtectedRoute allowedRoles={['customer']}>
                          <MyBookings />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-requests"
                      element={
                        <RoleProtectedRoute allowedRoles={['customer']}>
                          <MyRequests />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                {user?.role !== 'customer' && <ChatWidget />}
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
