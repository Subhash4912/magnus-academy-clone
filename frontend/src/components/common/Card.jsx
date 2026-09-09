export default function Card({ children, className = '', ...props }) {
  return (
    <section
      data-gsap-card
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(30,41,59,0.07)] sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}
