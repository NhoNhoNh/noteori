import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import NotesPage from './pages/NotesPage'
import NoteEditorPage from './pages/NoteEditorPage'
import SharedNotesPage from './pages/SharedNotesPage'
import ProfilePage from './pages/ProfilePage'
import PreferencesPage from './pages/PreferencesPage'
import LabelsPage from './pages/LabelsPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Đang tải...</p></div>
  return user ? children : <Navigate to="/dang-nhap" />
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>
  return !user ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <Routes>
      {/* Guest Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/dang-nhap" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/dang-ky" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/quen-mat-khau" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/dat-lai-mat-khau" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      </Route>

      {/* Protected Routes */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/" element={<NotesPage />} />
        <Route path="/ghi-chu/:id?" element={<NoteEditorPage />} />
        <Route path="/ghi-chu-duoc-chia-se" element={<SharedNotesPage />} />
        <Route path="/nhan" element={<LabelsPage />} />
        <Route path="/ho-so" element={<ProfilePage />} />
        <Route path="/tuy-chinh" element={<PreferencesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
