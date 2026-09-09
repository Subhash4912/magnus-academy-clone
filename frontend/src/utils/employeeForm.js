export const locations = {
  India: {
    Karnataka: ['Bengaluru'],
    Maharashtra: ['Pune', 'Mumbai'],
    Telangana: ['Hyderabad'],
    'Tamil Nadu': ['Chennai'],
    Kerala: ['Kochi'],
    'Andhra Pradesh': ['Vijayawada'],
    Delhi: ['Delhi'],
    Gujarat: ['Ahmedabad'],
  },
  'United States': {
    California: ['Los Angeles', 'San Francisco'],
    'New York': ['New York'],
  },
  'United Kingdom': { England: ['London'], Scotland: ['Edinburgh'] },
  Canada: { Ontario: ['Toronto'], 'British Columbia': ['Vancouver'] },
  Australia: { 'New South Wales': ['Sydney'], Victoria: ['Melbourne'] },
}

export const skillOptions = [
  'C',
  'C++',
  'Java',
  '.NET',
  'PHP',
  'JavaScript',
  'React',
  'Node.js',
]
export const initialEmployeeForm = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  gender: '',
  dateOfBirth: '',
  country: '',
  state: '',
  city: '',
  otherCity: false,
  otherCityName: '',
  address: '',
  skills: [],
}

export function todayDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function validateEmployeeForm(values) {
  const errors = {}
  for (const [field, label] of [
    ['firstName', 'First Name'],
    ['lastName', 'Last Name'],
    ['email', 'Email'],
    ['mobile', 'Mobile No'],
  ]) {
    if (!values[field].trim()) errors[field] = `${label} is required.`
  }
  if (
    values.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  )
    errors.email = 'Please enter a valid email address.'
  if (
    values.mobile.trim() &&
    (!/\d/.test(values.mobile) ||
      !/^[+\d\s().#-]+(?:\s*(?:ext\.?|x)\s*\d+)?$/i.test(values.mobile.trim()))
  ) {
    errors.mobile =
      'Enter a phone number using digits and phone formatting, such as +91 98765 43210.'
  }
  if (
    values.dateOfBirth &&
    (Number.isNaN(Date.parse(values.dateOfBirth)) ||
      values.dateOfBirth > todayDate())
  ) {
    errors.dateOfBirth =
      'Date of Birth must be a valid date that is not in the future.'
  }
  if (values.otherCity && !values.otherCityName.trim())
    errors.otherCityName = 'Enter the other city name or uncheck Other City.'
  return errors
}

export function employeePayload(values, includeEmpty = false) {
  const payload = { otherCity: values.otherCity, skills: [...values.skills] }
  for (const field of [
    'firstName',
    'lastName',
    'email',
    'mobile',
    'gender',
    'dateOfBirth',
    'country',
    'state',
    'address',
  ]) {
    const value = values[field].trim()
    if (value || includeEmpty)
      payload[field] =
        field === 'dateOfBirth' && !value
          ? null
          : field === 'email'
            ? value.toLowerCase()
            : value
  }
  const city = (values.otherCity ? values.otherCityName : values.city).trim()
  if (city || includeEmpty) payload.city = city
  return payload
}

export function employeeFormValues(employee) {
  const values = { ...initialEmployeeForm, skills: [] }
  for (const field of Object.keys(initialEmployeeForm)) {
    if (typeof employee[field] === 'string') values[field] = employee[field]
  }
  values.otherCity = employee.otherCity === true
  values.otherCityName = values.otherCity ? values.city : ''
  values.dateOfBirth = employee.dateOfBirth
    ? employee.dateOfBirth.slice(0, 10)
    : ''
  values.skills = Array.isArray(employee.skills) ? [...employee.skills] : []
  return values
}
