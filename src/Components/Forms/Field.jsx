import { useState } from "react";
import { Controller } from "react-hook-form";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import AppSelect from "../Shared/AppSelect";

const Message = ({ id, error, hint }) => (
  <>
    {hint && !error && <p className="mt-1.5 text-xs text-base-content/60">{hint}</p>}
    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-error">
        {error}
      </p>
    )}
  </>
);

const Label = ({ id, children }) => (
  <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
    {children}
  </label>
);

const FieldFrame = ({ id, label, icon: Icon, error, hint, trailing, className = "", children }) => (
  <div className={className}>
    <Label id={id}>{label}</Label>
    <div className="auth-field" data-invalid={Boolean(error)}>
      {Icon && <Icon className="shrink-0 text-base-content/50" size={17} aria-hidden="true" />}
      {children}
      {trailing}
    </div>
    <Message id={id} error={error} hint={hint} />
  </div>
);

// Text input with a label, leading icon and inline error. Accepts the spread
// of react-hook-form's register(), including its ref.
const Field = ({ label, icon, error, hint, trailing, className, id, ...inputProps }) => {
  const fieldId = id || `field-${inputProps.name}`;
  return (
    <FieldFrame id={fieldId} {...{ label, icon, error, hint, trailing, className }}>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...inputProps}
      />
    </FieldFrame>
  );
};

export const TextAreaField = ({ label, error, hint, className = "", id, counter, ...textareaProps }) => {
  const fieldId = id || `field-${textareaProps.name}`;
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <Label id={fieldId}>{label}</Label>
        {counter && <span className="mb-1.5 text-xs tabular-nums text-base-content/60">{counter}</span>}
      </div>
      <textarea
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`textarea w-full resize-none rounded-[var(--radius-field)] px-3.5 py-3 leading-relaxed ${
          error ? "!border-error" : ""
        }`}
        {...textareaProps}
      />
      <Message id={fieldId} error={error} hint={hint} />
    </div>
  );
};

// Dropdown wired to react-hook-form. Looks the same everywhere because it is
// the shared AppSelect; only options change.
export const SelectField = ({
  label,
  control,
  name,
  rules,
  options,
  placeholder = "Select",
  error,
  hint,
  className = "",
  id,
  disabled,
  onValueChange,
}) => {
  const fieldId = id || `field-${name}`;
  return (
    <div className={className}>
      <Label id={fieldId}>{label}</Label>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }) => (
          <AppSelect
            inputId={fieldId}
            options={options}
            placeholder={placeholder}
            isDisabled={disabled}
            invalid={Boolean(error)}
            value={field.value}
            onBlur={field.onBlur}
            onChange={(option) => {
              field.onChange(option.value);
              onValueChange?.(option.value);
            }}
          />
        )}
      />
      <Message id={fieldId} error={error} hint={hint} />
    </div>
  );
};

export const PasswordField = (props) => {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      icon={FiLock}
      trailing={
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="grid size-9 shrink-0 place-items-center rounded-full text-base-content/60 transition-colors hover:text-primary"
        >
          {visible ? <FiEyeOff size={17} /> : <FiEye size={17} />}
        </button>
      }
    />
  );
};

export default Field;
