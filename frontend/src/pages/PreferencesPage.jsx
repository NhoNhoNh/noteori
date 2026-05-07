import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { preferencesAPI } from '../services/api'
import { toast } from 'react-toastify'
import { FiSun, FiMoon, FiType, FiDroplet } from 'react-icons/fi'

const NOTE_COLORS = [
  { value: 'default', label: 'Mặc định', color: '#ffffff' },
  { value: 'yellow', label: 'Vàng', color: '#fef9c3' },
  { value: 'green', label: 'Xanh lá', color: '#dcfce7' },
  { value: 'blue', label: 'Xanh dương', color: '#dbeafe' },
  { value: 'pink', label: 'Hồng', color: '#fce7f3' },
  { value: 'purple', label: 'Tím', color: '#f3e8ff' },
]

export default function PreferencesPage() {
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme()
  const [noteColor, setNoteColor] = useState('default')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const res = await preferencesAPI.get()
      const prefs = res.data.data
      if (prefs.note_color) setNoteColor(prefs.note_color)
    } catch {}
  }

  const savePreference = async (key, value) => {
    setSaving(true)
    try {
      await preferencesAPI.update({ [key]: value })
      toast.success('Đã lưu tùy chỉnh')
    } catch {
      toast.error('Không thể lưu tùy chỉnh')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>Tùy chỉnh</h2>

      {/* Theme */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {theme === 'light' ? <FiSun size={20} /> : <FiMoon size={20} />}
            <div>
              <h4 style={{ fontWeight: 600 }}>Chế độ hiển thị</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                {theme === 'light' ? 'Chế độ sáng' : 'Chế độ tối'}
              </p>
            </div>
          </div>
          <div className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => { toggleTheme(); savePreference('theme', theme === 'light' ? 'dark' : 'light') }} />
        </div>
      </div>

      {/* Font size */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <FiType size={20} />
          <div>
            <h4 style={{ fontWeight: 600 }}>Kích thước phông chữ</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Thay đổi kích thước chữ trên ghi chú</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: 'small', label: 'Nhỏ', size: 14 },
            { value: 'medium', label: 'Vừa', size: 16 },
            { value: 'large', label: 'Lớn', size: 18 },
          ].map(opt => (
            <button key={opt.value}
              className={fontSize === opt.value ? 'btn-primary' : 'btn-secondary'}
              onClick={() => { setFontSize(opt.value); savePreference('font_size', opt.value) }}
              style={{ flex: 1, justifyContent: 'center', fontSize: opt.size }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note color */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <FiDroplet size={20} />
          <div>
            <h4 style={{ fontWeight: 600 }}>Màu ghi chú</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Chọn màu nền mặc định cho ghi chú</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {NOTE_COLORS.map(c => (
            <button key={c.value} onClick={() => { setNoteColor(c.value); savePreference('note_color', c.value) }}
              style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: c.color, border: noteColor === c.value ? '3px solid var(--primary)' : '2px solid var(--border-color)',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title={c.label}>
              {noteColor === c.value && <span style={{ fontSize: 18 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
