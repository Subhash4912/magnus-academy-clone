import { useState } from 'react'
import ModulePage from '../../components/more/ModulePage'
import { slides } from '../../utils/moreContent'

export default function SliderPage() {
  const [index, setIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)
  const slide = slides[index]
  function show(next) {
    setIndex((next + slides.length) % slides.length)
    setImageFailed(false)
  }
  return (
    <ModulePage
      title="Slider"
      description="Move through four content slides using controls or arrow keys."
    >
      <section
        aria-roledescription="carousel"
        aria-label="Learning highlights"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') show(index - 1)
          if (event.key === 'ArrowRight') show(index + 1)
        }}
        className="overflow-hidden rounded-xl border border-slate-200"
        tabIndex={0}
      >
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
          className="grid bg-slate-50 md:grid-cols-2"
        >
          {imageFailed ? (
            <div className="flex aspect-[8/5] items-center justify-center bg-slate-100 text-sm text-slate-500">
              Slide image unavailable
            </div>
          ) : (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              onError={() => setImageFailed(true)}
              className="aspect-[8/5] h-full w-full object-cover"
            />
          )}
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Slide {index + 1}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              {slide.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {slide.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white p-4">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => show(index - 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Previous
          </button>
          <div className="flex gap-2" aria-label="Choose slide">
            {slides.map((item, itemIndex) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Go to slide ${itemIndex + 1}: ${item.title}`}
                aria-current={itemIndex === index ? 'true' : undefined}
                onClick={() => show(itemIndex)}
                className={`size-3 rounded-full ${itemIndex === index ? 'bg-indigo-600' : 'bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => show(index + 1)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </section>
    </ModulePage>
  )
}
