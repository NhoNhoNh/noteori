import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiLock } from 'react-icons/fi'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    email: searchParams.get('email') || '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password.length < 8) { toast.error('Mật khẩu tối thiểu 8 ký tự'); return }
    if (formData.password !== formData.password_confirmation) { toast.error('Mật khẩu xác nhận không khớp'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword(formData)
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.')
      navigate('/dang-nhap')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đặt lại mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Noteori</h1>
      <p>Nhập mật khẩu mới</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reset-password">Mật khẩu mới</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input id="reset-password" name="password" type="password" className="form-input" style={{ paddingLeft: 42 }}
              placeholder="Tối thiểu 8 ký tự" value={formData.password} onChange={handleChange} autoFocus />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reset-confirm">Xác nhận mật khẩu</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input id="reset-confirm" name="password_confirmation" type="password" className="form-input" style={{ paddingLeft: 42 }}
              placeholder="Nhập lại mật khẩu mới" value={formData.password_confirmation} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} disabled={loading}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : 'Đặt lại mật khẩu'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--font-size-sm)' }}>
        <Link to="/dang-nhap">Quay lại đăng nhập</Link>
      </div>
    </div>
  )
}
