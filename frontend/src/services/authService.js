import api from './api'

export async function login(credentials) {
  return (await api.post('/auth/login', credentials)).data
}
export async function getCurrentUser() {
  return (await api.get('/auth/me')).data
}
export async function updateProfile(profile) {
  return (await api.put('/auth/profile', profile)).data
}
export async function changePassword(passwords) {
  return (await api.put('/auth/password', passwords)).data
}
