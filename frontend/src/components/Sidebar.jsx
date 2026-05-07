import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotes } from '../contexts/NoteContext'
import { useEffect } from 'react'
import { FiHome, FiTag, FiShare2, FiUser, FiSettings, FiLogOut, FiX } from 'react-icons/fi'

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth()
  const { labels, fetchLabels, setSelectedLabel } = useNotes()
  const navigate = useNavigate()

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  const handleLogout = async () => {
    await logout()
    navigate('/dang-nhap')
  }

  const handleLabelClick = (labelId) => {
    setSelectedLabel(labelId)
    navigate('/')
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99,
        display: 'none',
      }} />}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
            N
          </div>
          <h1>Noteori</h1>
          <button className="btn-icon" onClick={onClose} style={{ marginLeft: 'auto', display: 'none' }}>
            <FiX />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FiHome /> Ghi chú của tôi
          </NavLink>
          <NavLink to="/ghi-chu-duoc-chia-se" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FiShare2 /> Được chia sẻ
          </NavLink>
          <NavLink to="/nhan" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FiTag /> Quản lý nhãn
          </NavLink>

          {/* Labels section */}
          {labels.length > 0 && (
            <>
              <div className="sidebar-section-title">Nhãn</div>
              {labels.map(label => (
                <button
                  key={label.id}
                  className="sidebar-nav-item"
                  onClick={() => handleLabelClick(label.id)}
                >
                  <FiTag style={{ color: label.color || 'var(--primary)' }} />
                  {label.name}
                </button>
              ))}
            </>
          )}

          <div className="sidebar-section-title">Tài khoản</div>
          <NavLink to="/ho-so" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FiUser /> Hồ sơ
          </NavLink>
          <NavLink to="/tuy-chinh" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
            <FiSettings /> Tùy chỉnh
          </NavLink>
          <button className="sidebar-nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <FiLogOut /> Đăng xuất
          </button>
        </nav>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-overlay { display: block !important; }
          .app-sidebar .btn-icon { display: flex !important; }
        }
      `}</style>
    </>
  )
}
