import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotes } from '../contexts/NoteContext'
import NoteCard from '../components/NoteCard'
import ConfirmDialog from '../components/ConfirmDialog'
import PasswordVerifyModal from '../components/PasswordVerifyModal'
import { FiGrid, FiList, FiPlus, FiFileText } from 'react-icons/fi'

export default function NotesPage() {
  const {
    notes, loading, viewMode, toggleViewMode,
    fetchNotes, deleteNote, togglePin,
    searchQuery, selectedLabel, setSelectedLabel,
  } = useNotes()
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [passwordTarget, setPasswordTarget] = useState(null)
  const [passwordAction, setPasswordAction] = useState(null)

  useEffect(() => {
    fetchNotes({
      search: searchQuery || undefined,
      label_id: selectedLabel || undefined,
    })
  }, [fetchNotes, searchQuery, selectedLabel])

  // Sort: pinned first (by pin_time desc), then by updated_at desc
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    if (a.is_pinned && b.is_pinned) {
      return new Date(b.pinned_at) - new Date(a.pinned_at)
    }
    return new Date(b.updated_at) - new Date(a.updated_at)
  })

  const pinnedNotes = sortedNotes.filter(n => n.is_pinned)
  const unpinnedNotes = sortedNotes.filter(n => !n.is_pinned)

  const handleNoteClick = (note) => {
    if (note.has_password) {
      setPasswordTarget(note)
      setPasswordAction('view')
    } else {
      navigate(`/ghi-chu/${note.id}`)
    }
  }

  const handleDeleteClick = (note) => {
    if (note.has_password) {
      setPasswordTarget(note)
      setPasswordAction('delete')
    } else {
      setDeleteTarget(note)
    }
  }

  const handlePasswordVerified = () => {
    if (passwordAction === 'view') {
      navigate(`/ghi-chu/${passwordTarget.id}`)
    } else if (passwordAction === 'delete') {
      setDeleteTarget(passwordTarget)
    }
    setPasswordTarget(null)
    setPasswordAction(null)
  }

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteNote(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const renderNotes = (notesList, title) => {
    if (notesList.length === 0) return null
    return (
      <div style={{ marginBottom: 24 }}>
        {title && <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{title}</h3>}
        <div className={viewMode === 'grid' ? 'notes-grid' : 'notes-list'}>
          {notesList.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              viewMode={viewMode}
              onClick={() => handleNoteClick(note)}
              onPin={() => togglePin(note.id)}
              onDelete={() => handleDeleteClick(note)}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
            {selectedLabel ? 'Ghi chú theo nhãn' : 'Ghi chú của tôi'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
            {notes.length} ghi chú
            {selectedLabel && (
              <button onClick={() => setSelectedLabel(null)} style={{ marginLeft: 8, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-family)' }}>
                × Xóa bộ lọc
              </button>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-icon" onClick={toggleViewMode} title={viewMode === 'grid' ? 'Xem dạng danh sách' : 'Xem dạng lưới'} id="btn-toggle-view">
            {viewMode === 'grid' ? <FiList /> : <FiGrid />}
          </button>
          <button className="btn-primary" onClick={() => navigate('/ghi-chu')} id="btn-create-note">
            <FiPlus /> Tạo ghi chú
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Đang tải ghi chú...</p>
        </div>
      )}

      {/* Notes */}
      {!loading && notes.length === 0 && (
        <div className="empty-state">
          <FiFileText />
          <h3>Chưa có ghi chú nào</h3>
          <p>Nhấn "Tạo ghi chú" để bắt đầu viết ghi chú đầu tiên</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/ghi-chu')}>
            <FiPlus /> Tạo ghi chú đầu tiên
          </button>
        </div>
      )}

      {!loading && notes.length > 0 && (
        <>
          {renderNotes(pinnedNotes, pinnedNotes.length > 0 ? 'Đã ghim' : null)}
          {renderNotes(unpinnedNotes, pinnedNotes.length > 0 ? 'Khác' : null)}
        </>
      )}

      {/* Confirm delete dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Xóa ghi chú"
          message={`Bạn có chắc chắn muốn xóa ghi chú "${deleteTarget.title || 'Không tiêu đề'}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Password verify modal */}
      {passwordTarget && (
        <PasswordVerifyModal
          noteId={passwordTarget.id}
          onVerified={handlePasswordVerified}
          onCancel={() => { setPasswordTarget(null); setPasswordAction(null) }}
        />
      )}
    </div>
  )
}
