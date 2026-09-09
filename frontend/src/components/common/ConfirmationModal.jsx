import { useEffect, useRef } from 'react'
import Button from './Button'
import {
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../animations/gsap'

export default function ConfirmationModal({
  title,
  children,
  busy,
  error,
  onCancel,
  onConfirm,
}) {
  const dialog = useRef(null)
  const cancel = useRef(null)
  useGSAP(
    () => {
      if (prefersReducedMotion() || !dialog.current) return
      gsap.fromTo(
        dialog.current,
        { y: 24, scale: 0.96, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.38,
          ease: 'back.out(1.45)',
        },
      )
    },
    { scope: dialog },
  )
  useEffect(() => {
    const element = dialog.current
    const previous = document.activeElement
    element.showModal()
    cancel.current.focus()
    document.body.classList.add('overflow-hidden')
    return () => {
      element.close()
      document.body.classList.remove('overflow-hidden')
      if (previous?.isConnected) previous.focus()
      else document.getElementById('employee-name')?.focus()
    }
  }, [])

  function trapFocus(event) {
    if (event.key !== 'Tab') return
    const controls = [
      ...dialog.current.querySelectorAll('button:not(:disabled)'),
    ]
    if (!controls.length) {
      event.preventDefault()
      return
    }
    const first = controls[0],
      last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-description"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
      onKeyDown={trapFocus}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border-0 bg-white p-6 text-slate-700 shadow-xl backdrop:bg-slate-950/50"
    >
      <h2
        id="confirmation-title"
        className="text-xl font-semibold text-slate-900"
      >
        {title}
      </h2>
      <div
        id="confirmation-description"
        className="mt-3 break-words text-sm leading-6"
      >
        {children}
      </div>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800"
        >
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          ref={cancel}
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <Button
          disabled={busy}
          onClick={onConfirm}
          className="border-rose-300 text-rose-700 hover:bg-rose-50"
        >
          {busy ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </dialog>
  )
}
