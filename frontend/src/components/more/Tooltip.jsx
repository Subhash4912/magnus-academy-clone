import { useId } from 'react'

export default function Tooltip({ label, children }) {
  const id = useId()
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-describedby={id}
        className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700"
      >
        {children}
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-48 -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-center text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900"
        />
      </span>
    </span>
  )
}
