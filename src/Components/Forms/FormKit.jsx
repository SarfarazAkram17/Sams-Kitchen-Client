import { useState } from "react";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";
import PageHeading from "../Shared/PageHeading";

// Page frame for dashboard forms. `standard` gives the full dashboard width; without
// it the page stays narrow (only Manage Profile does that). The heading is the same.
export const FormPage = ({
  eyebrow,
  title,
  subtitle,
  backTo,
  backLabel = "Back",
  standard = false,
  children,
}) => (
  <div
    className={`space-y-6 ${standard ? "w-full pb-8" : "mx-auto w-full max-w-4xl"}`}
  >
    <PageHeading
      eyebrow={eyebrow}
      title={title}
      description={subtitle}
      backTo={backTo}
      backLabel={backLabel}
    />
    {children}
  </div>
);

export const FormSection = ({
  title,
  description,
  children,
  className = "sm:grid-cols-2",
}) => (
  <section className="dash-panel rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
    <div className="mb-5">
      <h2 className="text-base font-bold">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-base-content/60">{description}</p>
      )}
    </div>
    <div className={`grid gap-4 ${className}`}>{children}</div>
  </section>
);

// Drag and drop (or tap) image picker with preview.
export const ImageDropzone = ({
  label,
  hint,
  url,
  uploading,
  error,
  onSelect,
  onRemove,
  disabled,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    if (files?.[0]) onSelect(files[0]);
  };

  return (
    <div className="sm:col-span-2">
      <p className="mb-1.5 text-sm font-semibold">{label}</p>
      {url ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-200/50 p-3 sm:flex-row sm:items-center">
          <img
            src={url}
            alt="Selected dish"
            className="aspect-[4/3] w-full rounded-xl object-cover sm:w-52"
          />
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-sm text-base-content/70">
              Image uploaded. Remove it to choose a different one.
            </p>
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              className="btn btn-sm w-fit gap-2 rounded-full border-error/40 text-error hover:border-error hover:bg-error/10"
            >
              <FiTrash2 aria-hidden="true" /> Remove image
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!disabled && !uploading) handleFiles(event.dataTransfer.files);
          }}
          className={`flex min-h-44 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
            uploading || disabled
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:border-primary hover:bg-primary/5"
          } ${dragging ? "border-primary bg-primary/10" : error ? "border-error" : "border-base-300 bg-base-200/40"}`}
        >
          {uploading ? (
            <span className="loading loading-spinner loading-md text-primary" />
          ) : (
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
              {dragging ? <FiUploadCloud size={22} /> : <FiImage size={22} />}
            </span>
          )}
          <span className="font-semibold">
            {uploading
              ? "Uploading image…"
              : "Drop an image here, or tap to browse"}
          </span>
          <span className="text-xs text-base-content/60">{hint}</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading || disabled}
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
};

// Sticky action bar; the submit button shows a spinner and blocks clicks while busy.
export const FormActions = ({
  onCancel,
  cancelLabel = "Cancel",
  loading,
  loadingLabel,
  children,
}) => (
  <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-base-300 bg-base-100/90 p-3 shadow-[var(--shadow-float)] backdrop-blur sm:flex-row sm:justify-end">
    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="btn h-12 sm:min-w-32"
      >
        {cancelLabel}
      </button>
    )}
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="btn btn-primary h-12 sm:min-w-48"
    >
      {loading ? (
        <>
          <span className="loading loading-spinner loading-sm" /> {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  </div>
);