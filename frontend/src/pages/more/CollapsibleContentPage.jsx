import { useState } from 'react'
import ModulePage from '../../components/more/ModulePage'

const sections = [
  [
    'About the Application',
    'Magnus Academy is a responsive React and Express learning project with reusable UI patterns.',
  ],
  [
    'Employee Management',
    'Authenticated users can create, search, edit, and delete employee records stored in MongoDB.',
  ],
  [
    'Dashboard',
    'The dashboard summarizes real employee data with grouped statistics and recent activity.',
  ],
  [
    'Authentication',
    'JWT authentication protects application routes and backend employee and dashboard APIs.',
  ],
]
export default function CollapsibleContentPage() {
  const [active, setActive] = useState(0)
  return (
    <ModulePage
      title="Collapsible Content"
      description="Expand one section at a time to reveal its content."
    >
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
        {sections.map(([title, content], index) => {
          const open = active === index
          return (
            <section key={title}>
              <h2>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`accordion-panel-${index}`}
                  id={`accordion-button-${index}`}
                  onClick={() => setActive(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-semibold text-slate-900 hover:bg-slate-50 sm:px-5"
                >
                  <span>{title}</span>
                  <span aria-hidden="true" className="text-xl text-indigo-600">
                    {open ? '−' : '+'}
                  </span>
                </button>
              </h2>
              {open && (
                <div
                  id={`accordion-panel-${index}`}
                  role="region"
                  aria-labelledby={`accordion-button-${index}`}
                  className="bg-slate-50 px-4 pb-5 pt-1 text-sm leading-6 text-slate-600 sm:px-5"
                >
                  {content}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </ModulePage>
  )
}
