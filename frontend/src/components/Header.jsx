import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNotes } from '../contexts/NoteContext'
import { FiMenu, FiSearch, FiPlus, FiBell, FiSun, FiMoon } from 'react-icons/fi'
import { notificationsAPI } from '../services/api'

export default function Header({ onMenuClick }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { searchQuery, setSearchQuery, viewMode, toggleViewMode } = useNotes()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()
  const searchTimerRef = useRef(null)

  // Debounce search
  const handleSearch = useCallback((value) => {
    setSearchQuery(value)
  }, [setSearchQuery])

  const onSearchChange = (e) => {
    const value = e.target.value
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => handleSearch(value), 300)
  }

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationsAPI.getAll({ unread: true })
        setNotifications(res.data.data || [])
      } catch {
        // Silently fail
      }
    }
    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter(n => !n.read_at).length

  const handleReadNotification = async (id) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    } catch {
      // Silently fail
    }
  }

  const handleToggleNotifications = async () => {
    const willShow = !showNotifications
    setShowNotifications(willShow)
    
    // Auto mark all as read when opening the menu
    if (willShow && unreadCount > 0) {
      try {
        await notificationsAPI.markAllAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })))
      } catch {
        // Silently fail
      }
    }
  }

  return (
    <header className="app-header">
      {/* Mobile menu */}
      <button className="btn-icon" onClick={onMenuClick} style={{ marginRight: 12, display: 'none' }}>
        <FiMenu />
      </button>

      {/* Search */}
      <div className="search-box">
        <FiSearch />
        <input
          type="text"
          placeholder="Tìm kiếm ghi chú..."
          defaultValue={searchQuery}
          onChange={onSearchChange}
          id="search-input"
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        <button className="btn-primary btn-sm" onClick={() => navigate('/ghi-chu')} id="btn-new-note">
          <FiPlus /> Tạo mới
        </button>

        <button className="btn-icon" onClick={toggleTheme} title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}>
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>

        <div style={{ position: 'relative' }}>
          <button className="btn-icon" onClick={handleToggleNotifications} id="btn-notifications">
            <FiBell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', right: 0, width: 320, maxHeight: 400, overflowY: 'auto', zIndex: 9999, padding: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>
                Thông báo
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  Không có thông báo mới
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className="dropdown-item" 
                    style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer', opacity: n.read_at ? 0.6 : 1 }}
                    onClick={() => handleReadNotification(n.id)}
                  >
                    <span style={{ fontWeight: n.read_at ? 400 : 600, fontSize: 'var(--font-size-sm)' }}>{n.message}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        {user && (
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
            alt={user.name}
            className="avatar avatar-sm"
            style={{ cursor: 'pointer', marginLeft: 4 }}
            onClick={() => navigate('/ho-so')}
          />
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .app-header .btn-icon:first-child { display: flex !important; }
        }
        @media (max-width: 480px) {
          .btn-primary span { display: none; }
        }
      `}</style>
    </header>
  )
}
