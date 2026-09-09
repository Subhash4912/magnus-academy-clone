import { useState } from 'react'
import ModulePage from '../../components/more/ModulePage'

const products = ['Web Development', 'Mobile Apps', 'Consulting']
export default function MenuPage() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('Main Menu')
  function choose(label) {
    setActive(label)
    setOpen(false)
  }
  return (
    <ModulePage
      title="Menu"
      description="A responsive navigation example with a nested submenu and active state."
    >
      <nav
        aria-label="Demonstration menu"
        className="max-w-2xl rounded-xl border border-slate-200 bg-slate-50 p-3"
      >
        <ul className="grid gap-2 sm:grid-cols-5">
          <li>
            <button
              type="button"
              aria-current={active === 'Main Menu' ? 'page' : undefined}
              onClick={() => choose('Main Menu')}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${active === 'Main Menu' ? 'bg-indigo-600 text-white' : 'hover:bg-white hover:text-indigo-700'}`}
            >
              Main Menu
            </button>
          </li>
          <li className="relative">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="products-submenu"
              onClick={() => setOpen((value) => !value)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${products.includes(active) ? 'bg-indigo-600 text-white' : 'hover:bg-white hover:text-indigo-700'}`}
            >
              Products <span aria-hidden="true">{open ? '−' : '+'}</span>
            </button>
            {open && (
              <ul
                id="products-submenu"
                className="mt-2 space-y-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg sm:absolute sm:left-0 sm:top-full sm:z-10 sm:w-52"
              >
                {products.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      aria-current={active === item ? 'page' : undefined}
                      onClick={() => choose(item)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm ${active === item ? 'bg-indigo-50 font-semibold text-indigo-700' : 'hover:bg-slate-50'}`}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
          {['Services', 'Resources', 'About'].map((item) => (
            <li key={item}>
              <button
                type="button"
                aria-current={active === item ? 'page' : undefined}
                onClick={() => choose(item)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${active === item ? 'bg-indigo-600 text-white' : 'hover:bg-white hover:text-indigo-700'}`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <p
        role="status"
        className="mt-6 rounded-lg bg-indigo-50 p-4 text-sm text-indigo-900"
      >
        Selected menu item: <strong>{active}</strong>
      </p>
    </ModulePage>
  )
}
