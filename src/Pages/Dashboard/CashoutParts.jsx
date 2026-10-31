import { FiCheckCircle, FiClock, FiImage } from "react-icons/fi";
import { CASHOUT_METHODS } from "../../lib/cashoutMethods";

const maskCardNumber = (value = "") => `•••• •••• •••• ${value.slice(-4)}`;

export const CashoutStatusBadge = ({ status }) =>
  status === "cashed_out" ? (
    <span className="badge badge-success gap-1 rounded-full px-3 py-3 font-semibold">
      <FiCheckCircle aria-hidden="true" />
      Cashed out
    </span>
  ) : (
    <span className="badge badge-warning gap-1 rounded-full px-3 py-3 font-semibold">
      <FiClock aria-hidden="true" />
      Pending payment
    </span>
  );

// Lists the details the rider entered for a payout method.
// Riders see their own card number masked; admins need the full number.
export const PayoutDetails = ({ method, details = {}, maskCard = false }) => {
  const config = CASHOUT_METHODS[method];
  if (!config) return null;

  return (
    <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
      {config.fields.map(({ name, label, options }) => {
        const raw = details[name];
        const value =
          name === "cardNumber" && maskCard
            ? maskCardNumber(raw)
            : options?.find((option) => option.value === raw)?.label || raw;
        return (
          <div key={name} className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
              {label}
            </dt>
            <dd className="break-words font-medium text-base-content">
              {value || "Not provided"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
};

export const ProofPreview = ({ url }) => (
  <a
    href={url}
    target="_blank"
    rel="noreferrer"
    className="group inline-flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-2 pr-4 transition hover:border-primary"
  >
    <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-base-200 text-base-content/40">
      <FiImage aria-hidden="true" />
      <img
        src={url}
        alt="Payment proof"
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
        onError={(event) => event.currentTarget.remove()}
      />
    </span>
    <span className="text-sm font-semibold text-base-content group-hover:text-primary">
      View payment proof
    </span>
  </a>
);
