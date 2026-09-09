import { useRef, useState } from 'react'
import PageHeading from '../../components/common/PageHeading'
import Card from '../../components/common/Card'
import FormField from '../../components/common/FormField'
import Button from '../../components/common/Button'
import useAuth from '../../hooks/useAuth'
import useSettings from '../../hooks/useSettings'
import { changePassword } from '../../services/authService'
import { APP_NAME } from '../../utils/constants'
import packageInfo from '../../../package.json'

const primaryButton =
  'rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60'

function Feedback({ value }) {
  if (!value) return null
  return (
    <p
      role={value.type === 'error' ? 'alert' : 'status'}
      className={`mb-5 rounded-lg p-3 text-sm ${value.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}
    >
      {value.text}
    </p>
  )
}

function NotificationOption({ name, title, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
      <span>
        <span className="block text-sm font-semibold text-slate-900">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 size-5 shrink-0 accent-indigo-600"
      />
    </label>
  )
}

export default function SettingsPage() {
  const auth = useAuth()
  const settings = useSettings()
  const [name, setName] = useState(auth.user?.name || '')
  const [profileFeedback, setProfileFeedback] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const profileBusy = useRef(false)
  const profileForm = useRef(null)
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordFeedback, setPasswordFeedback] = useState(null)
  const [savingPassword, setSavingPassword] = useState(false)
  const passwordBusy = useRef(false)
  const passwordForm = useRef(null)
  const [preferenceFeedback, setPreferenceFeedback] = useState(null)

  async function saveProfile(event) {
    event.preventDefault()
    if (profileBusy.current) return
    const cleanName = name.trim()
    setProfileFeedback(null)
    if (!cleanName) {
      setProfileFeedback({ type: 'error', text: 'Name is required.' })
      profileForm.current?.elements.profileName?.focus()
      return
    }
    if (cleanName.length > 80) {
      setProfileFeedback({
        type: 'error',
        text: 'Name must be 80 characters or fewer.',
      })
      profileForm.current?.elements.profileName?.focus()
      return
    }
    profileBusy.current = true
    setSavingProfile(true)
    try {
      const response = await auth.updateProfile({ name: cleanName })
      setName(response.data.user.name)
      setProfileFeedback({ type: 'success', text: response.message })
    } catch (error) {
      setProfileFeedback({
        type: 'error',
        text: error.message || 'Unable to update profile.',
      })
    } finally {
      profileBusy.current = false
      setSavingProfile(false)
    }
  }

  function updatePassword(name, value) {
    setPasswords((current) => ({ ...current, [name]: value }))
    setPasswordErrors((current) => ({ ...current, [name]: undefined }))
    setPasswordFeedback(null)
  }

  async function savePassword(event) {
    event.preventDefault()
    if (passwordBusy.current) return
    const errors = {}
    if (!passwords.currentPassword)
      errors.currentPassword = 'Current password is required.'
    if (passwords.newPassword.length < 8)
      errors.newPassword = 'Password must be at least 8 characters.'
    else if (new TextEncoder().encode(passwords.newPassword).length > 72)
      errors.newPassword = 'Password must not exceed 72 UTF-8 bytes.'
    else if (passwords.newPassword === passwords.currentPassword)
      errors.newPassword =
        'Choose a password different from your current password.'
    if (!passwords.confirmPassword)
      errors.confirmPassword = 'Confirm your new password.'
    else if (passwords.newPassword !== passwords.confirmPassword)
      errors.confirmPassword = 'New passwords do not match.'
    setPasswordErrors(errors)
    setPasswordFeedback(null)
    if (Object.keys(errors).length) {
      passwordForm.current?.elements[Object.keys(errors)[0]]?.focus()
      return
    }
    passwordBusy.current = true
    setSavingPassword(true)
    try {
      const response = await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setPasswordFeedback({ type: 'success', text: response.message })
    } catch (error) {
      setPasswordFeedback({
        type: 'error',
        text: error.message || 'Unable to update password.',
      })
    } finally {
      passwordBusy.current = false
      setSavingPassword(false)
    }
  }

  function chooseTheme(theme) {
    try {
      settings.setTheme(theme)
      setPreferenceFeedback({
        type: 'success',
        text: 'Theme preference saved in this browser.',
      })
    } catch (error) {
      setPreferenceFeedback({ type: 'error', text: error.message })
    }
  }

  function chooseNotification(name, enabled) {
    try {
      settings.setNotification(name, enabled)
      setPreferenceFeedback({
        type: 'success',
        text: 'Notification preferences saved in this browser.',
      })
    } catch (error) {
      setPreferenceFeedback({ type: 'error', text: error.message })
    }
  }

  function resetPreferences() {
    try {
      settings.resetSettings()
      setPreferenceFeedback({
        type: 'success',
        text: 'Local preferences reset to their defaults.',
      })
    } catch (error) {
      setPreferenceFeedback({ type: 'error', text: error.message })
    }
  }

  const application = [
    ['Application', `${APP_NAME} Clone`],
    ['Version', packageInfo.version],
    ['Frontend', 'React + Vite + Tailwind CSS'],
    ['Backend', 'Node.js + Express'],
    ['Database', 'MongoDB'],
    ['Authentication', 'JWT'],
  ]
  return (
    <>
      <PageHeading
        title="Settings"
        description="Manage your account and application preferences."
      />
      <Feedback value={preferenceFeedback} />
    <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update the name shown in your application header.
          </p>
          <form
            ref={profileForm}
            onSubmit={saveProfile}
            noValidate
            aria-busy={savingProfile}
            className="mt-6"
          >
            <Feedback value={profileFeedback} />
            <fieldset disabled={savingProfile} className="space-y-5">
              <FormField
                name="profileName"
                label="Display Name"
                required
                value={name}
                maxLength={80}
                autoComplete="name"
                onChange={(event) => {
                  setName(event.target.value)
                  setProfileFeedback(null)
                }}
              />
              <FormField
                name="profileEmail"
                label="Email"
                type="email"
                value={auth.user?.email || ''}
                readOnly
                autoComplete="email"
              />
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Role
                </span>
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm capitalize text-slate-700">
                  {auth.user?.role === 'admin'
                    ? 'Administrator'
                    : auth.user?.role}
                </p>
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className={primaryButton}
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </fieldset>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">
            Account &amp; Security
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Change the password for {auth.user?.email}.
          </p>
          <form
            ref={passwordForm}
            onSubmit={savePassword}
            noValidate
            aria-busy={savingPassword}
            className="mt-6"
          >
            <Feedback value={passwordFeedback} />
            <fieldset disabled={savingPassword} className="space-y-5">
              <FormField
                name="currentPassword"
                label="Current Password"
                type="password"
                required
                autoComplete="current-password"
                value={passwords.currentPassword}
                error={passwordErrors.currentPassword}
                onChange={(event) =>
                  updatePassword('currentPassword', event.target.value)
                }
              />
              <FormField
                name="newPassword"
                label="New Password"
                type="password"
                required
                autoComplete="new-password"
                value={passwords.newPassword}
                error={passwordErrors.newPassword}
                onChange={(event) =>
                  updatePassword('newPassword', event.target.value)
                }
              />
              <FormField
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                required
                autoComplete="new-password"
                value={passwords.confirmPassword}
                error={passwordErrors.confirmPassword}
                onChange={(event) =>
                  updatePassword('confirmPassword', event.target.value)
                }
              />
              <p className="text-xs text-slate-500">
                Use at least 8 characters. The current session remains active
                after a successful change.
              </p>
              <button
                type="submit"
                disabled={savingPassword}
                className={primaryButton}
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </fieldset>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a theme for this browser.
          </p>
          <fieldset className="mt-5">
            <legend className="sr-only">Theme preference</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {['system', 'light', 'dark'].map((theme) => (
                <label
                  key={theme}
                  className={`cursor-pointer rounded-xl border p-4 text-center text-sm font-semibold capitalize ${settings.theme === theme ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={settings.theme === theme}
                    onChange={() => chooseTheme(theme)}
                    className="sr-only"
                  />
                  {theme}
                </label>
              ))}
            </div>
          </fieldset>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Control local notification preferences. No emails are sent in this
            assignment.
          </p>
          <div className="mt-5 space-y-3">
            <NotificationOption
              name="emailNotifications"
              title="Email notifications"
              description="Receive general academy email notifications."
              checked={settings.notifications.emailNotifications}
              onChange={(event) =>
                chooseNotification('emailNotifications', event.target.checked)
              }
            />
            <NotificationOption
              name="employeeUpdates"
              title="Employee updates"
              description="Receive updates about employee activity."
              checked={settings.notifications.employeeUpdates}
              onChange={(event) =>
                chooseNotification('employeeUpdates', event.target.checked)
              }
            />
            <NotificationOption
              name="dashboardUpdates"
              title="Dashboard updates"
              description="Receive dashboard summary updates."
              checked={settings.notifications.dashboardUpdates}
              onChange={(event) =>
                chooseNotification('dashboardUpdates', event.target.checked)
              }
            />
          </div>
        </Card>
      <Card className="md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                About Application
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Technology used by this project.
              </p>
            </div>
            <Button onClick={resetPreferences}>Reset Local Preferences</Button>
          </div>
          <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {application.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {label}
                </dt>
                <dd className="mt-1 break-words text-sm font-medium text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  )
}
