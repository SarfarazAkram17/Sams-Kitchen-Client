const FilterTabs = ({ tabs, value, onChange, label, className = "" }) => (
  <div
    role="tablist"
    aria-label={label}
    className={`flex flex-wrap gap-2 ${className}`}
  >
    {tabs.map(({ key, label: text, count }) => (
      <button
        key={key || "all"}
        type="button"
        role="tab"
        aria-selected={value === key}
        onClick={() => onChange(key)}
        className={`btn btn-sm min-h-10 rounded-full ${
          value === key
            ? "btn-primary"
            : "border border-base-300 bg-base-100 text-base-content"
        }`}
      >
        {text}
        {count !== undefined && <span className="ml-1 font-bold">{count}</span>}
      </button>
    ))}
  </div>
);

export default FilterTabs;