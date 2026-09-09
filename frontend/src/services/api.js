import axios from 'axios'
import { AUTH_INVALID_EVENT, getToken, removeToken } from './tokenStorage'

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json' },
}

export class ApiError extends Error {
  constructor(error) {
    const status = error.response?.status ?? null
    const body = error.response?.data
    const isTimeout = ['ECONNABORTED', 'ETIMEDOUT'].includes(error.code)
    const isCanceled = axios.isCancel(error)
    const isNetworkError =
      !error.response && Boolean(error.request) && !isTimeout && !isCanceled
    const message =
      error.code === 'ERR_API_CONFIGURATION'
        ? 'Configure VITE_API_BASE_URL in frontend/.env and restart Vite.'
        : typeof body?.message === 'string'
          ? body.message
          : isCanceled
            ? 'Request was canceled.'
            : isTimeout
              ? 'The request timed out. Please try again.'
              : isNetworkError
                ? 'Unable to reach the server. Check your connection and try again.'
                : 'The request could not be completed.'
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors =
      body?.errors &&
      typeof body.errors === 'object' &&
      !Array.isArray(body.errors)
        ? body.errors
        : {}
    this.isNetworkError = isNetworkError
    this.isTimeout = isTimeout
    this.isCanceled = isCanceled
  }
}

const api = axios.create(apiConfig)
// Configuration errors should not prevent unrelated pages from rendering.
api.interceptors.request.use((config) => {
  if (!config.baseURL?.trim()) {
    throw Object.assign(new Error('API URL is missing'), {
      code: 'ERR_API_CONFIGURATION',
    })
  }
  if (config.url !== '/auth/login') {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      config.sessionToken = token
    }
  }
  return config
})
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A late 401 from an older session must not log out a newer login.
    if (
      error.response?.status === 401 &&
      error.config?.url !== '/auth/login' &&
      error.config?.sessionToken &&
      getToken() === error.config.sessionToken
    ) {
      removeToken()
      window.dispatchEvent(new Event(AUTH_INVALID_EVENT))
    }
    return Promise.reject(new ApiError(error))
  },
)

export default api
