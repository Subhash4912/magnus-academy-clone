import { Link, generatePath } from 'react-router-dom'
import Button from '../common/Button'
import { routePaths } from '../../utils/navigation'
import { useRef } from 'react'
import {
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../animations/gsap'

const display = (value) =>
  typeof value === 'string' && value.trim() ? value : '—'

export default function EmployeeTable({ employees, onDelete }) {
  const table = useRef(null)
  const employeeKey = employees.map(({ _id }) => _id).join(',')
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '[data-gsap-employee-row]',
        { x: -14, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.42,
          stagger: 0.045,
          ease: 'power2.out',
        },
      )
    },
    {
      scope: table,
      dependencies: [employeeKey],
      revertOnUpdate: true,
    },
  )
  return (
    <div
      ref={table}
      className="overflow-x-auto rounded-xl border border-slate-200 bg-white focus-visible:outline-2 focus-visible:outline-indigo-600"
      tabIndex={0}
      role="region"
      aria-label="Employee results table, scroll horizontally for all columns"
    >
      <table className="w-full min-w-[1100px] text-left text-sm">
        <caption className="sr-only">Employee search results</caption>
        <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            {[
              '#',
              'Name',
              'Email',
              'Mobile',
              'Gender',
              'Country',
              'State',
              'City',
              'Skills',
              'Actions',
            ].map((label) => (
              <th key={label} scope="col" className="px-4 py-4 font-semibold">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {employees.map((employee, index) => {
            const name =
              [employee.firstName, employee.lastName]
                .filter(Boolean)
                .join(' ') || 'Unnamed employee'
            return (
              <tr
                key={employee._id}
                data-gsap-employee-row
                className="align-top hover:bg-slate-50"
              >
                <td className="px-4 py-4 text-slate-500">{index + 1}</td>
                <th
                  scope="row"
                  className="min-w-40 max-w-64 break-words px-4 py-4 font-medium text-slate-900"
                >
                  {name}
                </th>
                {['email', 'mobile', 'gender', 'country', 'state', 'city'].map(
                  (field) => (
                    <td key={field} className="max-w-64 break-words px-4 py-4">
                      {display(employee[field])}
                    </td>
                  ),
                )}
                <td className="min-w-36 px-4 py-4">
                  {Array.isArray(employee.skills) && employee.skills.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {employee.skills.map((skill, i) => (
                        <li
                          key={`${skill}-${i}`}
                          className="max-w-48 break-words rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={generatePath(routePaths.employeeEdit, {
                        id: employee._id,
                      })}
                      aria-label={`Edit ${name}`}
                      className="rounded-lg border border-indigo-200 px-3 py-2 font-medium text-indigo-700 hover:bg-indigo-50"
                    >
                      Edit
                    </Link>
                    <Button
                      onClick={() => onDelete(employee)}
                      aria-label={`Delete ${name}`}
                      title="Delete employee"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
