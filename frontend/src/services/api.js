import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

// Fetch CSRF cookie from Sanctum (called once before first state-changing request)
let csrfCookiePromise = null
async function ensureCsrfCookie() {
  if (!csrfCookiePromise) {
    csrfCookiePromise = axios.get('/sanctum/csrf-cookie', { withCredentials: true })
      .catch(() => { csrfCookiePromise = null })
  }
  return csrfCookiePromise
}

// Request interceptor - attach token + ensure CSRF cookie
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Ensure CSRF cookie exists for state-changing requests
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    await ensureCsrfCookie()
  }
  return config
})

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/dang-nhap') {
        window.location.href = '/dang-nhap'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// ===== AUTH API =====
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
}

// ===== NOTES API =====
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  get: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  togglePin: (id) => api.patch(`/notes/${id}/toggle-pin`),
  search: (params) => api.get('/notes/search', { params }),

  // Password protection
  setPassword: (id, data) => api.post(`/notes/${id}/password`, data),
  removePassword: (id, data) => api.delete(`/notes/${id}/password`, { data }),
  verifyPassword: (id, data) => api.post(`/notes/${id}/verify-password`, data),
  changePassword: (id, data) => api.put(`/notes/${id}/password`, data),

  // Images
  uploadImage: (id, formData) => api.post(`/notes/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (id, imageId) => api.delete(`/notes/${id}/images/${imageId}`),

  // Sharing
  share: (id, data) => api.post(`/notes/${id}/share`, data),
  getShareDetails: (id) => api.get(`/notes/${id}/share`),
  updateShare: (id, shareId, data) => api.put(`/notes/${id}/share/${shareId}`, data),
  revokeShare: (id, shareId) => api.delete(`/notes/${id}/share/${shareId}`),
  getSharedWithMe: (params) => api.get('/notes/shared-with-me', { params }),
}

// ===== LABELS API =====
export const labelsAPI = {
  getAll: () => api.get('/labels'),
  create: (data) => api.post('/labels', data),
  update: (id, data) => api.put(`/labels/${id}`, data),
  delete: (id) => api.delete(`/labels/${id}`),
  attachToNote: (noteId, labelIds) => api.post(`/notes/${noteId}/labels`, { label_ids: labelIds }),
}

// ===== PROFILE API =====
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  updateAvatar: (formData) => api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.put('/profile/password', data),
}

// ===== PREFERENCES API =====
export const preferencesAPI = {
  get: () => api.get('/preferences'),
  update: (data) => api.put('/preferences', data),
}

// ===== NOTIFICATIONS API =====
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
}
