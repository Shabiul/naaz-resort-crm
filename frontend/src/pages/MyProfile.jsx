import { useState } from 'react'
import { User, Mail, Phone, Lock, Save, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function MyProfile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '' })
  const [pw, setPw] = useState({ current_password: '', new_password: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'success'|'error', text }

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000) }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api.updateProfile(form)
      await refreshUser()
      flash('success', 'Profile updated')
    } catch (err) {
      flash('error', err.message || 'Update failed')
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (!pw.current_password || !pw.new_password) return
    setSavingPw(true)
    try {
      await api.updateProfile(pw)
      setPw({ current_password: '', new_password: '' })
      flash('success', 'Password changed')
    } catch (err) {
      flash('error', err.message || 'Could not change password')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account details</p>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.type === 'success' && <CheckCircle className="w-4 h-4" />} {msg.text}
        </div>
      )}

      <form onSubmit={saveProfile} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <h2 className="font-semibold text-gray-900">Account Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input value={user?.username || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Your bookings are linked to this email.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>
        <button type="submit" disabled={savingProfile} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <form onSubmit={changePassword} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <h2 className="font-semibold text-gray-900">Change Password</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
        </div>
        <button type="submit" disabled={savingPw} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium disabled:opacity-50">
          <Lock className="w-4 h-4" /> {savingPw ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
