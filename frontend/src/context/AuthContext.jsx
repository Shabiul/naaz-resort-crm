import { createContext, useContext, useState, useEffect } from 'react'
import { api, setToken, getToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getToken()
      if (token) {
        const userData = await api.getMe()
        setUser(userData)
      }
    } catch (error) {
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    const data = await api.login(username, password)
    setToken(data.access_token)
    setUser(data.user)
    return data
  }

  const registerCustomer = async (form) => {
    const data = await api.registerCustomer(form)
    setToken(data.access_token)
    setUser(data.user)
    return data
  }

  const refreshUser = async () => {
    const userData = await api.getMe()
    setUser(userData)
    return userData
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, registerCustomer, refreshUser, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
