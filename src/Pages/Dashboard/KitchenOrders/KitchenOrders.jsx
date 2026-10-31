import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "antd";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiPhone,
} from "react-icons/fi";
import Loading from "../../../Components/Loading/Loading";
import EmptyState from "../../../Components/Shared/EmptyState";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import OrderItemsList from "../OrderItemsList";
import { formatCurrency, formatDate } from "../../../lib/formatters";

const PAGE_SIZE = 10;

const TABS = [
  { key: "confirmed", label: "To prepare" },
  { key: "prepared", label: "Prepared" },
];

const KitchenOrders = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { userEmail } = useAuth();
  const [status, setStatus] = useState("confirmed");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["kitchenOrders", status, page],
    enabled: !!userEmail,
    refetchInterval: 30000,
    queryFn: async () => {
      const res = await axiosSecure.get("/orders/kitchen", {
        params: { email: userEmail, status, page, limit: PAGE_SIZE },
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
    const confirmation = await Swal.fire({
      title: "Mark as prepared?",
      text: `Riders in ${thana || "the delivery area"} will be notified to pick this order up.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, it's prepared",
    });
    if (confirmation.isConfirmed) markPrepared.mutate(order._id);
  };

  const changeTab = (key) => {
    setStatus(key);
    setPage(1);
  };

  return (
    <div className="w-full space-y-6 pb-8">
      <header className="flex flex-col gap-2 border-b border-base-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Admin workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-base-content sm:text-4xl">
            Kitchen orders
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-base-content/70 sm:text-right">
          Confirmed orders wait here while the chef cooks. Mark an order as
          prepared to offer it to riders.
        </p>
      </header>

      <div role="tablist" className="flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={status === key}
            onClick={() => changeTab(key)}
            className={`btn btn-sm min-h-10 rounded-full ${
              status === key
                ? "btn-primary"
                : "border border-base-300 bg-base-100 text-base-content"
            }`}
          >
            {label}
            <span className="ml-1 font-bold">{counts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading />
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
                  className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
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
                    {status === "confirmed" ? (
                      <span className="badge badge-info gap-1 rounded-full px-3 py-3 font-semibold">
                        <FiClock aria-hidden="true" />
                        To prepare
                      </span>
                    ) : (
                      <span className="badge badge-success gap-1 rounded-full px-3 py-3 font-semibold">
                        <FiCheckCircle aria-hidden="true" />
                        Prepared
                      </span>
                    )}
                  </header>

                  <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
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

                    <section className="overflow-hidden rounded-xl border border-base-300 sm:col-span-2">
                      <div className="flex items-center justify-between gap-3 bg-base-200 px-3.5 py-2.5">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-base-content">
                          <FiPackage className="text-primary" aria-hidden="true" />
                          Food to prepare
                        </h3>
                        <span className="text-xs text-base-content/65">
                          {order.items?.length || 0} item
                          {order.items?.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div
                        className="max-h-52 overflow-y-auto overscroll-contain"
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
                    {status === "confirmed" ? (
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
                        Prepared {formatDate(order.preparedAt)} · waiting for a
                        rider
                      </p>
                    )}
                  </footer>
                </article>
              );
            })}
          </div>

          {total > PAGE_SIZE && (
            <div className="flex justify-center pt-2">
              <Pagination
                current={page}
                align="center"
                total={total}
                pageSize={PAGE_SIZE}
                showSizeChanger={false}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KitchenOrders;
