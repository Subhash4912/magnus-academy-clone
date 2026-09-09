import { Link } from 'react-router-dom'
import ModulePage from '../../components/more/ModulePage'
import { routePaths } from '../../utils/navigation'

const linkClass =
  'block rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50'
export default function LinksPage() {
  return (
    <ModulePage
      title="Links"
      description="Examples of internal, external, contact, and same-page navigation links."
    >
      <section id="link-examples" aria-labelledby="links-heading">
        <h2 id="links-heading" className="text-lg font-semibold text-slate-900">
          Link types
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link to={routePaths.dashboard} className={linkClass}>
            Internal: Open Dashboard
          </Link>
          <a
            href="https://developer.mozilla.org/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            External: MDN Web Docs{' '}
            <span className="sr-only">(opens in new tab)</span>
          </a>
          <a
            href="mailto:academy@example.com?subject=Magnus%20Academy"
            className={linkClass}
          >
            Email: academy@example.com
          </a>
          <a href="tel:+919876543210" className={linkClass}>
            Telephone: +91 98765 43210
          </a>
          <a href="#anchor-destination" className={linkClass}>
            Jump to page section
          </a>
        </div>
      </section>
      <div aria-hidden="true" className="h-48" />
      <section
        id="anchor-destination"
        tabIndex={-1}
        className="scroll-mt-28 rounded-xl bg-indigo-50 p-5"
      >
        <h2 className="font-semibold text-indigo-950">Same-page destination</h2>
        <p className="mt-2 text-sm leading-6 text-indigo-800">
          The anchor link moved the browser to this section without loading
          another page.
        </p>
        <a
          href="#link-examples"
          className="mt-4 inline-block text-sm font-semibold text-indigo-700 hover:text-indigo-900"
        >
          Back to top
        </a>
      </section>
    </ModulePage>
  )
}
