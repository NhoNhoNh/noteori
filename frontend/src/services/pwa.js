/**
 * Đăng ký Service Worker cho PWA
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        console.log('SW registered:', registration.scope)

        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // Every hour
      } catch (error) {
        console.error('SW registration failed:', error)
      }
    })
  }
}

/**
 * Kiểm tra có online không
 */
export function useOnlineStatus() {
  // Returns current online status, see useEffect in component
  return navigator.onLine
}

/**
 * Request persistent storage for PWA
 */
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const granted = await navigator.storage.persist()
    if (granted) {
      console.log('Persistent storage granted')
    }
  }
}
