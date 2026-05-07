import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, profileAPI } from '../services/api'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const res = await authAPI.me()
      setUser(res.data.data)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials)
    const { token, user: userData } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    toast.success('Đăng nhập thành công!')
    return res.data
  }, [])

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data)
    const { token, user: userData } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    toast.success('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.')
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.info('Đã đăng xuất')
  }, [])

  const updateProfile = useCallback(async (data) => {
    const res = await profileAPI.update(data)
    setUser(res.data.data)
    toast.success('Cập nhật hồ sơ thành công!')
    return res.data
  }, [])

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được sử dụng trong AuthProvider')
  return context
}
