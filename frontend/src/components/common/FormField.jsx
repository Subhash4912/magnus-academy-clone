export default function FormField({
  name,
  label,
  error,
  required = false,
  as: Control = 'input',
  children,
  ...props
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-rose-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <Control
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`block min-w-0 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-100 ${error ? 'border-rose-500' : 'border-slate-300'}`}
        {...props}
      >
        {children}
      </Control>
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm text-rose-700">
          {error}
        </p>
      )}
    </div>
  )
}
