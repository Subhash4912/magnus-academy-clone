export const THEME_KEY = 'magnus_theme'
export const NOTIFICATIONS_KEY = 'magnus_notification_preferences'
export const DEFAULT_NOTIFICATIONS = Object.freeze({
  emailNotifications: true,
  employeeUpdates: true,
  dashboardUpdates: false,
})

export function readTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return ['system', 'light', 'dark'].includes(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

export function readNotifications() {
  try {
    const value = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY))
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return { ...DEFAULT_NOTIFICATIONS }
    return Object.fromEntries(
      Object.entries(DEFAULT_NOTIFICATIONS).map(([key, fallback]) => [
        key,
        typeof value[key] === 'boolean' ? value[key] : fallback,
      ]),
    )
  } catch {
    return { ...DEFAULT_NOTIFICATIONS }
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    throw new Error(
      'Browser storage is unavailable. Your preference was not saved.',
    )
  }
}

export function saveTheme(theme) {
  store(THEME_KEY, theme)
}

export function saveNotifications(preferences) {
  store(NOTIFICATIONS_KEY, JSON.stringify(preferences))
}

export function clearSettings() {
  try {
    localStorage.removeItem(THEME_KEY)
    localStorage.removeItem(NOTIFICATIONS_KEY)
  } catch {
    throw new Error(
      'Browser storage is unavailable. Preferences could not be reset.',
    )
  }
}
