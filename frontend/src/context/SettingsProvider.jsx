import { useCallback, useEffect, useMemo, useState } from 'react'
import { SettingsContext } from './SettingsContext'
import {
  DEFAULT_NOTIFICATIONS,
  NOTIFICATIONS_KEY,
  THEME_KEY,
  clearSettings,
  readNotifications,
  readTheme,
  saveNotifications,
  saveTheme,
} from '../utils/settingsStorage'

export default function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme)
  const [notifications, setNotificationsState] = useState(readNotifications)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const effectiveTheme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      document.documentElement.classList.toggle(
        'dark',
        effectiveTheme === 'dark',
      )
      document.documentElement.dataset.theme = effectiveTheme
      document.documentElement.style.colorScheme = effectiveTheme
    }
    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [theme])

  useEffect(() => {
    const synchronize = (event) => {
      if (event.key === THEME_KEY || event.key === null)
        setThemeState(readTheme())
      if (event.key === NOTIFICATIONS_KEY || event.key === null)
        setNotificationsState(readNotifications())
    }
    window.addEventListener('storage', synchronize)
    return () => window.removeEventListener('storage', synchronize)
  }, [])

  const setTheme = useCallback((nextTheme) => {
    if (!['system', 'light', 'dark'].includes(nextTheme)) return
    saveTheme(nextTheme)
    setThemeState(nextTheme)
  }, [])

  const setNotification = useCallback(
    (name, enabled) => {
      if (!Object.hasOwn(DEFAULT_NOTIFICATIONS, name)) return
      const next = { ...notifications, [name]: Boolean(enabled) }
      saveNotifications(next)
      setNotificationsState(next)
    },
    [notifications],
  )

  const resetSettings = useCallback(() => {
    clearSettings()
    setThemeState('system')
    setNotificationsState({ ...DEFAULT_NOTIFICATIONS })
  }, [])

  const value = useMemo(
    () => ({ theme, notifications, setTheme, setNotification, resetSettings }),
    [theme, notifications, setTheme, setNotification, resetSettings],
  )
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
