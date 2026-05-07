import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        {/* Email verification banner */}
        {user && !user.email_verified_at && (
          <div className="verification-banner">
            ⚠️ Tài khoản chưa được xác minh. Vui lòng kiểm tra email để kích hoạt tài khoản.
          </div>
        )}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
