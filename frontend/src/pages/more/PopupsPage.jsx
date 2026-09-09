import { useState } from 'react'
import ModulePage from '../../components/more/ModulePage'
import Modal from '../../components/more/Modal'

const primary =
  'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
const secondary =
  'rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50'
export default function PopupsPage() {
  const [popup, setPopup] = useState(null)
  const [project, setProject] = useState('')
  const [message, setMessage] = useState('')
  function complete(text) {
    setPopup(null)
    setMessage(text)
  }
  function submit(event) {
    event.preventDefault()
    const value = project.trim()
    if (!value) return
    complete(`Form submitted for “${value}”.`)
    setProject('')
  }
  return (
    <ModulePage
      title="Popups"
      description="Open information, confirmation, and form dialogs without browser alerts."
    >
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={secondary}
          onClick={() => {
            setMessage('')
            setPopup('information')
          }}
        >
          Open Information Popup
        </button>
        <button
          type="button"
          className={secondary}
          onClick={() => {
            setMessage('')
            setPopup('confirmation')
          }}
        >
          Open Confirmation Popup
        </button>
        <button
          type="button"
          className={secondary}
          onClick={() => {
            setMessage('')
            setPopup('form')
          }}
        >
          Open Form Popup
        </button>
      </div>
      {message && (
        <p
          role="status"
          className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {message}
        </p>
      )}
      <Modal
        open={popup === 'information'}
        title="Information"
        onClose={() => setPopup(null)}
        actions={
          <button
            type="button"
            className={primary}
            onClick={() => setPopup(null)}
          >
            Close
          </button>
        }
      >
        <p className="text-sm leading-6">
          This modal uses the native dialog element, which keeps keyboard focus
          inside the popup and blocks background interaction.
        </p>
      </Modal>
      <Modal
        open={popup === 'confirmation'}
        title="Confirm Action"
        onClose={() => setPopup(null)}
        actions={
          <>
            <button
              type="button"
              className={secondary}
              onClick={() => setPopup(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={primary}
              onClick={() => complete('Action confirmed successfully.')}
            >
              Confirm
            </button>
          </>
        }
      >
        <p className="text-sm leading-6">
          Are you sure you want to confirm this demonstration action?
        </p>
      </Modal>
      <Modal
        open={popup === 'form'}
        title="Create Project"
        onClose={() => setPopup(null)}
      >
        <form onSubmit={submit}>
          <label
            htmlFor="popup-project"
            className="mb-2 block text-sm font-medium"
          >
            Project name
          </label>
          <input
            id="popup-project"
            autoFocus
            required
            value={project}
            onChange={(event) => setProject(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              className={secondary}
              onClick={() => setPopup(null)}
            >
              Cancel
            </button>
            <button type="submit" className={primary}>
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </ModulePage>
  )
}
