import { useState } from 'react'
import { notesAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiLock } from 'react-icons/fi'

export default function PasswordVerifyModal({ noteId, onVerified, onCancel }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) { setError('Vui lòng nhập mật khẩu'); return }
    setLoading(true)
    setError('')
    try {
      await notesAPI.verifyPassword(noteId, { password })
      onVerified()
    } catch (err) {
      setError('Mật khẩu không đúng')
      toast.error('Mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FiLock style={{ marginRight: 8 }} /> Ghi chú được bảo vệ</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 'var(--font-size-sm)' }}>
              Ghi chú này được bảo vệ bằng mật khẩu. Vui lòng nhập mật khẩu để tiếp tục.
            </p>
            <input
              type="password"
              className="form-input"
              placeholder="Nhập mật khẩu ghi chú"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              autoFocus
            />
            {error && <div className="form-error" style={{ marginTop: 8 }}>{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCancel}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
