import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PageHeading from '../../components/common/PageHeading'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import useAsync from '../../hooks/useAsync'
import { getDashboardStats } from '../../services/dashboardService'
import { routePaths } from '../../utils/navigation'
import { gsap, useGSAP } from '../../animations/gsap'

const actionClass =
  'inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600'

function Distribution({ title, items, total }) {
  return (
    <Card data-gsap-distribution>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {items.length ? (
        <ul className="mt-5 max-h-80 space-y-5 overflow-y-auto pr-2">
          {items.map(({ _id, count }) => (
            <li key={_id}>
              <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 break-words">{_id}</span>
                <span className="font-semibold tabular-nums">{count}</span>
              </div>
              <div
                aria-hidden="true"
                className="h-2 overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  data-gsap-progress
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-slate-500">No data available yet.</p>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const dashboard = useRef(null)
  const { execute, data, loading, error, success } = useAsync()
  const initialRequest = useRef(null)
  useEffect(() => {
    // Share the request across StrictMode effect replay, but fetch fresh on every visit.
    execute(() => {
      initialRequest.current ??= getDashboardStats()
      return initialRequest.current
    }).catch(() => undefined)
  }, [execute])
  const pending = loading || (!success && !error)
  const stats = data?.data

  useGSAP(
    () => {
      if (!stats) return
      const media = gsap.matchMedia()
      media.add(
        {
          desktop: '(min-width: 1024px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        ({ conditions }) => {
          if (conditions.reduceMotion) return
          const timeline = gsap.timeline({
            defaults: { duration: 0.55, ease: 'power3.out' },
          })
          timeline
            .fromTo(
              '[data-gsap-stat]',
              {
                y: conditions.desktop ? 28 : 18,
                autoAlpha: 0,
                scale: 0.97,
              },
              { y: 0, autoAlpha: 1, scale: 1, stagger: 0.09 },
            )
            .fromTo(
              '[data-gsap-distribution]',
              { y: 24, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, stagger: 0.1 },
              '-=0.3',
            )
            .fromTo(
              '[data-gsap-progress]',
              { scaleX: 0, transformOrigin: 'left center' },
              { scaleX: 1, duration: 0.75, stagger: 0.05 },
              '-=0.3',
            )
            .fromTo(
              '[data-gsap-recent]',
              { y: 20, autoAlpha: 0 },
              { y: 0, autoAlpha: 1 },
              '-=0.35',
            )
            .fromTo(
              '[data-gsap-recent-row]',
              { x: -12, autoAlpha: 0 },
              { x: 0, autoAlpha: 1, stagger: 0.06 },
              '-=0.25',
            )

          const counters = []
          for (const element of dashboard.current.querySelectorAll(
            '[data-gsap-count]',
          )) {
            const target = Number(element.dataset.gsapCount)
            const counter = { value: 0 }
            element.textContent = '0'
            counters.push([element, target])
            gsap.to(counter, {
              value: target,
              duration: 0.9,
              ease: 'power2.out',
              snap: { value: 1 },
              onUpdate: () => {
                element.textContent = Math.round(counter.value).toLocaleString()
              },
            })
          }
          return () => {
            for (const [element, target] of counters) {
              element.textContent = target.toLocaleString()
            }
          }
        },
      )
      return () => media.revert()
    },
    { scope: dashboard, dependencies: [stats], revertOnUpdate: true },
  )

  return (
    <div ref={dashboard} className="dashboard-content">
      <PageHeading
        title="Dashboard"
        description="Overview of employee information and activity."
      />
      <nav
        aria-label="Employee quick actions"
        className="mb-7 flex flex-wrap gap-3"
      >
        <Link className={actionClass} to={routePaths.employeeCreate}>
          Add Employee
        </Link>
        <Link className={actionClass} to={routePaths.employeeSearch}>
          Search Employees
        </Link>
      </nav>
      {pending ? (
        <section role="status" aria-label="Loading dashboard statistics">
          <p className="mb-4 text-sm text-slate-500">
            Loading dashboard statistics...
          </p>
          <div
            aria-hidden="true"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            {[1, 2, 3, 4].map((key) => (
              <Card key={key}>
                <div className="h-5 w-3/4 rounded bg-slate-100 motion-safe:animate-pulse" />
                <div className="mt-5 h-9 w-16 rounded bg-slate-100 motion-safe:animate-pulse" />
              </Card>
            ))}
          </div>
        </section>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
        >
          <p className="font-semibold">Unable to load dashboard statistics.</p>
          <p className="mt-2 text-sm">Please try again in a moment.</p>
          <Button
            className="mt-4"
            onClick={() => execute(getDashboardStats).catch(() => undefined)}
          >
            Retry
          </Button>
        </div>
      ) : (
        stats && (
          <div className="space-y-7">
            <section
              aria-label="Employee statistics"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
            >
              {[
                ['Total Employees', stats.totalEmployees, 'border-indigo-100 bg-indigo-50/70', 'bg-indigo-500', 'text-indigo-700'],
                ['Male Employees', stats.maleEmployees, 'border-sky-100 bg-sky-50/70', 'bg-sky-500', 'text-sky-700'],
                ['Female Employees', stats.femaleEmployees, 'border-rose-100 bg-rose-50/70', 'bg-rose-500', 'text-rose-700'],
                ['Other / Unspecified', stats.otherGenderEmployees, 'border-amber-100 bg-amber-50/70', 'bg-amber-500', 'text-amber-700'],
              ].map(([label, count, cardColor, accentColor, valueColor]) => (
                <Card key={label} data-gsap-stat className={cardColor}>
                  <div className={`mb-5 h-1.5 w-10 rounded-full ${accentColor}`} />
                  <h2 className="text-sm font-semibold text-slate-600">
                    {label}
                  </h2>
                  <p
                    data-gsap-count={count}
                    className={`mt-3 text-3xl font-bold tabular-nums ${valueColor}`}
                  >
                    {count.toLocaleString()}
                  </p>
                </Card>
              ))}
            </section>
            <section
              aria-label="Employee distribution"
              className="grid gap-5 xl:grid-cols-3"
            >
              <Distribution
                title="Employees by Country"
                items={stats.employeesByCountry}
                total={stats.totalEmployees}
              />
              <Distribution
                title="Employees by State"
                items={stats.employeesByState}
                total={stats.totalEmployees}
              />
              <Distribution
                title="Employees by Skill"
                items={stats.employeesBySkill}
                total={stats.totalEmployees}
              />
            </section>
            <Card data-gsap-recent>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent Employees
                </h2>
                <Link className={actionClass} to={routePaths.employeeSearch}>
                  View All Employees
                </Link>
              </div>
              {stats.recentEmployees.length ? (
                <div
                  className="mt-5 overflow-x-auto rounded-lg border border-slate-200"
                  tabIndex={0}
                  role="region"
                  aria-label="Recent employees table, scroll horizontally for all columns"
                >
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <caption className="sr-only">
                      The five most recently added employees
                    </caption>
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        {['Name', 'Email', 'Mobile', 'Created Date'].map(
                          (label) => (
                            <th
                              key={label}
                              scope="col"
                              className="px-4 py-3 font-semibold"
                            >
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.recentEmployees.map((employee) => (
                        <tr key={employee._id} data-gsap-recent-row>
                          <th
                            scope="row"
                            className="max-w-64 break-words px-4 py-4 font-medium text-slate-900"
                          >
                            {employee.firstName} {employee.lastName}
                          </th>
                          <td className="max-w-64 break-words px-4 py-4">
                            {employee.email}
                          </td>
                          <td className="px-4 py-4">{employee.mobile}</td>
                          <td className="whitespace-nowrap px-4 py-4">
                            {employee.createdAt
                              ? new Date(employee.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  },
                                )
                              : 'Unspecified'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-5 text-sm text-slate-500">
                    No employees have been added yet.
                  </p>
                  <Link className={actionClass} to={routePaths.employeeCreate}>
                    Add Employee
                  </Link>
                </div>
              )}
            </Card>
          </div>
        )
      )}
    </div>
  )
}
