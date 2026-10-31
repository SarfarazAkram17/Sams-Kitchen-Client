import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import { useState } from "react";
import Loading from "../../../Components/Loading/Loading";
import { Pagination } from "antd";
import EmptyState from "../../../Components/Shared/EmptyState";
import OrderItemsSection from "../OrderItemsSection";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";

const getDeliveryEarning = (order) => {
  const deliveryCharge = Number(order.deliveryCharge || 0);
  if (deliveryCharge !== 0) return deliveryCharge;
  return (order.items?.length || 0) > 1 ? 50 : 30;
};

const CompletedDeliveries = () => {
  const axiosSecure = useAxiosSecure();
  const { userEmail } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["completedDeliveries", userEmail, page],
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await axiosSecure.get(`/riders/completedOrders`, {
        params: {
          email: userEmail,
          page,
          limit: 10,
        },
      });
      return res.data;
    },
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-2 border-b border-base-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
            Rider workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-base-content sm:text-4xl">
            Completed deliveries
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-base-content/70 sm:text-right">
          Review customer details, delivery times, and earnings for your
          completed orders. To get paid, request a payout from{" "}
          <Link to="/dashboard/cashouts" className="font-semibold text-primary">
            Cashouts
          </Link>
          .
        </p>
      </header>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <div
          className="rounded-2xl border border-error/30 bg-error/10 p-6 text-center"
          role="alert"
        >
          <p className="font-semibold text-base-content">
            Completed deliveries could not be loaded.
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
          title="No deliveries yet"
          description="Completed deliveries and eligible earnings will appear here."
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
              const items = order.items || [];
              const earnings = getDeliveryEarning(order);

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
                        {String(order._id || "").toUpperCase()}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/70">
                        <FiCalendar aria-hidden="true" />
                        Placed {formatDate(order.placedAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge badge-success gap-1 rounded-full px-3 py-3 font-semibold">
                        <FiCheckCircle aria-hidden="true" />
                        Delivered
                      </span>
                      {order.cashout_status && (
                        <span className="badge badge-outline rounded-full px-3 py-3 font-semibold">
                          {order.cashout_status === "cashed_out"
                            ? "Cashed out"
                            : "Cashout requested"}
                        </span>
                      )}
                    </div>
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

                    <section className="rounded-xl bg-base-200 p-3.5">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/60">
                        <FiClock className="text-warning" aria-hidden="true" />
                        Delivery timeline
                      </h3>
                      <p className="mt-2 text-sm text-base-content">
                        Picked up:{" "}
                        <span className="text-base-content/75">
                          {formatDate(order.pickedAt)}
                        </span>
                      </p>
                      <p className="mt-1 text-sm font-medium text-success">
                        Delivered:{" "}
                        <span className="font-normal text-base-content/75">
                          {formatDate(order.deliveredAt)}
                        </span>
                      </p>
                    </section>

                    <section className="rounded-xl bg-base-200 p-3.5">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/60">
                        <FiCreditCard
                          className="text-info"
                          aria-hidden="true"
                        />
                        Payment
                      </h3>
                      <p className="mt-2 font-semibold text-base-content">
                        {order.payment_status === "paid"
                          ? "Paid"
                          : "Payment pending"}
                      </p>
                      {order.paidAt && (
                        <p className="mt-1 text-xs text-base-content/70">
                          Paid {formatDate(order.paidAt)}
                        </p>
                      )}
                    </section>
                  </div>

                  <OrderItemsSection
                    items={items}
                    className="mx-4 mb-4 sm:mx-5"
                  />

                  <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-base-300 px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-2 text-sm text-base-content/70">
                      <FiDollarSign aria-hidden="true" />
                      <span>
                        Order total{" "}
                        <strong className="ml-1 text-base-content">
                          {formatCurrency(order.total)}
                        </strong>
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-base-content/65">
                        Your delivery earning
                      </p>
                      <p className="text-lg font-bold text-success">
                        {formatCurrency(earnings)}
                      </p>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>

          {total > 10 && (
            <div className="flex justify-center pt-2">
              <Pagination
                current={page}
                align="center"
                total={total}
                pageSize={10}
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

export default CompletedDeliveries;