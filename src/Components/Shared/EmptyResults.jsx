import { FiSearch } from "react-icons/fi";

// Shown when search or filters match nothing.
const EmptyResults = ({ title = "Nothing matches", message = "Try a different search or reset the filters.", onReset }) => (
  <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 px-6 py-12 text-center">
    <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
      <FiSearch size={22} aria-hidden="true" />
    </span>
    <h2 className="mt-4 text-lg font-bold">{title}</h2>
    <p className="mx-auto mt-1 max-w-sm text-sm text-base-content/65">{message}</p>
    {onReset && (
      <button type="button" onClick={onReset} className="btn btn-primary btn-sm mt-5 rounded-full px-5">
        Reset filters
      </button>
    )}
  </div>
);

export default EmptyResults;
