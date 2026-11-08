import { useCallback, useEffect, useRef, useState } from "react";
import { FiAlertTriangle, FiHelpCircle } from "react-icons/fi";
import { ConfirmContext } from "./ConfirmContext";

// Promise-based confirmation dialog: `const ok = await confirm({ title, message, ... })`.
// With an `input` option ({ label, placeholder, maxLength }) it also asks for a short note and
// resolves to the note (a string, possibly empty) when confirmed, or to `null` when cancelled.
const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const [note, setNote] = useState("");
  const resolver = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setNote("");
        setDialog(options);
      }),
    [],
  );

  const close = useCallback(
    (confirmed) => {
      const answer = dialog?.input ? (confirmed ? note.trim() : null) : confirmed;
      resolver.current?.(answer);
      resolver.current = null;
      setDialog(null);
    },
    [dialog, note],
  );

  useEffect(() => {
    if (!dialog) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") close(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dialog, close]);

  const danger = dialog?.tone === "danger";
  const Icon = danger ? FiAlertTriangle : FiHelpCircle;

  return (
    <ConfirmContext value={confirm}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[1200] grid place-items-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
            onClick={() => close(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            className="surface-panel relative w-full max-w-md rounded-3xl p-6 shadow-[var(--shadow-float)] sm:p-7"
          >
            <span
              className={`grid size-12 place-items-center rounded-2xl ${
                danger ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
              }`}
            >
              <Icon size={22} aria-hidden="true" />
            </span>
            <h2 id="confirm-title" className="mt-4 font-display text-2xl">
              {dialog.title}
            </h2>
            {dialog.message && (
              <p id="confirm-message" className="mt-2 text-sm leading-6 text-base-content/70">
                {dialog.message}
              </p>
            )}
            {dialog.input && (
              <div className="mt-4">
                <label htmlFor="confirm-note" className="mb-1.5 block text-sm font-semibold">
                  {dialog.input.label}
                </label>
                <textarea
                  id="confirm-note"
                  rows={3}
                  maxLength={dialog.input.maxLength || 300}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={dialog.input.placeholder}
                  className="textarea w-full resize-none rounded-[var(--radius-field)] px-3.5 py-3 leading-relaxed"
                />
                <p className="mt-1 text-right text-xs tabular-nums text-base-content/55">
                  {note.length}/{dialog.input.maxLength || 300}
                </p>
              </div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" autoFocus onClick={() => close(false)} className="btn h-11 sm:min-w-28">
                {dialog.cancelLabel || "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`btn h-11 sm:min-w-32 ${
                  danger ? "border-accent bg-accent text-accent-content hover:brightness-110" : "btn-primary"
                }`}
              >
                {dialog.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext>
  );
};

export default ConfirmProvider;
