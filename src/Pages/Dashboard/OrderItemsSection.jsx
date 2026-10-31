import { FiPackage } from "react-icons/fi";
import OrderItemsList from "./OrderItemsList";

// Header stays fixed. The list below shows one item at a time and scrolls on
// its own when an order has more.
const OrderItemsSection = ({ items = [], className = "" }) => {
  const count = items.length;

  return (
    <section
      className={`overflow-hidden rounded-xl border border-base-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 bg-base-200 px-3.5 py-2.5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-base-content">
          <FiPackage className="text-primary" aria-hidden="true" />
          Food items
        </h3>
        <span className="text-right text-xs text-base-content/65">
          {count} {count === 1 ? "item" : "items"}
          {count > 1 && (
            <span className="hidden sm:inline"> · scroll for more</span>
          )}
        </span>
      </div>
      <div
        className="max-h-24 overflow-y-auto overscroll-contain"
        role="region"
        aria-label="Food items list"
        tabIndex={0}
      >
        <OrderItemsList items={items} />
      </div>
    </section>
  );
};

export default OrderItemsSection;
