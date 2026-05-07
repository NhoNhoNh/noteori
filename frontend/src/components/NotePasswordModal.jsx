import { useState } from 'react'
import { notesAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiX, FiLock, FiUnlock } from 'react-icons/fi'

export default function NotePasswordModal({ noteId, hasPassword, onClose }) {
  const [mode, setMode] = useState(hasPassword ? 'menu' : 'set') // 'menu' | 'set' | 'change' | 'remove'
  const [formData, setFormData] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (!formData.password) { setError('Vui lòng nhập mật khẩu'); return }
    if (formData.password !== formData.password_confirmation) { setError('Mật khẩu xác nhận không khớp'); return }
    setLoading(true)
    try {
      await notesAPI.setPassword(noteId, { password: formData.password, password_confirmation: formData.password_confirmation })
      toast.success('Đã bật bảo vệ mật khẩu')
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!formData.current_password) { setError('Vui lòng nhập mật khẩu hiện tại'); return }
    if (!formData.password) { setError('Vui lòng nhập mật khẩu mới'); return }
    if (formData.password !== formData.password_confirmation) { setError('Mật khẩu xác nhận không khớp'); return }
    setLoading(true)
    try {
      await notesAPI.changePassword(noteId, formData)
      toast.success('Đã đổi mật khẩu ghi chú')
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Mật khẩu hiện tại không đúng')
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePassword = async (e) => {
    e.preventDefault()
    if (!formData.current_password) { setError('Vui lòng nhập mật khẩu hiện tại để xác nhận'); return }
    setLoading(true)
    try {
      await notesAPI.removePassword(noteId, { password: formData.current_password })
      toast.success('Đã tắt bảo vệ mật khẩu')
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FiLock style={{ marginRight: 8 }} /> Bảo vệ mật khẩu</h2>
          <button className="btn-icon" onClick={onClose}><FiX /></button>
        </div>

        <div className="modal-body">
          {mode === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setMode('change')} style={{ justifyContent: 'flex-start' }}>
                <FiLock /> Đổi mật khẩu ghi chú
              </button>
              <button className="btn-secondary" onClick={() => setMode('remove')} style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
                <FiUnlock /> Tắt bảo vệ mật khẩu
              </button>
            </div>
          )}

          {mode === 'set' && (
            <form onSubmit={handleSetPassword}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 'var(--font-size-sm)' }}>
                Đặt mật khẩu để bảo vệ ghi chú này. Mật khẩu sẽ được yêu cầu khi xem, sửa hoặc xóa.
              </p>
              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <input type="password" name="password" className="form-input" placeholder="Nhập mật khẩu"
                  value={formData.password} onChange={handleChange} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <input type="password" name="password_confirmation" className="form-input" placeholder="Nhập lại mật khẩu"
                  value={formData.password_confirmation} onChange={handleChange} />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={loading}>Đặt mật khẩu</button>
              </div>
            </form>
          )}

          {mode === 'change' && (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input type="password" name="current_password" className="form-input" placeholder="Nhập mật khẩu hiện tại"
                  value={formData.current_password} onChange={handleChange} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input type="password" name="password" className="form-input" placeholder="Nhập mật khẩu mới"
                  value={formData.password} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input type="password" name="password_confirmation" className="form-input" placeholder="Nhập lại mật khẩu mới"
                  value={formData.password_confirmation} onChange={handleChange} />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setMode('menu')}>Quay lại</button>
                <button type="submit" className="btn-primary" disabled={loading}>Đổi mật khẩu</button>
              </div>
            </form>
          )}

          {mode === 'remove' && (
            <form onSubmit={handleRemovePassword}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 'var(--font-size-sm)' }}>
                Nhập mật khẩu hiện tại để xác nhận tắt bảo vệ mật khẩu.
              </p>
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input type="password" name="current_password" className="form-input" placeholder="Nhập mật khẩu hiện tại"
                  value={formData.current_password} onChange={handleChange} autoFocus />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setMode('menu')}>Quay lại</button>
                <button type="submit" className="btn-danger" disabled={loading}>Tắt bảo vệ</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
