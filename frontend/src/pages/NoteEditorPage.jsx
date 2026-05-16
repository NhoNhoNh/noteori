import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotes } from '../contexts/NoteContext'
import { notesAPI, labelsAPI } from '../services/api'
import { joinNoteChannel, leaveNoteChannel, sendTypingIndicator } from '../services/echo'
import { toast } from 'react-toastify'
import { FiArrowLeft, FiImage, FiMapPin, FiLock, FiShare2, FiTag, FiTrash2, FiCheck, FiX, FiUsers } from 'react-icons/fi'
import ShareModal from '../components/ShareModal'
import NotePasswordModal from '../components/NotePasswordModal'

export default function NoteEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { labels, fetchLabels, createNote, updateNote, createLabel } = useNotes()
  const [note, setNote] = useState({ title: '', content: '' })
  const [noteLabels, setNoteLabels] = useState([])
  const [noteImages, setNoteImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [collaborators, setCollaborators] = useState([])
  const [typingUser, setTypingUser] = useState(null)
  const autoSaveTimer = useRef(null)
  const typingTimerRef = useRef(null)
  const noteIdRef = useRef(id || null)
  const isCreatingRef = useRef(false)
  const pendingUpdateRef = useRef(null)
  const isNewNote = !id
  const isRemoteUpdate = useRef(false)

  // Load note if editing
  useEffect(() => {
    if (id) {
      loadNote(id)
    }
    fetchLabels()
  }, [id, fetchLabels])

  const loadNote = async (noteId) => {
    try {
      const res = await notesAPI.get(noteId)
      const data = res.data.data
      setNote({ title: data.title || '', content: data.content || '', has_password: data.has_password })
      setNoteLabels(data.labels || [])
      setNoteImages(data.images || [])
    } catch (err) {
      toast.error('Không thể tải ghi chú')
      navigate('/')
    }
  }

  // Auto-save logic
  const autoSave = useCallback(async (data) => {
    if (isCreatingRef.current) {
      pendingUpdateRef.current = data
      return
    }

    setSaving(true)
    try {
      if (noteIdRef.current) {
        // Update existing
        await notesAPI.update(noteIdRef.current, data)
      } else {
        // Create new
        isCreatingRef.current = true
        const res = await notesAPI.create(data)
        noteIdRef.current = res.data.data.id
        // Update URL without reload
        window.history.replaceState(null, '', `/ghi-chu/${res.data.data.id}`)
        isCreatingRef.current = false

        if (pendingUpdateRef.current) {
          const queuedData = pendingUpdateRef.current
          pendingUpdateRef.current = null
          await notesAPI.update(noteIdRef.current, queuedData)
        }
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      isCreatingRef.current = false
      toast.error('Không thể lưu ghi chú')
    } finally {
      if (!isCreatingRef.current && !pendingUpdateRef.current) {
        setSaving(false)
      }
    }
  }, [])

  const handleChange = (field, value) => {
    if (isRemoteUpdate.current) return
    const updated = { ...note, [field]: value }
    setNote(updated)
    setSaved(false)

    // Send typing indicator
    if (noteIdRef.current && user) {
      sendTypingIndicator(noteIdRef.current, user)
    }

    // Debounce auto-save
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      if (updated.title.trim() || updated.content.trim()) {
        autoSave(updated)
      }
    }, 1000)
  }

  // Cleanup timer + WebSocket channel
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      if (noteIdRef.current) leaveNoteChannel(noteIdRef.current)
    }
  }, [])

  // Join realtime channel when note is loaded
  useEffect(() => {
    if (!noteIdRef.current) return

    const channel = joinNoteChannel(noteIdRef.current, {
      onUpdated: (data) => {
        // Only apply if from another user
        if (data.updated_by !== user?.id) {
          isRemoteUpdate.current = true
          setNote(prev => ({
            ...prev,
            title: data.title ?? prev.title,
            content: data.content ?? prev.content,
          }))
          setTimeout(() => { isRemoteUpdate.current = false }, 100)
        }
      },
      onHere: (users) => setCollaborators(users),
      onJoining: (u) => {
        setCollaborators(prev => [...prev, u])
        toast.info(`${u.name} đã tham gia chỉnh sửa`)
      },
      onLeaving: (u) => {
        setCollaborators(prev => prev.filter(c => c.id !== u.id))
      },
      onTyping: (data) => {
        if (data.user_id !== user?.id) {
          setTypingUser(data.user_name)
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
          typingTimerRef.current = setTimeout(() => setTypingUser(null), 2000)
        }
      },
    })

    return () => leaveNoteChannel(noteIdRef.current)
  }, [noteIdRef.current, user?.id])

  // Image upload
  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files.length) return
    if (!noteIdRef.current) {
      // Save note first
      await autoSave(note)
    }
    for (const file of files) {
      const formData = new FormData()
      formData.append('image', file)
      try {
        const res = await notesAPI.uploadImage(noteIdRef.current, formData)
        setNoteImages(prev => [...prev, res.data.data])
        toast.success('Đã tải ảnh lên')
      } catch {
        toast.error('Không thể tải ảnh lên')
      }
    }
    e.target.value = ''
  }

  // Delete image
  const handleDeleteImage = async (imageId) => {
    try {
      await notesAPI.deleteImage(noteIdRef.current, imageId)
      setNoteImages(prev => prev.filter(img => img.id !== imageId))
    } catch {
      toast.error('Không thể xóa ảnh')
    }
  }

  // Toggle pin
  const handleTogglePin = async () => {
    if (!noteIdRef.current) return
    try {
      const res = await notesAPI.togglePin(noteIdRef.current)
      toast.success(res.data.data.is_pinned ? 'Đã ghim ghi chú' : 'Đã bỏ ghim')
    } catch {
      toast.error('Không thể thay đổi trạng thái ghim')
    }
  }

  // Label toggle
  const handleLabelToggle = async (label) => {
    if (!noteIdRef.current) {
      await autoSave(note)
    }
    const isAttached = noteLabels.some(l => l.id === label.id)
    const newLabels = isAttached
      ? noteLabels.filter(l => l.id !== label.id)
      : [...noteLabels, label]
    setNoteLabels(newLabels)
    try {
      await labelsAPI.attachToNote(noteIdRef.current, newLabels.map(l => l.id))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error('Không thể cập nhật nhãn')
    }
  }

  const handleCreateLabelInline = async (e) => {
    e.preventDefault()
    if (!newLabelName.trim()) return
    try {
      const newLabel = await createLabel({ name: newLabelName.trim() })
      setNewLabelName('')
      handleLabelToggle(newLabel)
    } catch {
      // Error is handled in context
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn-icon" onClick={() => navigate('/')} title="Quay lại">
          <FiArrowLeft />
        </button>

        <div style={{ flex: 1 }} />

        {/* Collaborators */}
        {collaborators.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--accent)', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
            <FiUsers size={14} />
            <span>{collaborators.length} người đang chỉnh sửa</span>
          </div>
        )}

        {/* Typing indicator */}
        {typingUser && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent)', fontStyle: 'italic' }}>
            {typingUser} đang gõ...
          </span>
        )}

        {/* Save status */}
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {saving && <><div className="spinner" style={{ width: 14, height: 14 }}></div> Đang lưu...</>}
          {saved && <><FiCheck style={{ color: 'var(--success)' }} /> Đã lưu</>}
        </span>

        <button className="btn-icon" onClick={handleTogglePin} title="Ghim">
          <FiMapPin />
        </button>

        <label className="btn-icon" title="Đính kèm ảnh" style={{ cursor: 'pointer' }}>
          <FiImage />
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
        </label>

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button type="button" className="btn-icon" onClick={(e) => {
            e.preventDefault();
            setShowLabelPicker(prev => !prev);
          }} title="Nhãn">
            <FiTag />
          </button>
          {showLabelPicker && (
            <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: 240, zIndex: 9999, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', opacity: 1 }}>
              <div style={{ padding: '8px 12px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Chọn nhãn</div>
              
              <div style={{ padding: '4px 8px' }}>
                <form onSubmit={handleCreateLabelInline} style={{ display: 'flex', gap: 4 }}>
                  <input
                    type="text"
                    value={newLabelName || ''}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Tên nhãn mới..."
                    className="form-input"
                    style={{ padding: '6px 8px', fontSize: 'var(--font-size-xs)' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button type="submit" className="btn-primary btn-sm" disabled={!newLabelName?.trim()}>
                    Tạo
                  </button>
                </form>
              </div>

              <div className="dropdown-divider" style={{ margin: '8px 0' }}></div>

              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {Array.isArray(labels) && labels.map(label => {
                  const isAttached = Array.isArray(noteLabels) && noteLabels.some(l => l.id === label.id);
                  return (
                    <button type="button" key={label.id} className="dropdown-item" onClick={(e) => { e.preventDefault(); handleLabelToggle(label); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                      {isAttached ? <FiCheck style={{ color: 'var(--success)', flexShrink: 0 }} /> : <span style={{ width: 14, display: 'inline-block', flexShrink: 0 }} />}
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label.name}</span>
                    </button>
                  );
                })}
                {(!Array.isArray(labels) || labels.length === 0) && (
                  <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>Chưa có nhãn</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button className="btn-icon" onClick={() => setShowPasswordModal(true)} title="Bảo vệ mật khẩu">
          <FiLock />
        </button>

        {noteIdRef.current && (
          <button className="btn-icon" onClick={() => setShowShareModal(true)} title="Chia sẻ">
            <FiShare2 />
          </button>
        )}
      </div>

      {/* Labels display */}
      {noteLabels.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {noteLabels.map(l => (
            <span key={l.id} className="label-badge" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {l.name}
              <FiX style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => handleLabelToggle(l)} />
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        className="form-input"
        placeholder="Tiêu đề ghi chú..."
        value={note.title}
        onChange={(e) => handleChange('title', e.target.value)}
        style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, border: 'none', padding: '8px 0', background: 'transparent', marginBottom: 12 }}
        id="note-title"
      />

      {/* Content */}
      <textarea
        className="form-input form-textarea"
        placeholder="Bắt đầu viết ghi chú..."
        value={note.content}
        onChange={(e) => handleChange('content', e.target.value)}
        style={{ fontSize: 'var(--font-size-base)', border: 'none', padding: '8px 0', background: 'transparent', minHeight: 400, resize: 'none' }}
        id="note-content"
      />

      {/* Images */}
      {noteImages.length > 0 && (
        <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 12 }}>Ảnh đính kèm ({noteImages.length})</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {noteImages.map(img => (
              <div key={img.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={img.url} alt="" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && noteIdRef.current && (
        <ShareModal noteId={noteIdRef.current} onClose={() => setShowShareModal(false)} />
      )}

      {/* Password Modal */}
      {showPasswordModal && noteIdRef.current && (
        <NotePasswordModal 
          noteId={noteIdRef.current} 
          hasPassword={note.has_password} 
          onClose={() => setShowPasswordModal(false)} 
          onSuccess={() => loadNote(noteIdRef.current)}
        />
      )}
    </div>
  )
}
