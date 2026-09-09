import { useEffect, useRef } from 'react'
import {
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../animations/gsap'

export default function Modal({ open, title, onClose, children, actions }) {
  const dialog = useRef(null)

  useGSAP(
    () => {
      if (!open || !dialog.current || prefersReducedMotion()) return
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
    {
      scope: dialog,
      dependencies: [open],
      revertOnUpdate: true,
    },
  )

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  if (!open) return null
  const titleId = `modal-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-700 shadow-2xl backdrop:bg-slate-950/60"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <button
          type="button"
          aria-label={`Close ${title}`}
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          ×
        </button>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {actions && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-5 py-4 sm:px-6">
          {actions}
        </div>
      )}
    </dialog>
  )
}
