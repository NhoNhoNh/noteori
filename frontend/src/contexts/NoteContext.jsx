import { createContext, useContext, useState, useCallback } from 'react'
import { notesAPI, labelsAPI } from '../services/api'
import { toast } from 'react-toastify'

const NoteContext = createContext(null)

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [sharedNotes, setSharedNotes] = useState([])
  const [labels, setLabels] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'grid')
  const [selectedLabel, setSelectedLabel] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const next = prev === 'grid' ? 'list' : 'grid'
      localStorage.setItem('viewMode', next)
      return next
    })
  }, [])

  // Fetch notes
  const fetchNotes = useCallback(async (params = {}) => {
    setLoading(true)
    try {
      const res = await notesAPI.getAll(params)
      setNotes(res.data.data)
    } catch (err) {
      toast.error('Không thể tải ghi chú')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch shared notes
  const fetchSharedNotes = useCallback(async () => {
    try {
      const res = await notesAPI.getSharedWithMe()
      setSharedNotes(res.data.data)
    } catch {
      toast.error('Không thể tải ghi chú được chia sẻ')
    }
  }, [])

  // Fetch labels
  const fetchLabels = useCallback(async () => {
    try {
      const res = await labelsAPI.getAll()
      setLabels(res.data.data)
    } catch {
      toast.error('Không thể tải nhãn')
    }
  }, [])

  // Create note
  const createNote = useCallback(async (data) => {
    const res = await notesAPI.create(data)
    setNotes(prev => [res.data.data, ...prev])
    return res.data.data
  }, [])

  // Update note
  const updateNote = useCallback(async (id, data) => {
    const res = await notesAPI.update(id, data)
    setNotes(prev => prev.map(n => n.id === id ? res.data.data : n))
    return res.data.data
  }, [])

  // Delete note
  const deleteNote = useCallback(async (id) => {
    await notesAPI.delete(id)
    setNotes(prev => prev.filter(n => n.id !== id))
    toast.success('Đã xóa ghi chú')
  }, [])

  // Toggle pin
  const togglePin = useCallback(async (id) => {
    const res = await notesAPI.togglePin(id)
    setNotes(prev => prev.map(n => n.id === id ? res.data.data : n))
  }, [])

  // Create label
  const createLabel = useCallback(async (data) => {
    const res = await labelsAPI.create(data)
    setLabels(prev => [...prev, res.data.data])
    toast.success('Đã tạo nhãn mới')
    return res.data.data
  }, [])

  // Update label
  const updateLabel = useCallback(async (id, data) => {
    const res = await labelsAPI.update(id, data)
    setLabels(prev => prev.map(l => l.id === id ? res.data.data : l))
    toast.success('Đã cập nhật nhãn')
    return res.data.data
  }, [])

  // Delete label
  const deleteLabel = useCallback(async (id) => {
    await labelsAPI.delete(id)
    setLabels(prev => prev.filter(l => l.id !== id))
    toast.success('Đã xóa nhãn')
  }, [])

  const value = {
    notes, setNotes,
    sharedNotes, setSharedNotes,
    labels, setLabels,
    loading,
    viewMode, toggleViewMode,
    selectedLabel, setSelectedLabel,
    searchQuery, setSearchQuery,
    fetchNotes, fetchSharedNotes, fetchLabels,
    createNote, updateNote, deleteNote, togglePin,
    createLabel, updateLabel, deleteLabel,
  }

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>
}

export function useNotes() {
  const context = useContext(NoteContext)
  if (!context) throw new Error('useNotes phải được sử dụng trong NoteProvider')
  return context
}
