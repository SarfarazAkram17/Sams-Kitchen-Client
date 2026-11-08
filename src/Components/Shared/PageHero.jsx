// Heading panel for dashboard list pages: eyebrow, title, short note, actions on the right.
const PageHero = ({ eyebrow, title, subtitle, children }) => (
  <header className="dash-hero relative overflow-hidden rounded-3xl border border-base-300 p-5 sm:p-8">
    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 break-words text-3xl leading-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm leading-6 text-base-content/65">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  </header>
);

export default PageHero;
