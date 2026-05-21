import axios from 'axios'

/**
 * Central HTTP client — JWT-ready:
 * - baseURL points at the Express API (proxied as /api in dev)
 * - request interceptor is where we will attach `Authorization: Bearer <token>`
 */
const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Placeholder for Phase 2+: read token from memory or localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('devconnect_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
