import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../../components/common/FormField'
import useAuth from '../../hooks/useAuth'
import { routePaths } from '../../utils/navigation'
import {
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../animations/gsap'

export default function LoginPage() {
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const busy = useRef(false)
  const form = useRef(null)
  const container = useRef(null)
  const { contextSafe } = useGSAP({ scope: container })
  const animateLoginPress = contextSafe((event) => {
    if (prefersReducedMotion()) return
    gsap.fromTo(
      event.currentTarget,
      { scale: 0.97 },
      {
        scale: 1,
        duration: 0.3,
        ease: 'back.out(2.5)',
        overwrite: true,
        clearProps: 'transform',
      },
    )
  })

  useGSAP(
    () => {
      if (auth.loading || !container.current) return
      const media = gsap.matchMedia()
      media.add(
        {
          desktop: '(min-width: 1024px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        ({ conditions }) => {
          if (conditions.reduceMotion) return
          const timeline = gsap.timeline({
            defaults: { duration: 0.6, ease: 'power3.out' },
          })
          timeline
            .fromTo(
              '[data-login-shell]',
              { y: 24, autoAlpha: 0, scale: 0.985 },
              { y: 0, autoAlpha: 1, scale: 1 },
            )
            .fromTo(
              '[data-login-brand]',
              { x: conditions.desktop ? -44 : 0, autoAlpha: 0 },
              { x: 0, autoAlpha: 1 },
              '-=0.35',
            )
            .fromTo(
              '[data-login-copy] > *',
              { y: 18, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, stagger: 0.08 },
              '-=0.35',
            )
            .fromTo(
              '[data-login-feature]',
              { x: -12, autoAlpha: 0 },
              { x: 0, autoAlpha: 1, stagger: 0.07 },
              '-=0.35',
            )
            .fromTo(
              '[data-login-form]',
              { x: conditions.desktop ? 36 : 0, y: conditions.desktop ? 0 : 18, autoAlpha: 0 },
              { x: 0, y: 0, autoAlpha: 1 },
              '-=0.55',
            )
            .fromTo(
              '[data-login-field]',
              { y: 14, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, stagger: 0.09 },
              '-=0.3',
            )
        },
      )
      return () => media.revert()
    },
    {
      scope: container,
      dependencies: [auth.loading],
      revertOnUpdate: true,
    },
  )

  useGSAP(
    () => {
      if (!(error || auth.error) || prefersReducedMotion()) return
      gsap.fromTo(
        '[data-login-error]',
        { x: -8 },
        { x: 0, duration: 0.45, ease: 'elastic.out(1, 0.35)' },
      )
    },
    {
      scope: container,
      dependencies: [error, auth.error],
      revertOnUpdate: true,
    },
  )

  if (auth.loading)
    return (
      <main className="login-page flex min-h-dvh items-center justify-center p-8">
        <p
          role="status"
          className="rounded-xl bg-white px-6 py-4 text-center text-slate-500 shadow-lg"
        >
          Checking session...
        </p>
      </main>
    )

  if (auth.isAuthenticated)
    return <Navigate to={routePaths.dashboard} replace />

  async function submit(event) {
    event.preventDefault()
    if (busy.current) return
    const validation = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      validation.email = 'Enter a valid email address.'
    if (!password) validation.password = 'Password is required.'
    setErrors(validation)
    setError('')
    if (Object.keys(validation).length) {
      form.current.elements[Object.keys(validation)[0]]?.focus()
      return
    }
    busy.current = true
    setSubmitting(true)
    try {
      await auth.login({ email: email.trim().toLowerCase(), password })
      setPassword('')
      const from = location.state?.from
      const destination =
        typeof from === 'string' &&
        from.startsWith('/') &&
        !from.startsWith('//') &&
        !from.includes('\\') &&
        !/^\/login(?:[/?#]|$)/i.test(from)
          ? from
          : routePaths.dashboard
      navigate(destination, { replace: true })
    } catch (failure) {
      setError(failure.message || 'Unable to log in. Please try again.')
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  return (
    <main
      ref={container}
      className="login-page flex min-h-dvh items-center justify-center p-4 sm:p-8"
    >
      <section
        data-login-shell
        className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_80px_rgba(49,46,129,0.18)] lg:min-h-[640px] lg:grid-cols-[1.08fr_0.92fr]"
      >
        <div
          data-login-brand
          className="login-brand-panel relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col"
        >
          <div className="relative z-10 flex items-center gap-3 text-lg font-semibold">
            <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 text-xl font-bold ring-1 ring-white/20">
              M
            </span>
            Magnus Academy
          </div>
          <div
            data-login-copy
            className="relative z-10 my-auto max-w-md py-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-200">
              Employee workspace
            </p>
            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight">
              Manage your team with clarity and confidence.
            </h2>
            <p className="mt-5 text-base leading-7 text-indigo-100/90">
              Keep employee records organized, review live insights, and
              access everything from one focused dashboard.
            </p>
            <ul className="mt-8 grid gap-3 text-sm text-indigo-100">
              {[
                'Secure account access',
                'Live employee insights',
                'Simple team management',
              ].map((item) => (
                <li
                  key={item}
                  data-login-feature
                  className="flex items-center gap-3"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-300">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative z-10 text-xs text-indigo-200/80">
            React · Express · MongoDB
          </p>
        </div>

        <div
          data-login-form
          className="flex items-center bg-white p-6 sm:p-10 lg:p-12"
        >
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-9 flex items-center gap-3 text-lg font-semibold text-slate-900 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-200">
                M
              </span>
              Magnus Academy
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Welcome back
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Sign in to continue
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your administrator credentials to open the workspace.
            </p>
            {(error || auth.error) && (
              <p
                role="alert"
                data-login-error
                className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800"
              >
                {error || auth.error}
              </p>
            )}
            <form
              ref={form}
              noValidate
              onSubmit={submit}
              aria-busy={submitting}
              className="mt-8"
            >
              <fieldset disabled={submitting} className="space-y-5">
                <legend className="sr-only">Login credentials</legend>
                <div data-login-field>
                  <FormField
                    name="email"
                    label="Email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    error={errors.email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setErrors((previous) => ({
                        ...previous,
                        email: undefined,
                      }))
                    }}
                  />
                </div>
                <div data-login-field>
                  <FormField
                    name="password"
                    label="Password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    error={errors.password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setErrors((previous) => ({
                        ...previous,
                        password: undefined,
                      }))
                    }}
                  />
                </div>
                <div data-login-field>
                  <button
                    type="submit"
                    disabled={submitting}
                    onPointerDown={animateLoginPress}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    {submitting ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </fieldset>
            </form>
            <p className="mt-7 text-center text-xs leading-5 text-slate-400">
              Protected employee management workspace
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
