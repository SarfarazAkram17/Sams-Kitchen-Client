import { Link } from "react-router";
import { FiArrowUpRight } from "react-icons/fi";
import Reveal from "./Reveal";

/** Eyebrow + serif title + intro, with an optional "see all" link. */
const SectionHeading = ({ id, eyebrow, title, description, action, align = "left" }) => {
  const centered = align === "center";

  return (
    <Reveal
      className={`mb-10 flex flex-col gap-5 sm:mb-14 ${
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-xl"}>
        {eyebrow && (
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-primary">
            <span className="h-px w-6 bg-primary" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="font-display mt-3 text-4xl leading-[1.05] text-base-content sm:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-sm leading-7 text-base-content/70 sm:text-base">{description}</p>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className="group inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-full border border-base-300 bg-base-100 px-5 text-sm font-bold text-base-content transition hover:border-primary hover:text-primary"
        >
          {action.label}
          <FiArrowUpRight className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </Link>
      )}
    </Reveal>
  );
};

export default SectionHeading;
