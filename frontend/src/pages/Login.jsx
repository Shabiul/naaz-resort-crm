import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, User, Hotel, Mail, Phone, UserPlus } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [reg, setReg] = useState({ full_name: '', email: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState('staff') // 'staff' or 'customer'
  const [mode, setMode] = useState('login') // 'login' or 'register' (customer only)
  const { login, registerCustomer } = useAuth()
  const navigate = useNavigate()

  const isRegister = loginType === 'customer' && mode === 'register'

  const switchType = (type) => { setLoginType(type); setMode('login'); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await registerCustomer({ username, password, ...reg })
      } else {
        await login(username, password)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || (isRegister ? 'Registration failed' : 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  const accent = loginType === 'customer' ? 'green' : 'blue'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Hotel className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Naaz Resort</h1>
          <p className="text-gray-500 mt-2">{isRegister ? 'Create your guest account' : 'Welcome back! Please sign in.'}</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => switchType('staff')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${loginType === 'staff' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Staff / Admin
          </button>
          <button onClick={() => switchType('customer')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${loginType === 'customer' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Customer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Choose a username" required />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={reg.full_name} onChange={(e) => setReg({ ...reg, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" placeholder="Your full name" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" placeholder="you@example.com" required />
                </div>
                <p className="text-xs text-gray-400 mt-1">Use the email from your reservation to see your bookings.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" placeholder="+91 ..." />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder={isRegister ? 'Create a password' : 'Enter your password'} required />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className={`w-full text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              accent === 'green' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {loginType === 'staff' ? (
            <p>Demo admin credentials: admin / admin123</p>
          ) : mode === 'login' ? (
            <p>New guest?{' '}
              <button onClick={() => { setMode('register'); setError('') }} className="text-green-600 font-medium hover:underline">Create an account</button>
              <span className="block mt-1 text-xs text-gray-400">Demo: customer / customer123</span>
            </p>
          ) : (
            <p>Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError('') }} className="text-green-600 font-medium hover:underline">Sign in</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
