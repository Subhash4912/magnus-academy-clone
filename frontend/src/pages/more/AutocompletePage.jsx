import { useId, useState } from 'react'
import ModulePage from '../../components/more/ModulePage'

const options = [
  'Ramesh Kumar',
  'Raju Sharma',
  'Prathap Singh',
  'Subhash Pawar',
  'Rahul Verma',
  'Priya Sharma',
  'Bangalore',
  'Hyderabad',
  'Pune',
  'Mumbai',
]
export default function AutocompletePage() {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const matches = query.trim()
    ? options.filter((option) =>
        option.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : []
  function select(value) {
    setQuery(value)
    setOpen(false)
    setHighlighted(0)
  }
  function keyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!matches.length) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setHighlighted((index) =>
        event.key === 'ArrowDown'
          ? (index + 1) % matches.length
          : (index - 1 + matches.length) % matches.length,
      )
    } else if (event.key === 'Enter' && open) {
      event.preventDefault()
      select(matches[highlighted])
    }
  }
  return (
    <ModulePage
      title="Autocomplete"
      description="Type a name or city, then select a filtered local suggestion."
    >
      <div className="relative max-w-xl">
        <label
          htmlFor="autocomplete-input"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Search names and cities
        </label>
        <div className="flex gap-2">
          <input
            id="autocomplete-input"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open && Boolean(query)}
            aria-controls={listId}
            aria-activedescendant={
              open && matches.length ? `${listId}-${highlighted}` : undefined
            }
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
              setHighlighted(0)
            }}
            onFocus={() => query && setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={keyDown}
            placeholder="Try Priya or Pune"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setOpen(false)
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
        {open && query && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
          >
            {matches.length ? (
              matches.map((option, index) => (
                <li
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={highlighted === index}
                  key={option}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => select(option)}
                  className={`cursor-pointer rounded-md px-3 py-2.5 text-sm ${highlighted === index ? 'bg-indigo-50 text-indigo-800' : 'hover:bg-slate-50'}`}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-sm text-slate-500">
                No suggestions found.
              </li>
            )}
          </ul>
        )}
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Use Up/Down arrows, Enter, or Escape. Suggestions are filtered in the
        browser.
      </p>
    </ModulePage>
  )
}
