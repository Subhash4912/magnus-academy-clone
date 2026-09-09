import api from './api'

// Every service returns the API envelope: { success, message, data }.
export async function getEmployees({ name, mobile } = {}) {
  const params = {}
  if (name?.trim()) params.name = name.trim()
  if (mobile?.trim()) params.mobile = mobile.trim()
  const response = await api.get('/employees', { params })
  return response.data
}

export async function getEmployeeById(id) {
  const response = await api.get(`/employees/${encodeURIComponent(id)}`)
  return response.data
}

export async function createEmployee(employeeData) {
  const response = await api.post('/employees', employeeData)
  return response.data
}

export async function updateEmployee(id, employeeData) {
  const response = await api.put(`/employees/${encodeURIComponent(id)}`, employeeData)
  return response.data
}

export async function deleteEmployee(id) {
  const response = await api.delete(`/employees/${encodeURIComponent(id)}`)
  return response.data
}
