import { useEffect } from 'react'
import { useNotes } from '../contexts/NoteContext'
import NoteCard from '../components/NoteCard'
import { FiShare2 } from 'react-icons/fi'

export default function SharedNotesPage() {
  const { sharedNotes, fetchSharedNotes, viewMode, toggleViewMode } = useNotes()

  useEffect(() => {
    fetchSharedNotes()
  }, [fetchSharedNotes])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Ghi chú được chia sẻ</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
            {sharedNotes.length} ghi chú được chia sẻ với bạn
          </p>
        </div>
      </div>

      {sharedNotes.length === 0 ? (
        <div className="empty-state">
          <FiShare2 />
          <h3>Chưa có ghi chú được chia sẻ</h3>
          <p>Khi ai đó chia sẻ ghi chú với bạn, chúng sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'notes-grid' : 'notes-list'}>
          {sharedNotes.map(item => (
            <div key={item.id} className="note-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <img
                  src={item.owner?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.owner?.name || '')}&background=6366f1&color=fff&size=28`}
                  alt="" className="avatar avatar-sm"
                />
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{item.owner?.name}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>
                    {item.permission === 'edit' ? '✏️ Chỉnh sửa được' : '👁️ Chỉ đọc'}
                  </span>
                </div>
              </div>
              <h4 className="note-card-title">{item.note?.title || 'Không tiêu đề'}</h4>
              <p className="note-card-content">{item.note?.content || 'Không có nội dung'}</p>
              <div className="note-card-footer">
                <span className="note-card-date">
                  Chia sẻ: {new Date(item.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
