import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên hiển thị'
    if (!formData.email) newErrors.email = 'Vui lòng nhập email'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ'
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu'
    else if (formData.password.length < 8) newErrors.password = 'Mật khẩu tối thiểu 8 ký tự'
    if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Mật khẩu xác nhận không khớp'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register(formData)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại'
      toast.error(msg)
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Noteori</h1>
      <p>Tạo tài khoản mới để bắt đầu</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Tên hiển thị</label>
          <div style={{ position: 'relative' }}>
            <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input id="reg-name" name="name" type="text" className="form-input" style={{ paddingLeft: 42 }}
              placeholder="Nhập tên hiển thị" value={formData.name} onChange={handleChange} autoFocus />
          </div>
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email</label>
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input id="reg-email" name="email" type="email" className="form-input" style={{ paddingLeft: 42 }}
              placeholder="Nhập email" value={formData.email} onChange={handleChange} />
          </div>
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Mật khẩu</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} className="form-input"
              style={{ paddingLeft: 42, paddingRight: 42 }} placeholder="Tối thiểu 8 ký tự" value={formData.password} onChange={handleChange} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm">Xác nhận mật khẩu</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input id="reg-confirm" name="password_confirmation" type="password" className="form-input"
              style={{ paddingLeft: 42 }} placeholder="Nhập lại mật khẩu" value={formData.password_confirmation} onChange={handleChange} />
          </div>
          {errors.password_confirmation && <div className="form-error">{errors.password_confirmation}</div>}
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} disabled={loading}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : 'Đăng ký'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
        Đã có tài khoản? <Link to="/dang-nhap" style={{ fontWeight: 600 }}>Đăng nhập</Link>
      </div>
    </div>
  )
}
