import { useEffect, useState } from 'react'
import { useNotes } from '../contexts/NoteContext'
import { FiPlus, FiEdit3, FiTrash2, FiTag, FiCheck, FiX } from 'react-icons/fi'
import ConfirmDialog from '../components/ConfirmDialog'

export default function LabelsPage() {
  const { labels, fetchLabels, createLabel, updateLabel, deleteLabel } = useNotes()
  const [newLabel, setNewLabel] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchLabels() }, [fetchLabels])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newLabel.trim()) return
    await createLabel({ name: newLabel.trim() })
    setNewLabel('')
  }

  const handleEdit = (label) => {
    setEditingId(label.id)
    setEditingName(label.name)
  }

  const handleSaveEdit = async () => {
    if (!editingName.trim()) return
    await updateLabel(editingId, { name: editingName.trim() })
    setEditingId(null)
  }

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteLabel(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 24 }}>Quản lý nhãn</h2>

      {/* Create label */}
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input type="text" className="form-input" placeholder="Tên nhãn mới..." value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)} style={{ flex: 1 }} />
        <button type="submit" className="btn-primary"><FiPlus /> Thêm</button>
      </form>

      {/* Labels list */}
      {labels.length === 0 ? (
        <div className="empty-state">
          <FiTag />
          <h3>Chưa có nhãn nào</h3>
          <p>Tạo nhãn để phân loại ghi chú của bạn</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {labels.map(label => (
            <div key={label.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
              <FiTag style={{ color: 'var(--primary)', flexShrink: 0 }} />
              {editingId === label.id ? (
                <>
                  <input type="text" className="form-input" value={editingName}
                    onChange={(e) => setEditingName(e.target.value)} style={{ flex: 1 }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()} autoFocus />
                  <button className="btn-icon btn-sm" onClick={handleSaveEdit}><FiCheck style={{ color: 'var(--success)' }} /></button>
                  <button className="btn-icon btn-sm" onClick={() => setEditingId(null)}><FiX /></button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontWeight: 500 }}>{label.name}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{label.notes_count || 0} ghi chú</span>
                  <button className="btn-icon btn-sm" onClick={() => handleEdit(label)} title="Đổi tên"><FiEdit3 /></button>
                  <button className="btn-icon btn-sm" onClick={() => setDeleteTarget(label)} title="Xóa" style={{ color: 'var(--danger)' }}><FiTrash2 /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa nhãn"
          message={`Bạn có chắc muốn xóa nhãn "${deleteTarget.name}"? Các ghi chú có nhãn này sẽ không bị ảnh hưởng.`}
          confirmText="Xóa"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
