import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { profileAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiCamera, FiSave, FiLock } from 'react-icons/fi'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await profileAPI.update(formData)
      setUser(res.data.data)
      toast.success('Cập nhật hồ sơ thành công!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const res = await profileAPI.updateAvatar(formData)
      setUser(res.data.data)
      toast.success('Đã cập nhật ảnh đại diện')
    } catch {
      toast.error('Không thể tải ảnh lên')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    try {
      await profileAPI.changePassword(passwordData)
      toast.success('Đổi mật khẩu thành công!')
      setPasswordData({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>Hồ sơ cá nhân</h2>

      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=6366f1&color=fff&size=96`}
            alt={user?.name} className="avatar avatar-lg"
          />
          <button onClick={() => fileInputRef.current?.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: '3px solid var(--bg-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiCamera size={14} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
        </div>
        <h3 style={{ marginTop: 12, fontWeight: 600 }}>{user?.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{user?.email}</p>
      </div>

      {/* Profile form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 16 }}>Thông tin cá nhân</h3>
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Tên hiển thị</label>
            <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} disabled
              style={{ opacity: 0.6 }} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Email không thể thay đổi</span>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <FiSave /> Lưu thay đổi
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 16 }}>Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Mật khẩu hiện tại</label>
            <input type="password" name="current_password" className="form-input" placeholder="Nhập mật khẩu hiện tại"
              value={passwordData.current_password} onChange={handlePasswordChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu mới</label>
            <input type="password" name="password" className="form-input" placeholder="Tối thiểu 8 ký tự"
              value={passwordData.password} onChange={handlePasswordChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu mới</label>
            <input type="password" name="password_confirmation" className="form-input" placeholder="Nhập lại mật khẩu mới"
              value={passwordData.password_confirmation} onChange={handlePasswordChange} />
          </div>
          <button type="submit" className="btn-primary"><FiLock /> Đổi mật khẩu</button>
        </form>
      </div>
    </div>
  )
}
