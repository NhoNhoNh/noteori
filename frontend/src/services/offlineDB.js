import { openDB } from 'idb'

const DB_NAME = 'noteori-offline'
const DB_VERSION = 1

// Initialize IndexedDB
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Notes store
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' })
        noteStore.createIndex('updated_at', 'updated_at')
        noteStore.createIndex('is_pinned', 'is_pinned')
      }

      // Pending sync queue
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
      }

      // Labels store
      if (!db.objectStoreNames.contains('labels')) {
        db.createObjectStore('labels', { keyPath: 'id' })
      }

      // User preferences
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'key' })
      }
    },
  })
}

// ===== Notes Operations =====
export async function saveNotesOffline(notes) {
  const db = await initDB()
  const tx = db.transaction('notes', 'readwrite')
  for (const note of notes) {
    await tx.store.put({ ...note, _synced: true })
  }
  await tx.done
}

export async function getOfflineNotes() {
  const db = await initDB()
  return db.getAll('notes')
}

export async function saveNoteOffline(note) {
  const db = await initDB()
  await db.put('notes', { ...note, _synced: false, _offline_updated: Date.now() })
}

export async function deleteNoteOffline(id) {
  const db = await initDB()
  await db.delete('notes', id)
}

// ===== Sync Queue =====
export async function addToSyncQueue(action) {
  const db = await initDB()
  await db.add('sync_queue', {
    ...action,
    timestamp: Date.now(),
  })
}

export async function getSyncQueue() {
  const db = await initDB()
  return db.getAll('sync_queue')
}

export async function clearSyncQueue() {
  const db = await initDB()
  await db.clear('sync_queue')
}

// ===== Labels =====
export async function saveLabelsOffline(labels) {
  const db = await initDB()
  const tx = db.transaction('labels', 'readwrite')
  await tx.store.clear()
  for (const label of labels) {
    await tx.store.put(label)
  }
  await tx.done
}

export async function getOfflineLabels() {
  const db = await initDB()
  return db.getAll('labels')
}

// ===== Online/Offline detection =====
export function isOnline() {
  return navigator.onLine
}

export function onOnlineStatusChange(callback) {
  window.addEventListener('online', () => callback(true))
  window.addEventListener('offline', () => callback(false))
}
