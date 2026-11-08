import { Fragment, useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";
import useAuth from "../../../Hooks/useAuth";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import AppPagination from "../../../Components/Shared/AppPagination";
import EmptyResults from "../../../Components/Shared/EmptyResults";
import ListToolbar from "../../../Components/Shared/ListToolbar";
import PageHeading from "../../../Components/Shared/PageHeading";
import FilterTabs from "../../../Components/Shared/FilterTabs";
import { AllOrdersListSkeleton } from "../../../Components/Skeletons/PageSkeletons";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import OrderItemsList from "../OrderItemsList";

const PAGE_SIZE = 10;

const STATUSES = {
  pending: {
    label: "Awaiting payment",
    icon: FiClock,
    tone: "border-warning/35 bg-warning/10 text-warning",
  },
  confirmed: {
    label: "Being prepared",
    icon: FiPackage,
    tone: "border-info/35 bg-info/10 text-info",
  },
  prepared: {
    label: "Prepared",
    icon: FiPackage,
    tone: "border-info/35 bg-info/10 text-info",
  },
  assigned: {
    label: "Rider assigned",
    icon: FiTruck,
    tone: "border-secondary/35 bg-secondary/10 text-secondary",
  },
  picked: {
    label: "On the way",
    icon: FiTruck,
    tone: "border-info/35 bg-info/10 text-info",
  },
  delivered: {
    label: "Delivered",
    icon: FiCheckCircle,
    tone: "border-success/35 bg-success/10 text-success",
  },
  cancelled: {
    label: "Cancelled",
    icon: FiXCircle,
    tone: "border-error/35 bg-error/10 text-error",
  },
};

const CHIPS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Preparing" },
  { value: "prepared", label: "Prepared" },
  { value: "assigned", label: "Assigned" },
  { value: "picked", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENTS = [
  { value: "", label: "Any payment" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Not paid" },
];

const PERIODS = [
  { value: "", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "highest", label: "Highest total" },
  { value: "lowest", label: "Lowest total" },
];

const defaultFilters = {
  search: "",
  status: "",
  payment: "",
  period: "",
  sort: "newest",
};

const dayString = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// The first and last day (YYYY-MM-DD) of a period such as "7d", counted back from today.
const rangeFor = (period) => {
  const today = new Date();
  const daysBack = { today: 0, "7d": 6, "30d": 29 }[period];
  if (daysBack !== undefined) {
    const start = new Date(today);
    start.setDate(today.getDate() - daysBack);
    return { from: dayString(start), to: dayString(today) };
  }
  if (period === "month") {
    return {
      from: dayString(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: dayString(today),
    };
  }
  return {};
};

const shortId = (order) => `#${String(order._id).slice(-8).toUpperCase()}`;
const customerName = (order) =>
  [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(" ") || "Customer";
const addressOf = (order) =>
  [
    order.customer?.address?.street,
    order.customer?.address?.thana,
    order.customer?.address?.district,
    order.customer?.address?.region,
  ]
    .filter(Boolean)
    .join(", ");
const areaOf = (order) =>
  [order.customer?.address?.thana, order.customer?.address?.district]
    .filter(Boolean)
    .join(", ") || "Not provided";

const StatusBadge = ({ status }) => {
  const detail = STATUSES[status] || {
    label: "Unknown",
    icon: FiClock,
    tone: "border-base-300 bg-base-200 text-base-content/70",
  };
  const Icon = detail.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold ${detail.tone}`}
    >
      <Icon aria-hidden="true" size={13} />
      {detail.label}
    </span>
  );
};

const PaymentBadge = ({ paid }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
      paid ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
    }`}
  >
    {paid ? "Paid" : "Not paid"}
  </span>
);

// Everything about one order that does not fit in the row.
const OrderDetails = ({ order }) => (
  <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
    <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
      <div
        className="max-h-52 overflow-y-auto overscroll-contain"
        role="region"
        aria-label="Items in this order"
        tabIndex={0}
      >
        <OrderItemsList items={order.items || []} />
      </div>
    </div>
    <dl className="space-y-2 rounded-2xl border border-base-300 bg-base-100 p-4 text-sm">
      <div>
        <dt className="text-xs uppercase tracking-wider text-base-content/55">
          Delivery address
        </dt>
        <dd className="mt-0.5 font-medium">
          {addressOf(order) || "Not provided"}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wider text-base-content/55">
          Phone
        </dt>
        <dd className="mt-0.5 font-medium">
          {order.customer?.phone || "Not provided"}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wider text-base-content/55">
          Rider
        </dt>
        <dd className="mt-0.5 font-medium">
          {order.assigned_rider_name || "Not assigned yet"}
        </dd>
      </div>
      <div className="flex justify-between border-t border-base-300 pt-2 text-base-content/70">
        <dt>Subtotal</dt>
        <dd>{formatCurrency(order.subtotal)}</dd>
      </div>
      <div className="flex justify-between text-base-content/70">
        <dt>Delivery</dt>
        <dd>
          {Number(order.deliveryCharge)
            ? formatCurrency(order.deliveryCharge)
            : "Free"}
        </dd>
      </div>
      {Number(order.discount) > 0 && (
        <div className="flex justify-between text-success">
          <dt>Discount</dt>
          <dd>−{formatCurrency(order.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-base-300 pt-2 font-bold">
        <dt>Total</dt>
        <dd className="text-primary">{formatCurrency(order.total)}</dd>
      </div>
    </dl>
  </div>
);

const AllOrders = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const [openId, setOpenId] = useState(null);

  const update = useCallback((patch) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
    setOpenId(null);
  }, []);
  const setSearch = useCallback((search) => update({ search }), [update]);
  const reset = () => {
    setFilters(defaultFilters);
    setPage(1);
    setOpenId(null);
  };

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["allOrders", page, filters],
    enabled: !!userEmail,
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
    queryFn: async () => {
      const res = await axiosSecure.get("/orders/all", {
        params: {
          email: userEmail,
          page,
          limit: PAGE_SIZE,
          search: filters.search || undefined,
          status: filters.status || undefined,
          payment_status: filters.payment || undefined,
          sort: filters.sort,
          ...rangeFor(filters.period),
        },
      });
      return res.data;
    },
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const statusCounts = data?.statusCounts || {};
  const everything = data?.allTimeTotal || 0;
  const revenue = data?.revenue || 0;

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.payment ? 1 : 0) +
    (filters.period ? 1 : 0) +
    (filters.sort !== "newest" ? 1 : 0);

  const toggle = (id) => setOpenId((current) => (current === id ? null : id));

  return (
    <div className="w-full space-y-6 pb-8">
      <PageHeading
        eyebrow="Admin workspace"
        title="All orders"
        description="Every order placed at Sam’s Kitchen, whatever its status. Filter by status, payment or date."
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold">
          <FiShoppingBag aria-hidden="true" className="text-primary" />
          {everything} {everything === 1 ? "order" : "orders"}
        </span>
      </PageHeading>

      <FilterTabs
        label="Filter by status"
        value={filters.status}
        onChange={(value) => update({ status: value })}
        tabs={CHIPS.map((chip) => ({
          key: chip.value,
          label: chip.label,
          count: chip.value ? statusCounts[chip.value] || 0 : everything,
        }))}
      />

      <ListToolbar
        searchId="orders-search"
        searchLabel="Search orders"
        searchPlaceholder="Order ID, customer, phone, area or dish"
        search={filters.search}
        onSearch={setSearch}
        activeCount={activeCount}
        onReset={reset}
        summary={
          isLoading
            ? "Loading orders"
            : `${total} ${total === 1 ? "order" : "orders"} found · ${formatCurrency(revenue)} paid`
        }
        filters={[
          {
            key: "payment",
            label: "Payment",
            options: PAYMENTS,
            value: filters.payment,
            onChange: (payment) => update({ payment }),
          },
          {
            key: "period",
            label: "Placed",
            options: PERIODS,
            value: filters.period,
            onChange: (period) => update({ period }),
          },
          {
            key: "sort",
            label: "Sort by",
            options: SORTS,
            value: filters.sort,
            onChange: (sort) => update({ sort }),
          },
        ]}
      />

      {isLoading ? (
        <AllOrdersListSkeleton />
      ) : isError ? (
        <div
          className="rounded-3xl border border-error/30 bg-base-100 p-8 text-center"
          role="alert"
        >
          <FiAlertCircle
            className="mx-auto text-3xl text-error"
            aria-hidden="true"
          />
          <h2 className="mt-3 font-bold">Orders could not be loaded</h2>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-sm mt-4 gap-2 rounded-full"
          >
            <FiRefreshCw aria-hidden="true" /> Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <EmptyResults
          title="No orders match"
          message="Try another search, or clear the filters."
          onReset={activeCount ? reset : undefined}
        />
      ) : (
        <div
          className={
            isFetching ? "opacity-70 transition-opacity" : "transition-opacity"
          }
        >
          <div className="hidden overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-[var(--shadow-card)] md:block">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200/70 text-xs uppercase tracking-wider text-base-content/60">
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Area</th>
                    <th className="text-center">Items</th>
                    <th className="text-right">Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th className="w-12">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const open = openId === order._id;
                    return (
                      <Fragment key={order._id}>
                        <tr className="hover:bg-base-200/40">
                          <td>
                            <p className="font-mono text-sm font-semibold">
                              {shortId(order)}
                            </p>
                            <p className="mt-0.5 whitespace-nowrap text-xs text-base-content/60">
                              {formatDate(order.placedAt)}
                            </p>
                          </td>
                          <td>
                            <p className="font-semibold">
                              {customerName(order)}
                            </p>
                            <p className="mt-0.5 text-xs text-base-content/60">
                              {order.customer?.phone || "No phone"}
                            </p>
                          </td>
                          <td className="text-sm">{areaOf(order)}</td>
                          <td className="text-center tabular-nums">
                            {order.items?.length || 0}
                          </td>
                          <td className="whitespace-nowrap text-right font-semibold tabular-nums">
                            {formatCurrency(order.total)}
                          </td>
                          <td>
                            <PaymentBadge
                              paid={order.payment_status === "paid"}
                            />
                          </td>
                          <td>
                            <StatusBadge status={order.status} />
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => toggle(order._id)}
                              aria-expanded={open}
                              aria-label={`${open ? "Hide" : "Show"} details for order ${shortId(order)}`}
                              className="grid size-9 place-items-center rounded-full border border-base-300 hover:border-primary hover:text-primary"
                            >
                              <FiChevronDown
                                aria-hidden="true"
                                className={`transition-transform ${open ? "rotate-180" : ""}`}
                              />
                            </button>
                          </td>
                        </tr>
                        {open && (
                          <tr className="bg-base-200/40">
                            <td colSpan={8}>
                              <OrderDetails order={order} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="space-y-3 md:hidden">
            {orders.map((order) => {
              const open = openId === order._id;
              return (
                <li
                  key={order._id}
                  className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold">
                        {shortId(order)}
                      </p>
                      <p className="mt-0.5 text-xs text-base-content/60">
                        {formatDate(order.placedAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-base-300 pt-3 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-base-content/55">
                        Customer
                      </dt>
                      <dd className="mt-0.5 font-medium">
                        {customerName(order)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-base-content/55">
                        Area
                      </dt>
                      <dd className="mt-0.5 font-medium">{areaOf(order)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-base-content/55">
                        Total
                      </dt>
                      <dd className="mt-0.5 font-semibold">
                        {formatCurrency(order.total)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-base-content/55">
                        Payment
                      </dt>
                      <dd className="mt-0.5">
                        <PaymentBadge paid={order.payment_status === "paid"} />
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => toggle(order._id)}
                    aria-expanded={open}
                    className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-base-300 text-sm font-semibold hover:border-primary hover:text-primary"
                  >
                    {open ? "Hide details" : "Show details"}
                    <FiChevronDown
                      aria-hidden="true"
                      className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open && (
                    <div className="mt-3">
                      <OrderDetails order={order} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {total > PAGE_SIZE && (
        <AppPagination
          className="mt-2"
          current={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={(next) => {
            setPage(next);
            setOpenId(null);
          }}
        />
      )}
    </div>
  );
};

export default AllOrders;