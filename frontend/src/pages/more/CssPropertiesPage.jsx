import { useState } from 'react'
import ModulePage from '../../components/more/ModulePage'

const initial = {
  width: 240,
  height: 160,
  radius: 16,
  padding: 20,
  margin: 8,
  fontSize: 18,
  opacity: 100,
  rotation: 0,
  shadow: true,
  color: '#ffffff',
  background: '#4f46e5',
}
const ranges = [
  ['width', 'Width', 140, 360, 'px'],
  ['height', 'Height', 100, 260, 'px'],
  ['radius', 'Border Radius', 0, 60, 'px'],
  ['padding', 'Padding', 0, 48, 'px'],
  ['margin', 'Margin', 0, 40, 'px'],
  ['fontSize', 'Font Size', 12, 36, 'px'],
  ['opacity', 'Opacity', 20, 100, '%'],
  ['rotation', 'Rotation', -20, 20, '°'],
]
export default function CssPropertiesPage() {
  const [styles, setStyles] = useState(initial)
  const change = (name, value) =>
    setStyles((current) => ({ ...current, [name]: value }))
  const preview = {
    width: styles.width,
    height: styles.height,
    borderRadius: styles.radius,
    padding: styles.padding,
    margin: styles.margin,
    fontSize: styles.fontSize,
    opacity: styles.opacity / 100,
    transform: `rotate(${styles.rotation}deg)`,
    boxShadow: styles.shadow
      ? '0 20px 35px -15px rgb(15 23 42 / 0.45)'
      : 'none',
    color: styles.color,
    backgroundColor: styles.background,
  }
  const code = [
    `width: ${styles.width}px;`,
    `height: ${styles.height}px;`,
    `border-radius: ${styles.radius}px;`,
    `padding: ${styles.padding}px;`,
    `margin: ${styles.margin}px;`,
    `font-size: ${styles.fontSize}px;`,
    `opacity: ${(styles.opacity / 100).toFixed(2)};`,
    `transform: rotate(${styles.rotation}deg);`,
    `box-shadow: ${styles.shadow ? '0 20px 35px -15px rgb(15 23 42 / 0.45)' : 'none'};`,
    `color: ${styles.color};`,
    `background-color: ${styles.background};`,
  ]
  return (
    <ModulePage
      title="CSS Properties"
      description="Adjust CSS values and see the preview update immediately."
      card={false}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
        <section
          aria-labelledby="css-controls"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id="css-controls"
              className="text-lg font-semibold text-slate-900"
            >
              Controls
            </h2>
            <button
              type="button"
              onClick={() => setStyles(initial)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
          <div className="mt-5 space-y-5">
            {ranges.map(([name, label, min, max, unit]) => (
              <div key={name} className="text-sm font-medium">
                <span className="mb-2 flex justify-between gap-3">
                  <label htmlFor={`css-${name}`}>{label}</label>
                  <output>
                    {styles[name]}
                    {unit}
                  </output>
                </span>
                <input
                  id={`css-${name}`}
                  type="range"
                  min={min}
                  max={max}
                  value={styles[name]}
                  onChange={(event) => change(name, Number(event.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <label className="text-sm font-medium">
              Text Color
              <input
                type="color"
                value={styles.color}
                onChange={(event) => change('color', event.target.value)}
                className="mt-2 block h-11 w-full rounded border border-slate-300 bg-white p-1"
              />
            </label>
            <label className="text-sm font-medium">
              Background Color
              <input
                type="color"
                value={styles.background}
                onChange={(event) => change('background', event.target.value)}
                className="mt-2 block h-11 w-full rounded border border-slate-300 bg-white p-1"
              />
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={styles.shadow}
                onChange={(event) => change('shadow', event.target.checked)}
                className="size-4 accent-indigo-600"
              />
              Show shadow
            </label>
          </div>
        </section>
        <div className="min-w-0 space-y-6">
          <section
            aria-labelledby="preview-heading"
            className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 sm:p-8"
          >
            <h2 id="preview-heading" className="sr-only">
              Live preview
            </h2>
            <div
              style={preview}
              className="flex max-w-full items-center justify-center text-center font-semibold transition-all"
            >
              Live CSS preview
            </div>
          </section>
          <section
            aria-labelledby="generated-css"
            className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-slate-100"
          >
            <h2 id="generated-css" className="mb-4 font-semibold">
              Generated CSS
            </h2>
            <pre className="overflow-x-auto text-xs leading-6">
              <code>{code.join('\n')}</code>
            </pre>
          </section>
        </div>
      </div>
    </ModulePage>
  )
}
