export const TOKEN_KEY = 'magnus_auth_token'
export const AUTH_INVALID_EVENT = 'magnus-auth-invalid'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    throw new Error(
      'Browser storage is unavailable. Enable site storage to sign in.',
    )
  }
}
export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* Storage may be disabled. */
  }
}
