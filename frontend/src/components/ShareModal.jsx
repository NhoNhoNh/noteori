import { useState, useEffect } from 'react'
import { notesAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiX, FiTrash2, FiMail, FiEdit3, FiEye } from 'react-icons/fi'

export default function ShareModal({ noteId, onClose }) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('read')
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadShares()
  }, [noteId])

  const loadShares = async () => {
    try {
      const res = await notesAPI.getShareDetails(noteId)
      setShares(res.data.data || [])
    } catch {}
  }

  const handleShare = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Vui lòng nhập email'); return }
    setLoading(true)
    try {
      await notesAPI.share(noteId, { email, permission })
      toast.success(`Đã chia sẻ ghi chú với ${email}`)
      setEmail('')
      loadShares()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể chia sẻ')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (shareId) => {
    try {
      await notesAPI.revokeShare(noteId, shareId)
      setShares(prev => prev.filter(s => s.id !== shareId))
      toast.success('Đã thu hồi quyền truy cập')
    } catch {
      toast.error('Không thể thu hồi')
    }
  }

  const handleUpdatePermission = async (shareId, newPerm) => {
    try {
      await notesAPI.updateShare(noteId, shareId, { permission: newPerm })
      setShares(prev => prev.map(s => s.id === shareId ? { ...s, permission: newPerm } : s))
      toast.success('Đã cập nhật quyền')
    } catch {
      toast.error('Không thể cập nhật quyền')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chia sẻ ghi chú</h2>
          <button className="btn-icon" onClick={onClose}><FiX /></button>
        </div>
        <div className="modal-body">
          {/* Share form */}
          <form onSubmit={handleShare} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" className="form-input" style={{ paddingLeft: 38 }}
                placeholder="Nhập email người nhận" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <select className="form-input" style={{ width: 140 }} value={permission} onChange={(e) => setPermission(e.target.value)}>
              <option value="read">Chỉ đọc</option>
              <option value="edit">Chỉnh sửa</option>
            </select>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '...' : 'Chia sẻ'}
            </button>
          </form>

          {/* Shared list */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
              Người được chia sẻ ({shares.length})
            </h4>
            {shares.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 20 }}>
                Ghi chú chưa được chia sẻ với ai
              </p>
            ) : (
              shares.map(share => (
                <div key={share.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <img
                    src={share.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(share.user?.name || share.email)}&background=6366f1&color=fff&size=32`}
                    alt="" className="avatar avatar-sm"
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{share.user?.name || share.email}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{share.email}</div>
                  </div>
                  <select
                    className="form-input"
                    style={{ width: 120, padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                    value={share.permission}
                    onChange={(e) => handleUpdatePermission(share.id, e.target.value)}
                  >
                    <option value="read">Chỉ đọc</option>
                    <option value="edit">Chỉnh sửa</option>
                  </select>
                  <button className="btn-icon btn-sm" onClick={() => handleRevoke(share.id)} title="Thu hồi" style={{ color: 'var(--danger)' }}>
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
