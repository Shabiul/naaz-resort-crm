import { useState, useEffect } from 'react'
import { Plus, CalendarDays, LayoutGrid, TrendingUp, IndianRupee, PartyPopper, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { api } from '../services/api'

const EVENT_TYPES = ['wedding', 'corporate', 'birthday', 'anniversary', 'conference', 'other']
const eventIcon = { wedding: '💍', corporate: '🏢', birthday: '🎂', anniversary: '💑', conference: '🎤', other: '🎉' }

// Ordered lifecycle (cancelled is a terminal side-state, handled separately)
const STATUS_FLOW = ['inquiry', 'quotation_sent', 'negotiation', 'confirmed', 'completed']
const statusLabel = {
  inquiry: 'Inquiry', quotation_sent: 'Quotation Sent', negotiation: 'Negotiation',
  confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled',
}
const statusStyle = {
  inquiry: 'bg-blue-100 text-blue-700',
  quotation_sent: 'bg-yellow-100 text-yellow-700',
  negotiation: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-200 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
}
// Action buttons offered for each status: [{ to, label }]
const nextActions = {
  inquiry: [{ to: 'quotation_sent', label: 'Send Quotation' }],
  quotation_sent: [{ to: 'negotiation', label: 'Negotiate' }, { to: 'confirmed', label: 'Confirm' }],
  negotiation: [{ to: 'confirmed', label: 'Confirm' }],
  confirmed: [{ to: 'completed', label: 'Mark Completed' }],
  completed: [],
  cancelled: [],
}

const emptyForm = {
  guest_name: '', phone: '', email: '', event_type: 'wedding', event_date: '',
  guests_count: 50, budget: '', quoted_amount: 0, venue_id: '', requirements: '', notes: '',
}

const money = (n) => `₹${(n || 0).toLocaleString('en-IN')}`
const pad = (n) => String(n).padStart(2, '0')

export default function Events() {
  const [tab, setTab] = useState('dashboard')
  const [events, setEvents] = useState([])
  const [venues, setVenues] = useState([])
  const [stats, setStats] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    const [ev, vn, st, up] = await Promise.all([
      api.getEvents().catch(() => []),
      api.getVenues(true).catch(() => []),
      api.getEventStats().catch(() => null),
      api.getUpcomingEvents().catch(() => []),
    ])
    setEvents(Array.isArray(ev) ? ev : [])
    setVenues(Array.isArray(vn) ? vn : [])
    setStats(st)
    setUpcoming(Array.isArray(up) ? up : [])
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.venue_id) delete payload.venue_id
    await api.createEvent(payload)
    setShowForm(false)
    setForm(emptyForm)
    load()
  }

  const updateStatus = async (id, status) => {
    await api.updateEventStatus(id, status)
    load()
  }

  const assignVenue = async (id, venueId) => {
    await api.updateEvent(id, { venue_id: venueId || 0 })
    load()
  }

  const filteredEvents = statusFilter ? events.filter(e => e.status === statusFilter) : events

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events & Weddings</h2>
          <p className="text-gray-500 mt-1">Manage venues, inquiries, and the event pipeline</p>
        </div>
        <button onClick={() => { setShowForm(true); setTab('inquiries') }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Inquiry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
          { key: 'inquiries', label: 'Inquiries', icon: PartyPopper },
          { key: 'calendar', label: 'Venue Calendar', icon: CalendarDays },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-resort-600 text-resort-700' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <Dashboard stats={stats} upcoming={upcoming} venues={venues} />}
      {tab === 'calendar' && <VenueCalendar events={events} venues={venues} />}
      {tab === 'inquiries' && (
        <Inquiries
          events={filteredEvents} venues={venues} showForm={showForm} setShowForm={setShowForm}
          form={form} setForm={setForm} handleSubmit={handleSubmit} updateStatus={updateStatus}
          assignVenue={assignVenue} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function Dashboard({ stats, upcoming, venues }) {
  if (!stats) return <div className="card text-center py-12 text-gray-400">No statistics available.</div>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={stats.total} icon={PartyPopper} color="text-violet-600" bg="bg-violet-50" />
        <StatCard label="Upcoming Confirmed" value={stats.upcoming_count} icon={CalendarDays} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Pipeline Value" value={money(stats.pipeline_value)} icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Confirmed Value" value={money(stats.confirmed_value)} icon={IndianRupee} color="text-resort-600" bg="bg-resort-50" />
      </div>

      {/* Status breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Pipeline by Status</h3>
        <div className="flex flex-wrap gap-3">
          {[...STATUS_FLOW, 'cancelled'].map(s => (
            <div key={s} className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[s]}`}>{statusLabel[s]}</span>
              <span className="text-lg font-bold text-gray-900">{stats.by_status?.[s] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming events */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming events.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map(e => (
                <div key={e.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{eventIcon[e.event_type] || '🎉'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{e.guest_name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {e.venue_name && <><MapPin className="w-3 h-3" /> {e.venue_name} ·</>} 👥 {e.guests_count}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">📅 {e.event_date}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[e.status]}`}>{statusLabel[e.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Venue utilization */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Venues ({venues.length} active)</h3>
          <div className="space-y-2">
            {venues.map(v => {
              const count = upcoming.filter(e => e.venue_id === v.id).length
              return (
                <div key={v.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {v.name}</span>
                  <span className="text-gray-500">{count} upcoming · {money(v.price_per_event)}</span>
                </div>
              )
            })}
            {venues.length === 0 && <p className="text-gray-400 text-sm">No active venues. Add some on the Venues page.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function VenueCalendar({ events }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })

  const year = month.getFullYear()
  const m = month.getMonth()
  const firstWeekday = new Date(year, m, 1).getDay()
  const daysInMonth = new Date(year, m + 1, 0).getDate()
  const monthName = month.toLocaleString('default', { month: 'long', year: 'numeric' })

  const eventsByDay = {}
  events.forEach(e => {
    if (!e.event_date) return
    const [ey, em] = e.event_date.split('-').map(Number)
    if (ey === year && em === m + 1) {
      const day = Number(e.event_date.split('-')[2])
      ;(eventsByDay[day] = eventsByDay[day] || []).push(e)
    }
  })

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const todayStr = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
        <div className="flex gap-1">
          <button onClick={() => setMonth(new Date(year, m - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setMonth(new Date())} className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-lg">Today</button>
          <button onClick={() => setMonth(new Date(year, m + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} className="min-h-[72px]" />
          const cellStr = `${year}-${pad(m + 1)}-${pad(d)}`
          const dayEvents = eventsByDay[d] || []
          const isToday = cellStr === todayStr
          return (
            <div key={d} className={`min-h-[72px] border rounded-lg p-1 ${isToday ? 'border-resort-400 bg-resort-50/40' : 'border-gray-100'}`}>
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-resort-700' : 'text-gray-500'}`}>{d}</div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(e => (
                  <div key={e.id} title={`${e.guest_name} · ${e.venue_name || 'No venue'} · ${statusLabel[e.status]}`}
                    className={`text-[10px] leading-tight truncate px-1 py-0.5 rounded ${statusStyle[e.status]}`}>
                    {e.venue_name || e.guest_name}
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 3} more</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Inquiries({ events, venues, showForm, setShowForm, form, setForm, handleSubmit, updateStatus, assignVenue, statusFilter, setStatusFilter }) {
  return (
    <div>
      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setStatusFilter('')} className={`text-xs px-3 py-1.5 rounded-full font-medium ${!statusFilter ? 'bg-resort-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {[...STATUS_FLOW, 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusFilter === s ? 'bg-resort-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{statusLabel[s]}</button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">New Event Inquiry</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label><input value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })} className="input-field">
                {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label><input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Expected Guests</label><input type="number" min="1" value={form.guests_count} onChange={e => setForm({ ...form, guests_count: parseInt(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <select value={form.venue_id} onChange={e => setForm({ ...form, venue_id: e.target.value })} className="input-field">
                <option value="">— Select venue —</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name} (up to {v.capacity_max})</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quoted Amount (₹)</label><input type="number" min="0" value={form.quoted_amount} onChange={e => setForm({ ...form, quoted_amount: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Budget (note)</label><input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="input-field" placeholder="e.g. ₹5,00,000" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label><textarea rows={2} value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} className="input-field" placeholder="Decor, catering, A/V, seating arrangement..." /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save Inquiry</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No event inquiries{statusFilter ? ` with status "${statusLabel[statusFilter]}"` : ''} yet</div>
        ) : events.map(ev => (
          <div key={ev.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-lg">{eventIcon[ev.event_type] || '🎉'}</span>
                  <span className="font-semibold text-gray-900">{ev.guest_name}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-700 capitalize">{ev.event_type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[ev.status] || 'bg-gray-100 text-gray-600'}`}>{statusLabel[ev.status] || ev.status}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <span>{ev.phone}</span>
                  {ev.event_date && <span>📅 {ev.event_date}</span>}
                  <span>👥 {ev.guests_count} guests</span>
                  {ev.quoted_amount > 0 && <span className="font-medium text-gray-700">{money(ev.quoted_amount)}</span>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <select value={ev.venue_id || ''} onChange={e => assignVenue(ev.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:ring-1 focus:ring-resort-400 outline-none">
                    <option value="">No venue</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                {ev.requirements && <p className="text-xs text-gray-500 mt-2">{ev.requirements}</p>}
              </div>
              <div className="ml-4 flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  {(nextActions[ev.status] || []).map(a => (
                    <button key={a.to} onClick={() => updateStatus(ev.id, a.to)}
                      className="text-xs px-3 py-1.5 bg-resort-50 text-resort-700 rounded-lg hover:bg-resort-100 font-medium">{a.label}</button>
                  ))}
                </div>
                {ev.status !== 'cancelled' && ev.status !== 'completed' && (
                  <button onClick={() => updateStatus(ev.id, 'cancelled')} className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg">Cancel</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
