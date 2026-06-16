const API_BASE = '/api'

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

function toParams(obj) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined && v !== '') p.append(k, v)
  }
  return p.toString()
}

export const api = {
  // Rooms
  getRooms: (roomType, checkIn, checkOut) =>
    fetchJSON(`${API_BASE}/rooms/availability?${toParams({ room_type: roomType, check_in: checkIn, check_out: checkOut })}`),

  // Bookings
  createBooking: (data) =>
    fetchJSON(`${API_BASE}/bookings?${toParams(data)}`, { method: 'POST' }),

  // Leads
  createLead: (data) =>
    fetchJSON(`${API_BASE}/leads?${toParams(data)}`, { method: 'POST' }),

  // Spa
  bookSpa: (data) => {
    const { date, ...rest } = data
    return fetchJSON(`${API_BASE}/spa/book?${toParams({ ...rest, date_str: date })}`, { method: 'POST' })
  },

  // Restaurant
  reserveRestaurant: (data) => {
    const { date, ...rest } = data
    return fetchJSON(`${API_BASE}/restaurant/reserve?${toParams({ ...rest, date_str: date })}`, { method: 'POST' })
  },

  // Chat
  createChat: (data = {}) =>
    fetchJSON(`${API_BASE}/chat/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'website', guest_name: 'Guest', ...data }),
    }),

  sendChat: (convId, message, info = {}) =>
    fetchJSON(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: convId, message, source: 'website', ...info }),
    }),

  // Dashboard stats (for live booking count on website)
  getDashboard: () => fetchJSON(`${API_BASE}/dashboard`),
}

