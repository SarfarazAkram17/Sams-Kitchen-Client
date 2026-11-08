import { Link } from "react-router";
import { FiArrowLeft } from "react-icons/fi";

// Heading card at the top of every dashboard page (the Manage Profile look):
// eyebrow, title and a short description on the left, optional actions on the
// right, and an optional "back" link above the eyebrow.
const PageHeading = ({
  eyebrow,
  title,
  description,
  backTo,
  backLabel = "Back",
  className = "",
  children,
}) => (
  <header
    className={`dash-hero relative overflow-hidden rounded-3xl border border-base-300 p-5 sm:p-8 ${className}`}
  >
    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backTo && (
          <Link
            to={backTo}
            className="mb-4 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-base-content/70 hover:text-primary"
          >
            <FiArrowLeft aria-hidden="true" /> {backLabel}
          </Link>
        )}
        <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-2 break-words text-3xl leading-tight sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-6 text-base-content/65">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-col gap-3 sm:items-end">{children}</div>
      )}
    </div>
  </header>
);

export default PageHeading;