import { FiMapPin, FiLock, FiShare2, FiTrash2, FiImage } from 'react-icons/fi'

export default function NoteCard({ note, viewMode, onClick, onPin, onDelete }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (viewMode === 'list') {
    return (
      <div className={`note-list-item ${note.is_pinned ? 'pinned' : ''}`} onClick={onClick}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {note.title || 'Không tiêu đề'}
            </span>
            <div className="note-card-icons">
              {note.is_pinned && <FiMapPin style={{ color: 'var(--warning)' }} />}
              {note.has_password && <FiLock style={{ color: 'var(--danger)' }} />}
              {note.is_shared && <FiShare2 style={{ color: 'var(--accent)' }} />}
              {note.images_count > 0 && <FiImage style={{ color: 'var(--text-muted)' }} />}
            </div>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.has_password ? '🔒 Nội dung được bảo vệ' : (note.content || 'Không có nội dung')}
          </p>
        </div>
        {note.labels && note.labels.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {note.labels.slice(0, 2).map(l => <span key={l.id} className="label-badge">{l.name}</span>)}
          </div>
        )}
        <span className="note-card-date">{formatDate(note.updated_at)}</span>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button className="btn-icon btn-sm" onClick={onPin} title={note.is_pinned ? 'Bỏ ghim' : 'Ghim'}>
            <FiMapPin style={{ color: note.is_pinned ? 'var(--warning)' : undefined }} />
          </button>
          <button className="btn-icon btn-sm" onClick={onDelete} title="Xóa" style={{ color: 'var(--danger)' }}>
            <FiTrash2 />
          </button>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className={`note-card ${note.is_pinned ? 'pinned' : ''}`} onClick={onClick} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Labels */}
      {note.labels && note.labels.length > 0 && (
        <div className="note-card-labels">
          {note.labels.map(l => <span key={l.id} className="label-badge">{l.name}</span>)}
        </div>
      )}

      {/* Title */}
      <h4 className="note-card-title">{note.title || 'Không tiêu đề'}</h4>

      {/* Content preview */}
      <p className="note-card-content">
        {note.has_password ? '🔒 Nội dung được bảo vệ bằng mật khẩu' : (note.content || 'Không có nội dung')}
      </p>

      {/* Image preview */}
      {note.first_image && !note.has_password && (
        <div style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: 120 }}>
          <img src={note.first_image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
        </div>
      )}

      {/* Footer */}
      <div className="note-card-footer">
        <span className="note-card-date">{formatDate(note.updated_at)}</span>
        <div className="note-card-icons">
          {note.is_pinned && <FiMapPin style={{ color: 'var(--warning)' }} title="Đã ghim" />}
          {note.has_password && <FiLock style={{ color: 'var(--danger)' }} title="Bảo vệ mật khẩu" />}
          {note.is_shared && <FiShare2 style={{ color: 'var(--accent)' }} title="Đã chia sẻ" />}
          {note.images_count > 0 && <FiImage title={`${note.images_count} ảnh`} />}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
        <button className="btn-icon btn-sm" onClick={onPin} title={note.is_pinned ? 'Bỏ ghim' : 'Ghim'} style={{ flex: 1 }}>
          <FiMapPin style={{ color: note.is_pinned ? 'var(--warning)' : undefined }} />
        </button>
        <button className="btn-icon btn-sm" onClick={onDelete} title="Xóa" style={{ flex: 1, color: 'var(--danger)' }}>
          <FiTrash2 />
        </button>
      </div>
    </div>
  )
}
