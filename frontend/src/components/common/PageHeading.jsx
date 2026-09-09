export default function PageHeading({
  title,
  description,
  eyebrow = "Workspace",
}) {
  return (
    <div data-gsap-heading className="mb-7">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
        {eyebrow}
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
