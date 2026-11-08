import { useEffect, useState } from "react";
import { FiRotateCcw, FiSearch, FiX } from "react-icons/fi";
import AppSelect from "./AppSelect";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
  { value: "name", label: "Name: A to Z" },
];

const DISCOUNT_OPTIONS = [
  { value: "", label: "Any discount" },
  { value: "10", label: "10% or more" },
  { value: "20", label: "20% or more" },
  { value: "30", label: "30% or more" },
  { value: "50", label: "50% or more" },
];

const labelClass = "mb-1.5 block text-sm font-semibold";

// Whole-number price input: strips anything that is not a digit.
const PriceInput = ({ id, label, value, onChange }) => (
  <div>
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    <div className="auth-field">
      <span className="text-sm font-semibold text-base-content/60" aria-hidden="true">
        ৳
      </span>
      <input
        id={id}
        inputMode="numeric"
        placeholder="Any"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
      />
    </div>
  </div>
);

const Toggle = ({ checked, onChange, children }) => (
  <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-base-300 bg-base-200/60 py-2 pl-3 pr-4 text-sm font-semibold transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="checkbox checkbox-primary checkbox-sm"
    />
    {children}
  </label>
);

// Filters shared by All Foods and Offers. `mode="offers"` swaps the on-offer
// toggle for a minimum-discount picker, since every dish there is discounted.
const FoodFilters = ({ filters, onChange, onReset, activeCount, mode, resultCount }) => {
  const [searchText, setSearchText] = useState(filters.search);

  // Wait for a pause in typing before asking the server.
  useEffect(() => {
    if (searchText === filters.search) return undefined;
    const timer = setTimeout(() => onChange({ search: searchText.trim() }), 350);
    return () => clearTimeout(timer);
  }, [searchText, filters.search, onChange]);

  // Keep the box in step when the filters are reset from outside.
  useEffect(() => {
    if (filters.search === "") setSearchText("");
  }, [filters.search]);

  const priceConflict =
    filters.minPrice !== "" &&
    filters.maxPrice !== "" &&
    Number(filters.minPrice) > Number(filters.maxPrice);

  return (
    <section aria-label="Filter dishes" className="surface-panel mb-8 rounded-3xl p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-5">
          <label htmlFor="food-search" className={labelClass}>
            Search dishes
          </label>
          <div className="auth-field">
            <FiSearch className="shrink-0 text-base-content/50" size={17} aria-hidden="true" />
            <input
              id="food-search"
              type="search"
              placeholder="Name or description"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            {searchText && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchText("");
                  onChange({ search: "" });
                }}
                className="grid size-8 shrink-0 place-items-center rounded-full text-base-content/60 hover:text-primary"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <label htmlFor="food-sort" className={labelClass}>
            Sort by
          </label>
          <AppSelect
            inputId="food-sort"
            options={SORT_OPTIONS}
            value={filters.sort}
            onChange={(selected) => onChange({ sort: selected.value })}
          />
        </div>

        <div className="lg:col-span-2">
          <PriceInput
            id="food-min-price"
            label="Min price"
            value={filters.minPrice}
            onChange={(minPrice) => onChange({ minPrice })}
          />
        </div>
        <div className="lg:col-span-2">
          <PriceInput
            id="food-max-price"
            label="Max price"
            value={filters.maxPrice}
            onChange={(maxPrice) => onChange({ maxPrice })}
          />
        </div>
      </div>

      {priceConflict && (
        <p role="alert" className="mt-3 text-sm font-medium text-error">
          Minimum price is higher than maximum price, so nothing can match.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Toggle checked={filters.available} onChange={(available) => onChange({ available })}>
          Available now
        </Toggle>

        {mode === "offers" ? (
          <div className="w-full min-w-0 sm:w-52">
            <AppSelect
              aria-label="Minimum discount"
              options={DISCOUNT_OPTIONS}
              value={filters.minDiscount}
              onChange={(selected) => onChange({ minDiscount: selected.value })}
            />
          </div>
        ) : (
          <Toggle checked={filters.onOffer} onChange={(onOffer) => onChange({ onOffer })}>
            On offer
          </Toggle>
        )}

        <div className="flex w-full flex-wrap items-center gap-3 text-sm sm:ml-auto sm:w-auto">
          <span className="text-base-content/70" aria-live="polite">
            {resultCount} {resultCount === 1 ? "dish" : "dishes"}
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
      </div>
    </section>
  );
};

export default FoodFilters;
