import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageHeading from '../../components/common/PageHeading'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import FormField from '../../components/common/FormField'
import EmployeeTable from '../../components/employee/EmployeeTable'
import useAsync from '../../hooks/useAsync'
import { deleteEmployee, getEmployees } from '../../services/employeeService'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import { routePaths } from '../../utils/navigation'

export default function EmployeeSearchPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [message, setMessage] = useState(() => location.state?.message || '')
  const [selected, setSelected] = useState(null)
  const [removedIds, setRemovedIds] = useState([])
  const deletion = useAsync()
  const deleting = useRef(false)
  useEffect(() => {
    if (location.state?.message)
      navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [query, setQuery] = useState({})
  const busy = useRef(true)
  const { execute, data, loading, error, success } = useAsync()

  useEffect(() => {
    let active = true
    busy.current = true
    // useAsync retains the normalized error for the alert below.
    execute(getEmployees, query)
      .catch(() => undefined)
      .finally(() => {
        if (active) busy.current = false
      })
    return () => {
      active = false
    }
  }, [execute, query])

  function search(event) {
    event.preventDefault()
    if (busy.current) return
    busy.current = true
    setQuery({ name: name.trim(), mobile: mobile.trim() })
  }

  function clear() {
    if (busy.current) return
    busy.current = true
    setName('')
    setMobile('')
    setQuery({})
  }

  const pending = loading || (!success && !error)
  const employees = (Array.isArray(data?.data) ? data.data : []).filter(
    (employee) => !removedIds.includes(employee._id),
  )
  const hasFilters = Boolean(query.name || query.mobile)

  async function confirmDelete() {
    if (deleting.current || !selected) return
    deleting.current = true
    try {
      const result = await deletion.execute(deleteEmployee, selected._id)
      setRemovedIds((previous) => [...previous, selected._id])
      setSelected(null)
      setMessage(result.message || 'Employee deleted successfully.')
    } catch {
      // Keep the row and modal; useAsync exposes the error for retry.
    } finally {
      deleting.current = false
    }
  }

  return (
    <>
      <PageHeading
        title="Search employees"
        description="Find employees by name or mobile number, or browse your employee list."
        eyebrow="Employee"
      />
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">
          Search employees
        </h2>
        <form onSubmit={search} className="mt-5">
          <fieldset disabled={pending} className="min-w-0">
            <legend className="sr-only">Employee search filters</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                name="employee-name"
                label="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <FormField
                name="employee-mobile"
                label="Mobile"
                type="tel"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
              >
                {pending ? 'Searching...' : 'Search'}
              </button>
              <Button onClick={clear} disabled={pending}>
                Clear
              </Button>
              <Link
                to={routePaths.employeeCreate}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 sm:ml-auto"
              >
                Add Employee
              </Link>
            </div>
          </fieldset>
        </form>
      </Card>
      {message && (
        <div
          role="status"
          className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <span>{message}</span>
          <Button
            onClick={() => setMessage('')}
            aria-label="Dismiss success message"
          >
            Dismiss
          </Button>
        </div>
      )}
      {selected && (
        <ConfirmationModal
          title="Delete Employee"
          busy={deletion.loading}
          error={deletion.error?.message}
          onCancel={() => {
            if (!deleting.current) setSelected(null)
          }}
          onConfirm={confirmDelete}
        >
          <p>
            Are you sure you want to delete{' '}
            <strong>
              {selected.firstName} {selected.lastName}
            </strong>
            ?
          </p>
          <p className="mt-2">This action cannot be undone.</p>
        </ConfirmationModal>
      )}
      <section
        className="mt-7 min-w-0"
        aria-label="Employee results"
        aria-busy={pending}
      >
        {pending ? (
          <p
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
          >
            Loading employees...
          </p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800"
          >
            <p className="font-semibold">Unable to load employees.</p>
            <p className="mt-1">{error.message}</p>
            <Button
              className="mt-4"
              onClick={() => {
                if (!busy.current) {
                  busy.current = true
                  setQuery({ ...query })
                }
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <p
              role="status"
              className="mb-4 text-sm font-medium text-slate-600"
            >
              Employees: {employees.length}
              {hasFilters ? ' · Search results' : ''}
            </p>
            {employees.length ? (
              <>
                <p className="mb-3 text-xs text-slate-500">
                  Scroll horizontally to view all columns and actions.
                </p>
                <EmployeeTable
                  employees={employees}
                  onDelete={(employee) => {
                    deletion.reset()
                    setSelected(employee)
                  }}
                />
              </>
            ) : (
              <Card className="text-center">
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  No employees found.
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {hasFilters
                    ? 'No employees match your search criteria.'
                    : 'Add an employee to get started.'}
                </p>
                {hasFilters && (
                  <Button className="my-5" onClick={clear}>
                    Clear Search
                  </Button>
                )}
              </Card>
            )}
          </>
        )}
      </section>
    </>
  )
}
