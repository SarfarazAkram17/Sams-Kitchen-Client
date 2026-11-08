import { useEffect, useState } from "react";
import { FiRotateCcw, FiSearch, FiX } from "react-icons/fi";
import AppSelect from "./AppSelect";

const labelClass = "mb-1.5 block text-sm font-semibold";
const spans = { 0: "", 1: "lg:col-span-7", 2: "lg:col-span-3", 3: "lg:col-span-2" };

// Search box that waits for a pause in typing before telling the page.
const SearchBox = ({ id, label, value, onChange, placeholder }) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    if (text === value) return undefined;
    const timer = setTimeout(() => onChange(text.trim()), 350);
    return () => clearTimeout(timer);
  }, [text, value, onChange]);

  // Follow resets that come from outside.
  useEffect(() => {
    if (value === "") setText("");
  }, [value]);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="auth-field">
        <FiSearch className="shrink-0 text-base-content/50" size={17} aria-hidden="true" />
        <input
          id={id}
          type="search"
          placeholder={placeholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        {text && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setText("");
              onChange("");
            }}
            className="grid size-8 shrink-0 place-items-center rounded-full text-base-content/60 hover:text-primary"
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Search and filters for list pages. Each filter is { key, label, options, value, onChange }.
const ListToolbar = ({
  searchId = "list-search",
  searchLabel = "Search",
  searchPlaceholder = "Search",
  search,
  onSearch,
  hideSearch = false,
  filters = [],
  onReset,
  activeCount = 0,
  summary,
  className = "",
}) => {
  const wide = { 1: "lg:col-span-12", 2: "lg:col-span-6", 3: "lg:col-span-4" };
  const filterSpan = (hideSearch ? wide : spans)[Math.min(filters.length, 3)] || "lg:col-span-2";

  return (
    <section aria-label="Search and filters" className={`surface-panel rounded-3xl p-4 sm:p-5 ${className}`}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {!hideSearch && (
          <div className={`sm:col-span-2 ${filters.length ? "lg:col-span-5" : "lg:col-span-12"}`}>
            <SearchBox
              id={searchId}
              label={searchLabel}
              value={search}
              onChange={onSearch}
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        {filters.map((filter) => (
          <div key={filter.key} className={`min-w-0 ${filterSpan}`}>
            <label htmlFor={`${searchId}-${filter.key}`} className={labelClass}>
              {filter.label}
            </label>
            <AppSelect
              inputId={`${searchId}-${filter.key}`}
              options={filter.options}
              value={filter.value}
              onChange={(option) => filter.onChange(option.value)}
            />
          </div>
        ))}
      </div>

      {(summary || activeCount > 0) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-base-content/70" aria-live="polite">
            {summary}
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="btn btn-sm gap-2 rounded-full border-base-300 bg-base-200/70"
            >
              <FiRotateCcw size={14} aria-hidden="true" />
              Reset ({activeCount})
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default ListToolbar;
