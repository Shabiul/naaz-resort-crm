import { useState, useEffect } from 'react'
import { CheckSquare, Plus, Clock, AlertTriangle } from 'lucide-react'
import { api } from '../services/api'

const TASK_TYPES = ['Cleaning', 'Turndown', 'Maintenance', 'Towels', 'Amenities', 'Room Service']
const PRIORITIES = ['low', 'normal', 'high', 'urgent']
const STAFF = ['Priya S.', 'Rahul K.', 'Meena T.', 'Arjun P.', 'Sunita R.']

const priorityColor = { low: 'bg-gray-100 text-gray-600', normal: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' }
const statusColor = { pending: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' }

export default function Housekeeping() {
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ room_number: '', task_type: 'Cleaning', priority: 'normal', assigned_to: '', guest_name: '', notes: '' })
  const [filter, setFilter] = useState('all')

  const load = () => api.getHousekeeping().then(setTasks).catch(() => setTasks([]))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.createHousekeeping(form)
    setShowForm(false)
    setForm({ room_number: '', task_type: 'Cleaning', priority: 'normal', assigned_to: '', guest_name: '', notes: '' })
    load()
  }

  const updateStatus = async (id, status) => {
    await api.updateHousekeepingStatus(id, status)
    load()
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const counts = { pending: tasks.filter(t => t.status === 'pending').length, in_progress: tasks.filter(t => t.status === 'in_progress').length, completed: tasks.filter(t => t.status === 'completed').length }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Housekeeping</h2>
          <p className="text-gray-500 mt-1">Manage room tasks and staff assignments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Pending', 'pending', 'bg-yellow-50', 'text-yellow-600'], ['In Progress', 'in_progress', 'bg-blue-50', 'text-blue-600'], ['Completed', 'completed', 'bg-green-50', 'text-green-600']].map(([label, key, bg, col]) => (
          <button key={key} onClick={() => setFilter(filter === key ? 'all' : key)} className={`card flex items-center gap-3 cursor-pointer border-2 ${filter === key ? 'border-resort-400' : 'border-transparent'}`}>
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}><CheckSquare className={`w-5 h-5 ${col}`} /></div>
            <div><p className="text-sm text-gray-500">{label}</p><p className="text-xl font-bold text-gray-900">{counts[key]}</p></div>
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Create Task</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} className="input-field" placeholder="e.g. 101" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
              <select value={form.task_type} onChange={e => setForm({...form, task_type: e.target.value})} className="input-field">
                {TASK_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} className="input-field">
                <option value="">Unassigned</option>
                {STAFF.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
              <input value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="input-field" placeholder="Optional" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Create Task</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No tasks found</div>
        ) : filtered.map(task => (
          <div key={task.id} className="card flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">Room {task.room_number}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-700">{task.task_type}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>{task.priority}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[task.status]}`}>{task.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {task.assigned_to && <span>Assigned: {task.assigned_to}</span>}
                {task.guest_name && <span>Guest: {task.guest_name}</span>}
                {task.notes && <span>{task.notes}</span>}
              </div>
            </div>
            {task.status !== 'completed' && (
              <div className="flex gap-2">
                {task.status === 'pending' && (
                  <button onClick={() => updateStatus(task.id, 'in_progress')} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Start
                  </button>
                )}
                <button onClick={() => updateStatus(task.id, 'completed')} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" /> Done
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
