import { useCallback, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import AppPagination from "../../../Components/Shared/AppPagination";
import { toast } from "react-toastify";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiPhone,
} from "react-icons/fi";
import EmptyState from "../../../Components/Shared/EmptyState";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import OrderItemsList from "../OrderItemsList";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import { KitchenOrdersListSkeleton } from "../../../Components/Skeletons/PageSkeletons";
import useConfirm from "../../../Hooks/useConfirm";
import ListToolbar from "../../../Components/Shared/ListToolbar";
import FilterTabs from "../../../Components/Shared/FilterTabs";
import EmptyResults from "../../../Components/Shared/EmptyResults";
import PageHeading from "../../../Components/Shared/PageHeading";

const PAGE_SIZE = 10;

const TABS = [
  { key: "confirmed", label: "To prepare" },
  { key: "prepared", label: "Prepared" },
];

// Badge for an order's stage. Only paid orders that are waiting to be cooked or
// waiting for a rider are listed here.
const STAGES = {
  confirmed: { label: "To prepare", icon: FiClock, tone: "badge-info" },
  prepared: { label: "Prepared", icon: FiCheckCircle, tone: "badge-success" },
};

const stageNote = (order) =>
  order.status === "prepared"
    ? `Prepared ${formatDate(order.preparedAt)} · waiting for a rider`
    : "";

