import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiMail } from 'react-icons/fi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Vui lòng nhập email'); return }
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
      toast.success('Đã gửi liên kết đặt lại mật khẩu qua email!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1>📧</h1>
        <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 12 }}>Kiểm tra email</h2>
        <p>Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư.</p>
        <Link to="/dang-nhap" className="btn-secondary" style={{ marginTop: 20, display: 'inline-flex' }}>
          Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-card">
      <h1>Noteori</h1>
      <p>Nhập email để đặt lại mật khẩu</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="forgot-email">Email</label>
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input id="forgot-email" type="email" className="form-input" style={{ paddingLeft: 42 }}
              placeholder="Nhập email đã đăng ký" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} disabled={loading}>
          {loading ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : 'Gửi liên kết đặt lại'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 'var(--font-size-sm)' }}>
        <Link to="/dang-nhap">Quay lại đăng nhập</Link>
      </div>
    </div>
  )
}
