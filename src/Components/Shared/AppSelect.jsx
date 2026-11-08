import Select from "react-select";

// Defined once so the dropdown does not get new style objects on every hover.
const selectStyles = { menuPortal: (base) => ({ ...base, zIndex: 1100 }) };

// The one dropdown used across the site. Same look everywhere (see the
// .select__* rules in index.css); only the options and values change.
// `value` can be an option object or just the option's value.
const AppSelect = ({
  options = [],
  value,
  className = "",
  invalid = false,
  isSearchable = false,
  ...props
}) => {
  const selected =
    value !== null && typeof value === "object"
      ? value
      : (options.find((option) => option.value === value) ?? null);

  return (
    <Select
      classNamePrefix="select"
      className={`app-select text-sm ${invalid ? "select-invalid" : ""} ${className}`}
      options={options}
      value={selected}
      isSearchable={isSearchable}
      menuPlacement="auto"
      menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
      styles={selectStyles}
      // The page must not scroll or jump while you move over the options.
      menuShouldScrollIntoView={false}
      closeMenuOnScroll={false}
      {...props}
    />
  );
};

export default AppSelect;
