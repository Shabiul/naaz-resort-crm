import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
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
import ChatWidget from './components/ChatWidget'
import ErrorBoundary from './components/ErrorBoundary'

function AppRoutes() {
  const location = useLocation()
  return (
    <ErrorBoundary key={location.pathname}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/new" element={<NewBooking />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/calls" element={<CallLogs />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/spa" element={<SpaReservations />} />
        <Route path="/restaurant" element={<RestaurantReservations />} />
        <Route path="/chat" element={<ChatConversations />} />
        <Route path="/housekeeping" element={<Housekeeping />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/events" element={<Events />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <AppRoutes />
      </main>
      <ChatWidget />
    </div>
  )
}
