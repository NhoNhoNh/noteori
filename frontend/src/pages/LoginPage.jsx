import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Vui lòng nhập email'
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(formData)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại'
      toast.error(msg)
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Noteori</h1>
      <p>Đăng nhập để quản lý ghi chú của bạn</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email</label>
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-input"
              style={{ paddingLeft: 42 }}
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={handleChange}
              autoFocus
            />
          </div>
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Mật khẩu</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              style={{ paddingLeft: 42, paddingRight: 42 }}
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <Link to="/quen-mat-khau" style={{ fontSize: 'var(--font-size-sm)' }}>Quên mật khẩu?</Link>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} disabled={loading}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : 'Đăng nhập'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
        Chưa có tài khoản? <Link to="/dang-ky" style={{ fontWeight: 600 }}>Đăng ký ngay</Link>
      </div>
    </div>
  )
}
