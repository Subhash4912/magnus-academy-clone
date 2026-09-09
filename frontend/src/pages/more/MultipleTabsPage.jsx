import { useRef, useState } from 'react'
import ModulePage from '../../components/more/ModulePage'

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    text: 'This component keeps one active tab in React state and displays its connected panel without reloading the page.',
  },
  {
    id: 'employee',
    label: 'Employee',
    text: 'Employee tools bring creation, search, editing, and deletion into one focused workspace.',
  },
  {
    id: 'projects',
    label: 'Projects',
    text: 'Project views can organize active work, deadlines, ownership, and progress in a single panel.',
  },
  {
    id: 'settings',
    label: 'Settings',
    text: 'Settings panels let users control preferences while staying in the same tabbed component.',
  },
]

export default function MultipleTabsPage() {
  const [active, setActive] = useState(tabs[0].id)
  const buttons = useRef([])
  const selected = tabs.find((tab) => tab.id === active)
  function move(event, index) {
    const keys = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }
    const next = keys[event.key]
    if (next === undefined) return
    event.preventDefault()
    setActive(tabs[next].id)
    buttons.current[next]?.focus()
  }
  return (
    <ModulePage
      title="Multiple Tabs"
      description="Switch between related content panels using mouse or keyboard."
    >
      <div
        role="tablist"
        aria-label="Workspace sections"
        className="flex overflow-x-auto border-b border-slate-200"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              buttons.current[index] = element
            }}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(event) => move(event, index)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${active === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <section
        id={`panel-${selected.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${selected.id}`}
        tabIndex={0}
        className="rounded-b-xl bg-slate-50 p-5 outline-none sm:p-8"
      >
        <h2 className="text-xl font-semibold text-slate-900">
          {selected.label}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          {selected.text}
        </p>
      </section>
    </ModulePage>
  )
}