const KitchenOrders = () => {
  const confirm = useConfirm();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { userEmail } = useAuth();
  const [status, setStatus] = useState("confirmed");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const updateSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);
  const resetFilters = () => {
    setSearch("");
    setSort("");
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["kitchenOrders", status, page, search, sort],
    placeholderData: keepPreviousData,
    enabled: !!userEmail,
    refetchInterval: 30000,
    queryFn: async () => {
      const res = await axiosSecure.get("/orders/kitchen", {
        params: {
          email: userEmail,
          status,
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          sort: sort || undefined,
        },
      });
      return res.data;
    },
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const counts = data?.counts || {};

  const markPrepared = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosSecure.patch(`/orders/${orderId}/prepared`, null, {
        params: { email: userEmail },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Order marked as prepared. Riders nearby were notified.");
      if (orders.length === 1 && page > 1) setPage(page - 1);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "The order could not be updated.",
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["kitchenOrders"] }),
  });

  const handleMarkPrepared = async (order) => {
    const thana = order.customer?.address?.thana;
    const confirmed = await confirm({
      title: "Mark as prepared?",
      message: `Riders in ${thana || "the delivery area"} will be notified to pick this order up.`,
      confirmLabel: "Yes, it's prepared",
    });
    if (confirmed) markPrepared.mutate(order._id);
  };

  // Each tab starts from its own default order: To prepare is oldest first,
  // Prepared is newest first. A sort picked on one tab must not carry over to
  // the next.
  const changeTab = (key) => {
    setStatus(key);
    setSort("");
    setPage(1);
  };

  return (
    <div className="w-full space-y-6 pb-8">
      <PageHeading
        eyebrow="Admin workspace"
        title="Kitchen orders"
        description="Confirmed orders wait here while the chef cooks. Mark an order as prepared to offer it to riders."
      />

      <FilterTabs
        label="Order stage"
        value={status}
        onChange={changeTab}
        tabs={TABS.map(({ key, label }) => ({
          key,
          label,
          count: counts[key] ?? 0,
        }))}
      />

      <ListToolbar
        searchId="kitchen-search"
        searchLabel="Search orders"
        searchPlaceholder="Order ID, customer, thana or dish"
        search={search}
        onSearch={updateSearch}
        activeCount={(search ? 1 : 0) + (sort ? 1 : 0)}
        onReset={resetFilters}
        summary={
          isLoading
            ? "Loading orders"
            : `${total} ${total === 1 ? "order" : "orders"} found`
        }
        filters={[
          {
            key: "sort",
            label: "Order",
            options: [
              {
                value: "",
                label:
                  status === "confirmed"
                    ? "Default (oldest first)"
                    : "Default (newest first)",
              },
              { value: "oldest", label: "Oldest first" },
              { value: "newest", label: "Newest first" },
            ],
            value: sort,
            onChange: (value) => {
              setSort(value);
              setPage(1);
            },
          },
        ]}
      />

      {isLoading ? (
        <KitchenOrdersListSkeleton count={4} />
      ) : isError ? (
        <div
          className="rounded-2xl border border-error/30 bg-error/10 p-6 text-center"
          role="alert"
        >
          <p className="font-semibold text-base-content">
            Kitchen orders could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-sm btn-primary mt-4"
          >
            Try again
          </button>
        </div>
      ) : orders.length === 0 && search ? (
        <EmptyResults
          title="No orders match"
          message="Try another order ID, customer, area or dish."
          onReset={resetFilters}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title={
            status === "confirmed"
              ? "No orders to prepare"
              : "No prepared orders waiting"
          }
          description={
            status === "confirmed"
              ? "Paid orders will appear here as soon as they are confirmed."
              : "Orders you mark as prepared stay here until a rider picks them up."
          }
        />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            {orders.map((order) => {
              const customer = order.customer || {};
              const address = customer.address || {};
              const addressLine = [
                address.street,
                address.thana,
                address.district,
                address.region,
              ]
                .filter(Boolean)
                .join(", ");
              const isBusy =
                markPrepared.isPending && markPrepared.variables === order._id;

              return (
                <article
                  key={order._id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3 border-b border-base-300 bg-base-200/60 px-4 py-4 sm:px-5">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
                        Order
                      </p>
                      <h2 className="mt-1 truncate font-mono text-sm font-semibold text-base-content">
                        {String(order._id).toUpperCase()}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/70">
                        <FiCalendar aria-hidden="true" />
                        Confirmed {formatDate(order.paidAt)}
                      </p>
                    </div>
                    {(() => {
                      const stage = STAGES[order.status] || STAGES.confirmed;
                      const StageIcon = stage.icon;
                      return (
                        <span
                          className={`badge ${stage.tone} gap-1 rounded-full px-3 py-3 font-semibold`}
                        >
                          <StageIcon aria-hidden="true" />
                          {stage.label}
                        </span>
                      );
                    })()}
                  </header>

                  <div className="grid flex-1 grid-rows-[auto_auto_1fr] gap-3 p-4 sm:grid-cols-2 sm:grid-rows-[auto_1fr] sm:p-5">
                    <section className="rounded-xl bg-base-200 p-3.5">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/60">
                        <FiPhone className="text-info" aria-hidden="true" />
                        Customer
                      </h3>
                      <p className="mt-2 font-semibold text-base-content">
                        {[customer.firstName, customer.lastName]
                          .filter(Boolean)
                          .join(" ") || "Customer"}
                      </p>
                      <p className="mt-1 break-all text-sm text-base-content/75">
                        {customer.phone || "Phone not provided"}
                      </p>
                    </section>

                    <section className="rounded-xl bg-base-200 p-3.5">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/60">
                        <FiMapPin className="text-info" aria-hidden="true" />
                        Delivery address
                      </h3>
                      <p className="mt-2 text-sm leading-5 text-base-content">
                        {addressLine || "Address not provided"}
                      </p>
                    </section>

                    <section className="flex flex-col overflow-hidden rounded-xl border border-base-300 sm:col-span-2">
                      <div className="flex shrink-0 items-center justify-between gap-3 bg-base-200 px-3.5 py-2.5">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-base-content">
                          <FiPackage
                            className="text-primary"
                            aria-hidden="true"
                          />
                          Food to prepare
                        </h3>
                        <span className="text-xs text-base-content/65">
                          {order.items?.length || 0} item
                          {order.items?.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div
                        className="min-h-[7.5rem] grow basis-0 overflow-y-auto overscroll-contain"
                        role="region"
                        aria-label="Food items list"
                        tabIndex={0}
                      >
                        <OrderItemsList items={order.items || []} />
                      </div>
                    </section>
                  </div>

                  <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4 py-4 sm:px-5">
                    <p className="text-sm text-base-content/70">
                      Order total{" "}
                      <strong className="text-base-content">
                        {formatCurrency(order.total)}
                      </strong>
                    </p>
                    {order.status === "confirmed" ? (
                      <button
                        type="button"
                        className="btn btn-sm min-h-10 rounded-full bg-primary px-4 text-primary-content"
                        onClick={() => handleMarkPrepared(order)}
                        disabled={isBusy}
                      >
                        {isBusy ? (
                          <span
                            className="loading loading-spinner loading-xs"
                            aria-label="Updating order"
                          />
                        ) : (
                          "Mark as prepared"
                        )}
                      </button>
                    ) : (
                      <p className="text-xs text-base-content/65">
                        {stageNote(order)}
                      </p>
                    )}
                  </footer>
                </article>
              );
            })}
          </div>

          {total > PAGE_SIZE && (
            <AppPagination
              className="pt-2"
              current={page}
              total={total}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default KitchenOrders;