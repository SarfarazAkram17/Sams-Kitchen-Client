import { FiPackage } from "react-icons/fi";
import { formatCurrency } from "../../lib/formatters";

// Every row has the same fixed height (h-24) so a scroll window of max-h-24
// shows exactly one item.
const OrderItemsList = ({ items = [] }) => (
  <ul className="divide-y divide-base-300">
    {items.length ? (
      items.map((item, index) => (
        <li
          key={`${item._id || item.foodId || item.name || "item"}-${index}`}
          className="flex h-24 items-center gap-3 px-3 sm:px-3.5"
        >
          <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-base-300 bg-base-200 text-base-content/45 sm:size-[4.5rem]">
            <FiPackage size={19} aria-hidden="true" />
            {item.image && (
              <img
                src={item.image}
                alt={item.name || "Food item"}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
                onError={(event) => event.currentTarget.remove()}
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="min-w-0">
              <p
                title={item.name || "Menu item"}
                className="truncate text-sm font-semibold text-base-content"
              >
                {item.name || "Menu item"}
              </p>
              <p className="mt-0.5 text-xs text-base-content/65">
                Quantity: {Number(item.quantity) || 1}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-base-content">
              {formatCurrency(
                item.subtotal ??
                  Number(item.price || 0) * (Number(item.quantity) || 1),
              )}
            </span>
          </div>
        </li>
      ))
    ) : (
      <li className="px-3.5 py-3 text-sm text-base-content/65">
        No item details available.
      </li>
    )}
  </ul>
);

export default OrderItemsList;
