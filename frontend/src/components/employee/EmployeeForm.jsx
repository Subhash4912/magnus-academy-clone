import { useEffect, useRef, useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import FormField from '../common/FormField'
import PageHeading from '../common/PageHeading'
import useAsync from '../../hooks/useAsync'

import {
  employeePayload,
  initialEmployeeForm,
  locations,
  skillOptions,
  todayDate,
  validateEmployeeForm,
} from '../../utils/employeeForm'

export default function EmployeeForm({
  mode = 'create',
  initialValues = initialEmployeeForm,
  onSave,
  onSaved,
}) {
  const editing = mode === 'edit'
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const request = useAsync()
  const submitting = useRef(false)
  const form = useRef(null)
  const feedback = useRef(null)
  useEffect(() => {
    if (message) {
      feedback.current?.focus()
      feedback.current?.scrollIntoView({ block: 'center' })
    }
  }, [message])
  const states = Object.keys(locations[values.country] || {})
  const cities = values.state
    ? locations[values.country]?.[values.state] || []
    : [...new Set(Object.values(locations[values.country] || {}).flat())]

  function change(name, value) {
    const next = { ...values, [name]: value }
    const cleared = [name]
    if (name === 'country' || name === 'state') {
      next.city = ''
      next.otherCityName = ''
      cleared.push('city', 'otherCityName')
      if (name === 'country') {
        next.state = ''
        cleared.push('state')
      }
    }
    if (name === 'otherCity') cleared.push('city', 'otherCityName')
    setValues(next)
    setMessage(null)
    const validation = validateEmployeeForm(next)
    setErrors((previous) => {
      const updated = { ...previous }
      for (const field of cleared) {
        delete updated[field]
        if (previous[field] && validation[field])
          updated[field] = validation[field]
      }
      return updated
    })
  }

  function field(name) {
    return {
      name,
      value: values[name],
      error: errors[name],
      onChange: (event) => change(name, event.target.value),
    }
  }

  function clear() {
    if (submitting.current) return
    setValues(initialValues)
    setErrors({})
    setMessage(null)
    request.reset()
    form.current.elements.firstName.focus()
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    setMessage(null)
    const validation = validateEmployeeForm(values)
    setErrors(validation)
    if (Object.keys(validation).length) {
      form.current.elements[Object.keys(validation)[0]]?.focus()
      return
    }
    submitting.current = true
    try {
      const result = await request.execute(
        onSave,
        employeePayload(values, editing),
      )
      if (onSaved) {
        onSaved(result)
        return
      }
      setValues(initialValues)
      setErrors({})
      setMessage({
        type: 'success',
        text: result.message || 'Employee created successfully.',
      })
    } catch (error) {
      const fields = {}
      for (const [key, value] of Object.entries(error.errors || {})) {
        const name = key === 'city' && values.otherCity ? 'otherCityName' : key
        if (
          Object.hasOwn(initialEmployeeForm, name) &&
          typeof value === 'string'
        )
          fields[name] = value
      }
      setErrors(fields)
      setMessage({
        type: 'error',
        text:
          error.message || 'Employee could not be created. Please try again.',
      })
    } finally {
      submitting.current = false
    }
  }

  return (
    <>
      <PageHeading
        title={editing ? 'Edit employee' : 'Create employee'}
        description={
          editing
            ? 'Update employee information. Fields marked with * are required.'
            : 'Add a new employee to your workspace. Fields marked with * are required.'
        }
        eyebrow="Employee"
      />
      <form
        ref={form}
        noValidate
        onSubmit={submit}
        aria-busy={request.loading}
        className="space-y-6"
      >
        {message && (
          <div
            ref={feedback}
            tabIndex={-1}
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`rounded-xl border p-4 text-sm ${message.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
          >
            {message.text}
          </div>
        )}
        <fieldset disabled={request.loading} className="min-w-0 space-y-6">
          <legend className="sr-only">Employee details</legend>
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">
              Personal information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Basic details and contact information.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField
                {...field('firstName')}
                label="First Name"
                required
                autoComplete="given-name"
              />
              <FormField
                {...field('lastName')}
                label="Last Name"
                required
                autoComplete="family-name"
              />
              <FormField
                {...field('email')}
                label="Email"
                type="email"
                required
                autoComplete="email"
              />
              <FormField
                {...field('mobile')}
                label="Mobile No"
                type="tel"
                required
                autoComplete="tel"
              />
              <FormField {...field('gender')} label="Gender" as="select">
                <option value="">Select Gender</option>
                {[
                  ...new Set(
                    ['Male', 'Female', 'Other', values.gender].filter(Boolean),
                  ),
                ].map((gender) => (
                  <option key={gender}>{gender}</option>
                ))}
              </FormField>
              <FormField
                {...field('dateOfBirth')}
                label="Date of Birth"
                type="date"
                max={todayDate()}
                autoComplete="bday"
              />
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Location</h2>
            <p className="mt-1 text-sm text-slate-500">
              Optional location and mailing address.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField
                {...field('country')}
                label="Country"
                as="select"
                autoComplete="country-name"
              >
                <option value="">Select Country</option>
                {[
                  ...new Set(
                    [...Object.keys(locations), values.country].filter(Boolean),
                  ),
                ].map((country) => (
                  <option key={country}>{country}</option>
                ))}
              </FormField>
              <FormField
                {...field('state')}
                label="State"
                as="select"
                disabled={!values.country}
                autoComplete="address-level1"
              >
                <option value="">Select State</option>
                {[...new Set([...states, values.state].filter(Boolean))].map(
                  (state) => (
                    <option key={state}>{state}</option>
                  ),
                )}
              </FormField>
              {!values.otherCity ? (
                <FormField
                  {...field('city')}
                  label="City"
                  as="select"
                  disabled={!values.country}
                  autoComplete="address-level2"
                >
                  <option value="">Select City</option>
                  {[...new Set([...cities, values.city].filter(Boolean))].map(
                    (city) => (
                      <option key={city}>{city}</option>
                    ),
                  )}
                </FormField>
              ) : (
                <FormField
                  {...field('otherCityName')}
                  label="Other City Name"
                  autoComplete="address-level2"
                />
              )}
              <div className="flex items-center">
                <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="otherCity"
                    checked={values.otherCity}
                    onChange={(event) =>
                      change('otherCity', event.target.checked)
                    }
                    className="size-4 accent-indigo-600"
                  />
                  Other City
                </label>
              </div>
              <div className="md:col-span-2">
                <FormField
                  {...field('address')}
                  label="Address"
                  as="textarea"
                  rows={3}
                  autoComplete="street-address"
                />
              </div>
            </div>
          </Card>
          <Card>
            <fieldset>
              <legend className="text-lg font-semibold text-slate-900">
                Skills
              </legend>
              <p className="mt-1 text-sm text-slate-500">
                Select all that apply.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ...new Set([
                    ...skillOptions,
                    ...initialValues.skills,
                    ...values.skills,
                  ]),
                ].map((skill) => (
                  <label
                    key={skill}
                    className="flex cursor-pointer items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="skills"
                      value={skill}
                      checked={values.skills.includes(skill)}
                      aria-describedby={
                        errors.skills ? 'skills-error' : undefined
                      }
                      onChange={(event) =>
                        change(
                          'skills',
                          event.target.checked
                            ? [...values.skills, skill]
                            : values.skills.filter((item) => item !== skill),
                        )
                      }
                      className="size-4 accent-indigo-600"
                    />
                    {skill}
                  </label>
                ))}
              </div>
              {errors.skills && (
                <p id="skills-error" className="mt-3 text-sm text-rose-700">
                  {errors.skills}
                </p>
              )}
            </fieldset>
          </Card>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button onClick={clear} disabled={request.loading}>
              {editing ? 'Reset changes' : 'Clear'}
            </Button>
            <button
              type="submit"
              disabled={request.loading}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-60"
            >
              {request.loading
                ? editing
                  ? 'Updating...'
                  : 'Saving...'
                : editing
                  ? 'Update Employee'
                  : 'Save Employee'}
            </button>
          </div>
        </fieldset>
      </form>
    </>
  )
}
