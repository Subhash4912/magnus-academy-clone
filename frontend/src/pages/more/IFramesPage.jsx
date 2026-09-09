import ModulePage from '../../components/more/ModulePage'

const inlineDemo = `<!doctype html><html><head><style>body{margin:0;padding:24px;font-family:system-ui;background:#f0fdf4;color:#14532d}.card{padding:20px;border:1px solid #86efac;border-radius:14px;background:white}h2{margin-top:0}</style></head><body><div class="card"><h2>Inline iframe</h2><p>This isolated document was supplied with the iframe srcDoc property.</p></div></body></html>`
export default function IFramesPage() {
  return (
    <ModulePage
      title="iFrames"
      description="Two safe embedded documents demonstrate isolated page content."
      card={false}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Local static page</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This Vite public file is guaranteed to load from the same
            application.
          </p>
          <iframe
            title="Local iframe demonstration"
            src="/iframe-demo.html"
            className="mt-4 h-72 w-full rounded-lg border border-slate-200 bg-white"
          />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Inline HTML document</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The srcDoc property embeds a small independent HTML page.
          </p>
          <iframe
            title="Inline HTML iframe demonstration"
            srcDoc={inlineDemo}
            sandbox=""
            className="mt-4 h-72 w-full rounded-lg border border-slate-200 bg-white"
          />
        </section>
      </div>
      <aside className="mt-6 rounded-xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
        <h2 className="font-semibold">External embedding</h2>
        <p className="mt-2">
          Some websites block iframe embedding with security headers. Open
          documentation normally when that happens.
        </p>
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block font-semibold underline"
        >
          Open iframe documentation in a new tab
        </a>
      </aside>
    </ModulePage>
  )
}
