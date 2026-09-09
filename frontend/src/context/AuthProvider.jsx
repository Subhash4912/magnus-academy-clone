import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthContext } from './AuthContext'
import * as authService from '../services/authService'
import {
  AUTH_INVALID_EVENT,
  TOKEN_KEY,
  getToken,
  removeToken,
  setToken,
} from '../services/tokenStorage'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState({
    user: null,
    token: null,
    loading: true,
    error: null,
  })
  const version = useRef(0)

  const logout = useCallback(() => {
    version.current += 1
    removeToken()
    setSession({ user: null, token: null, loading: false, error: null })
  }, [])

  const restore = useCallback(() => {
    const current = ++version.current
    const token = getToken()
    const request = token ? authService.getCurrentUser() : Promise.resolve(null)
    return request
      .then((response) => {
        if (current === version.current)
          setSession({
            user: response?.data.user || null,
            token,
            loading: false,
            error: null,
          })
      })
      .catch((error) => {
        if (current === version.current) {
          removeToken()
          setSession({
            user: null,
            token: null,
            loading: false,
            error:
              error.status === 401
                ? 'Your session has expired. Please log in again.'
                : 'Unable to restore your session. Please log in again.',
          })
        }
      })
  }, [])

  useEffect(() => {
    restore()
    const expired = () => logout()
    const storageChanged = (event) => {
      if (event.key === TOKEN_KEY || event.key === null) {
        setSession({ user: null, token: null, loading: true, error: null })
        restore()
      }
    }
    window.addEventListener(AUTH_INVALID_EVENT, expired)
    window.addEventListener('storage', storageChanged)
    return () => {
      version.current += 1
      window.removeEventListener(AUTH_INVALID_EVENT, expired)
      window.removeEventListener('storage', storageChanged)
    }
  }, [logout, restore])

  const login = useCallback(async (credentials) => {
    const current = ++version.current
    const response = await authService.login(credentials)
    if (current !== version.current)
      throw new Error('Sign-in was canceled. Please try again.')
    setToken(response.data.token)
    setSession({
      user: response.data.user,
      token: response.data.token,
      loading: false,
      error: null,
    })
    return response.data.user
  }, [])

  const updateProfile = useCallback(async (profile) => {
    const current = version.current
    const response = await authService.updateProfile(profile)
    if (current !== version.current)
      throw new Error('Profile update was canceled. Please try again.')
    setSession((session) => ({ ...session, user: response.data.user }))
    return response
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...session,
        isAuthenticated: Boolean(session.user && session.token),
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
