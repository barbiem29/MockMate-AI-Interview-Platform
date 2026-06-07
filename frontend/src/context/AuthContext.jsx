import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mm_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mm_token')
    if (!token) { setLoading(false); return }

    authAPI.getMe()
      .then(res => {
        setUser(res.data.data)
        localStorage.setItem('mm_user', JSON.stringify(res.data.data))
      })
      .catch(() => {
        localStorage.removeItem('mm_token')
        localStorage.removeItem('mm_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, ...userData } = res.data.data
    localStorage.setItem('mm_token', token)
    localStorage.setItem('mm_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const signup = useCallback(async (formData) => {
    const res = await authAPI.signup(formData)
    const { token, ...userData } = res.data.data
    localStorage.setItem('mm_token', token)
    localStorage.setItem('mm_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('mm_token')
    localStorage.removeItem('mm_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}