import { useState } from 'react'
import ModulePage from '../../components/more/ModulePage'
import Modal from '../../components/more/Modal'
import { galleryImages } from '../../utils/moreContent'

export default function ImagesPage() {
  const [selected, setSelected] = useState(null)
  const [failed, setFailed] = useState([])
  function markFailed(title) {
    setFailed((items) => (items.includes(title) ? items : [...items, title]))
  }
  return (
    <ModulePage
      title="Images"
      description="Select an original local illustration to open a larger preview."
      card={false}
    >
      <section
        aria-label="Image gallery"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        {galleryImages.map((image) => (
          <button
            key={image.title}
            type="button"
            onClick={() => setSelected(image)}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {failed.includes(image.title) ? (
              <div className="flex aspect-[8/5] items-center justify-center bg-slate-100 p-5 text-center text-sm text-slate-500">
                Image unavailable
              </div>
            ) : (
              <img
                src={image.src}
                alt={image.alt}
                onError={() => markFailed(image.title)}
                className="aspect-[8/5] w-full object-cover"
              />
            )}
            <span className="block p-4 font-semibold text-slate-900">
              {image.title}
            </span>
          </button>
        ))}
      </section>
      <Modal
        open={Boolean(selected)}
        title={selected ? `${selected.title} preview` : 'Image preview'}
        onClose={() => setSelected(null)}
      >
        {selected &&
          (failed.includes(selected.title) ? (
            <div className="flex aspect-[8/5] items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              Image preview unavailable.
            </div>
          ) : (
            <img
              src={selected.src}
              alt={selected.alt}
              onError={() => markFailed(selected.title)}
              className="w-full rounded-xl"
            />
          ))}
        {selected && (
          <p className="mt-4 text-sm text-slate-600">
            Category: {selected.title}
          </p>
        )}
      </Modal>
    </ModulePage>
  )
}
