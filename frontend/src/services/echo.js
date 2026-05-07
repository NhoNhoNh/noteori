import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let echoInstance = null

export function getEcho() {
  if (echoInstance) return echoInstance

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'noteori-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/api/broadcasting/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
  })

  return echoInstance
}

/**
 * Tham gia channel realtime cho ghi chú
 * @param {number} noteId
 * @param {object} callbacks - { onUpdated, onJoining, onLeaving, onTyping }
 */
export function joinNoteChannel(noteId, callbacks = {}) {
  const echo = getEcho()

  const channel = echo.join(`note.${noteId}`)

  // Khi có user khác cập nhật ghi chú
  channel.listen('.note.updated', (data) => {
    if (callbacks.onUpdated) {
      callbacks.onUpdated(data)
    }
  })

  // Khi có user tham gia
  channel.here((users) => {
    if (callbacks.onHere) callbacks.onHere(users)
  })

  channel.joining((user) => {
    if (callbacks.onJoining) callbacks.onJoining(user)
  })

  channel.leaving((user) => {
    if (callbacks.onLeaving) callbacks.onLeaving(user)
  })

  // Typing indicator
  channel.listenForWhisper('typing', (data) => {
    if (callbacks.onTyping) callbacks.onTyping(data)
  })

  return channel
}

/**
 * Rời channel
 */
export function leaveNoteChannel(noteId) {
  const echo = getEcho()
  echo.leave(`note.${noteId}`)
}

/**
 * Gửi typing indicator
 */
export function sendTypingIndicator(noteId, user) {
  const echo = getEcho()
  const channel = echo.join(`note.${noteId}`)
  channel.whisper('typing', {
    user_id: user.id,
    user_name: user.name,
  })
}

/**
 * Lắng nghe thông báo cho user
 */
export function listenForNotifications(userId, callback) {
  const echo = getEcho()
  echo.private(`user.${userId}`)
    .listen('.notification.new', (data) => {
      callback(data)
    })
}
