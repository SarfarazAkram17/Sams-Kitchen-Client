import { FiInbox } from "react-icons/fi";

const EmptyState = ({
  title = "Nothing here yet",
  description = "New activity will appear here when it is available.",
}) => (
  <div className="empty-state flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-200/60 px-6 py-10 text-center">
    <span className="empty-state__icon mb-4 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
      <FiInbox size={22} aria-hidden="true" />
    </span>
    <h3 className="font-semibold text-base-content">{title}</h3>
    <p className="mt-1 max-w-sm text-sm leading-6 text-base-content/60">{description}</p>
  </div>
);

export default EmptyState;
