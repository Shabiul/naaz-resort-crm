const API_BASE = '/api'
const AUTH_BASE = '/api/auth'

// Token management
let token = localStorage.getItem('token') || null

export const setToken = (newToken) => {
  token = newToken
  if (newToken) {
    localStorage.setItem('token', newToken)
  } else {
    localStorage.removeItem('token')
  }
}

export const getToken = () => token

async function fetchJSON(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const res = await fetch(url, {
    headers,
    ...options,
  })
  
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

function toParams(obj) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value)
    }
  }
  return params.toString()
}

export const api = {
  // --- Auth ---
  login: async (username, password) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    const res = await fetch(`${AUTH_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    if (!res.ok) {
      throw new Error('Invalid credentials')
    }

    return res.json()
  },

  register: (data) => fetchJSON(`${AUTH_BASE}/register?${toParams(data)}`, { method: 'POST' }),

  registerCustomer: (data) => fetchJSON(`${AUTH_BASE}/register-customer?${toParams(data)}`, { method: 'POST' }),

  getMe: () => fetchJSON(`${AUTH_BASE}/me`),

  updateProfile: (data) => fetchJSON(`${AUTH_BASE}/me?${toParams(data)}`, { method: 'PATCH' }),

  // --- Customer Portal ---
  getMyBookings: () => fetchJSON(`${API_BASE}/my/bookings`),
  getMyInvoices: () => fetchJSON(`${API_BASE}/my/invoices`),
  getMySummary: () => fetchJSON(`${API_BASE}/my/summary`),

  // --- Payments ---
  getPaymentConfig: () => fetchJSON(`${API_BASE}/payments/config`),
  createPaymentOrder: (bookingId, amount) =>
    fetchJSON(`${API_BASE}/payments/create-order?${toParams({ booking_id: bookingId, amount })}`, { method: 'POST' }),
  verifyPayment: (data) => fetchJSON(`${API_BASE}/payments/verify?${toParams(data)}`, { method: 'POST' }),
  simulatePayment: (paymentId, outcome = 'success') =>
    fetchJSON(`${API_BASE}/payments/${paymentId}/simulate?${toParams({ outcome })}`, { method: 'POST' }),
  refundPayment: (paymentId) => fetchJSON(`${API_BASE}/payments/${paymentId}/refund`, { method: 'POST' }),
  getPayments: (filters = {}) => fetchJSON(`${API_BASE}/payments?${toParams(filters)}`),
  getBookingPaymentSummary: (bookingId) => fetchJSON(`${API_BASE}/payments/booking/${bookingId}/summary`),

  getUsers: () => fetchJSON(`${AUTH_BASE}/users`),

  getUserHistory: () => fetchJSON(`${AUTH_BASE}/users/history`),

  deleteUser: (userId) => fetchJSON(`${AUTH_BASE}/users/${userId}`, { method: 'DELETE' }),

  getDashboard: () => fetchJSON(`${API_BASE}/dashboard`),

  getBookings: (skip = 0, limit = 100) =>
    fetchJSON(`${API_BASE}/bookings?${toParams({ skip, limit })}`),

  getBooking: (id) => fetchJSON(`${API_BASE}/bookings/${id}`),

  createBooking: (data) =>
    fetchJSON(`${API_BASE}/bookings?${toParams(data)}`, { method: 'POST' }),

  cancelBooking: (id) =>
    fetchJSON(`${API_BASE}/bookings/${id}/cancel`, { method: 'POST' }),

  confirmBooking: (id) =>
    fetchJSON(`${API_BASE}/bookings/${id}/confirm`, { method: 'POST' }),

  getLeads: (skip = 0, limit = 100) =>
    fetchJSON(`${API_BASE}/leads?${toParams({ skip, limit })}`),

  getCallLogs: (skip = 0, limit = 100) =>
    fetchJSON(`${API_BASE}/call-logs?${toParams({ skip, limit })}`),

  getRoomAvailability: (roomType, checkIn, checkOut) =>
    fetchJSON(`${API_BASE}/rooms/availability?${toParams({ room_type: roomType, check_in: checkIn, check_out: checkOut })}`),

  bookSpa: (data) => {
    const { date, ...rest } = data
    return fetchJSON(`${API_BASE}/spa/book?${toParams({ ...rest, date_str: date })}`, { method: 'POST' })
  },

  reserveRestaurant: (data) => {
    const { date, ...rest } = data
    return fetchJSON(`${API_BASE}/restaurant/reserve?${toParams({ ...rest, date_str: date })}`, { method: 'POST' })
  },

  createLead: (data) =>
    fetchJSON(`${API_BASE}/leads?${toParams(data)}`, { method: 'POST' }),

  seedDatabase: () =>
    fetchJSON(`/seed/init`, { method: 'POST' }),

  // --- Chat ---
  createChat: (data = {}) =>
    fetchJSON(`${API_BASE}/chat/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'chat_widget', guest_name: 'Guest', phone: '', email: '', ...data }),
    }),

  sendChat: (conversationId, message, guestInfo = {}) =>
    fetchJSON(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversationId, message, source: 'crm', ...guestInfo }),
    }),

  createChatConversation: (data = {}) =>
    fetchJSON(`${API_BASE}/chat/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'crm', guest_name: 'Guest', phone: '', email: '', ...data }),
    }),

  sendChatMessage: (conversationId, message, guestInfo = {}) =>
    fetchJSON(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: conversationId, message, source: 'crm', ...guestInfo }),
    }),

  getChatConversations: (skip = 0, limit = 50) =>
    fetchJSON(`${API_BASE}/chat/conversations?${toParams({ skip, limit })}`),

  getChatConversation: (id) =>
    fetchJSON(`${API_BASE}/chat/conversations/${id}`),

  // --- Housekeeping ---
  getHousekeeping: () => fetchJSON(`${API_BASE}/housekeeping`),
  createHousekeeping: (data) => fetchJSON(`${API_BASE}/housekeeping?${toParams(data)}`, { method: 'POST' }),
  updateHousekeepingStatus: (id, status) => fetchJSON(`${API_BASE}/housekeeping/${id}/status?status=${status}`, { method: 'POST' }),

  // --- Activities ---
  getActivities: () => fetchJSON(`${API_BASE}/activities`),
  createActivity: (data) => {
    const { date, ...rest } = data
    return fetchJSON(`${API_BASE}/activities?${toParams({ ...rest, activity_date: date })}`, { method: 'POST' })
  },

  // --- Complaints ---
  getComplaints: () => fetchJSON(`${API_BASE}/complaints`),
  createComplaint: (data) => fetchJSON(`${API_BASE}/complaints?${toParams(data)}`, { method: 'POST' }),
  resolveComplaint: (id, resolution = '') => fetchJSON(`${API_BASE}/complaints/${id}/resolve?resolution=${encodeURIComponent(resolution)}`, { method: 'POST' }),

  // --- Loyalty ---
  getLoyalty: () => fetchJSON(`${API_BASE}/loyalty`),
  createLoyalty: (data) => fetchJSON(`${API_BASE}/loyalty?${toParams(data)}`, { method: 'POST' }),

  // --- Events ---
  getEvents: (filters = {}) => fetchJSON(`${API_BASE}/events?${toParams(filters)}`),
  createEvent: (data) => fetchJSON(`${API_BASE}/events?${toParams(data)}`, { method: 'POST' }),
  updateEvent: (id, data) => fetchJSON(`${API_BASE}/events/${id}?${toParams(data)}`, { method: 'PATCH' }),
  updateEventStatus: (id, status) => fetchJSON(`${API_BASE}/events/${id}/status?status=${status}`, { method: 'POST' }),
  deleteEvent: (id) => fetchJSON(`${API_BASE}/events/${id}`, { method: 'DELETE' }),
  getEventStats: () => fetchJSON(`${API_BASE}/events/stats`),
  getUpcomingEvents: (days = 90) => fetchJSON(`${API_BASE}/events/upcoming?${toParams({ days })}`),

  // --- Venues ---
  getVenues: (activeOnly = false) => fetchJSON(`${API_BASE}/venues?${toParams({ active_only: activeOnly })}`),
  getVenue: (id) => fetchJSON(`${API_BASE}/venues/${id}`),
  createVenue: (data) => fetchJSON(`${API_BASE}/venues?${toParams(data)}`, { method: 'POST' }),
  updateVenue: (id, data) => fetchJSON(`${API_BASE}/venues/${id}?${toParams(data)}`, { method: 'PATCH' }),
  deleteVenue: (id) => fetchJSON(`${API_BASE}/venues/${id}`, { method: 'DELETE' }),
  getVenueAvailability: (eventDate) => fetchJSON(`${API_BASE}/venues/availability?${toParams({ event_date: eventDate })}`),

  // --- Spa & Restaurant lists ---
  getSpa: () => fetchJSON(`${API_BASE}/spa`),
  getRestaurant: () => fetchJSON(`${API_BASE}/restaurant`),

  // --- Payment demo ---
  markBookingPaid: (id) => fetchJSON(`${API_BASE}/bookings/${id}/pay`, { method: 'POST' }),

  // --- Invoices ---
  getInvoices: () => fetchJSON(`${API_BASE}/invoices`),
  getInvoice: (id) => fetchJSON(`${API_BASE}/invoices/${id}`),
  getInvoiceByBooking: (bookingId) => fetchJSON(`${API_BASE}/invoices/by-booking/${bookingId}`),
  generateInvoice: (bookingId) => fetchJSON(`${API_BASE}/invoices/generate/${bookingId}`, { method: 'POST' }),
  downloadInvoicePdf: async (invId, invoiceNumber) => {
    const hdrs = {}
    if (token) hdrs['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${API_BASE}/invoices/${invId}/pdf`, { headers: hdrs })
    if (!res.ok) throw new Error('PDF generation failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoiceNumber || 'invoice'}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  // --- Service Requests ---
  getServiceRequests: (filters = {}) => fetchJSON(`${API_BASE}/service-requests?${toParams(filters)}`),
  getServiceRequest: (id) => fetchJSON(`${API_BASE}/service-requests/${id}`),
  createServiceRequest: (data) => fetchJSON(`${API_BASE}/service-requests?${toParams(data)}`, { method: 'POST' }),
  updateServiceRequest: (id, data) => fetchJSON(`${API_BASE}/service-requests/${id}?${toParams(data)}`, { method: 'PATCH' }),
  assignServiceRequest: (id, assignedRole) => fetchJSON(`${API_BASE}/service-requests/${id}/assign?assigned_role=${assignedRole}`, { method: 'PATCH' }),
  updateRequestStatus: (id, status) => fetchJSON(`${API_BASE}/service-requests/${id}/status?new_status=${status}`, { method: 'PATCH' }),
  deleteServiceRequest: (id) => fetchJSON(`${API_BASE}/service-requests/${id}`, { method: 'DELETE' }),
}
