import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import Swal from "sweetalert2";
import Loading from "../../../Components/Loading/Loading";
import { Link } from "react-router";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Pagination } from "antd";
import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";
import { generateReceipt } from "../../../lib/generateReceipt";
import OrderItemsList from "../OrderItemsList";
import { formatCurrency, formatDate } from "../../../lib/formatters";

const statusDetails = {
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

const statusStats = [
  { label: "All", key: "all" },
  { label: "Pending", key: "pending" },
  { label: "Preparing", key: "confirmed" },
  { label: "Prepared", key: "prepared" },
  { label: "Assigned", key: "assigned" },
  { label: "On the way", key: "picked" },
  { label: "Delivered", key: "delivered" },
  { label: "Cancelled", key: "cancelled" },
];

const getAddress = (customer) => {
  const address = customer?.address || {};
  return [address.street, address.thana, address.district, address.region]
    .filter(Boolean)
    .join(", ");
};

const MyOrders = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { width, height } = useWindowSize();
  const [page, setPage] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["myOrders", page],
    queryFn: async () => {
      const res = await axiosSecure.get("/orders", {
        params: { email: userEmail, page, limit: 10 },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const orders = useMemo(() => data?.orders || [], [data?.orders]);
  const total = data?.total || 0;
  const allTimeTotal = data?.allTimeTotal ?? total;

  useEffect(() => {
    const paidCount = orders.filter((order) => order.payment_status === "paid")
      .length;
    if (![5, 10, 15].includes(paidCount)) return undefined;
    setShowConfetti(true);
    setShowCongrats(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
      setShowCongrats(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [orders]);

  const handleCancel = async (id) => {
    const confirmation = await Swal.fire({
      title: "Cancel this order?",
      text: "This order will be cancelled.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "Keep order",
    });

    if (!confirmation.isConfirmed) return;
    try {
      await axiosSecure.patch(`/orders/${id}?email=${userEmail}`, {
        status: "cancelled",
      });
      Swal.fire("Cancelled", "Order has been cancelled.", "success");
      refetch();
    } catch (error) {
      Swal.fire(
        "Failed to cancel order",
        error.response?.data?.message || error.message || "Please try again.",
        "error",
      );
    }
  };

  return (
    <div className="w-full min-w-0 pb-10">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={600}
        />
      )}
      {showCongrats && (
        <div className="fixed left-1/2 top-1/4 z-50 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 space-y-2 rounded-2xl border border-primary/30 bg-base-100 px-5 py-4 text-center shadow-lg sm:px-8">
          <h2 className="font-display text-2xl text-primary sm:text-3xl">
            Thank you for choosing Sam’s Kitchen.
          </h2>
          <p className="text-sm text-base-content/70">
            You’ve completed{" "}
            {orders.filter((order) => order.payment_status === "paid").length}{" "}
            paid orders.
          </p>
        </div>
      )}

      <header className="mb-6 flex flex-col gap-3 border-b border-base-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Your Sam’s Kitchen account
          </p>
          <h1 className="font-display mt-2 text-4xl text-base-content sm:text-5xl">
            My orders
          </h1>
          <p className="mt-2 text-sm text-base-content/70">
            Follow each delivery from checkout to your door.
          </p>
        </div>
        {!isLoading && !isError && allTimeTotal > 0 && (
          <p className="text-sm font-medium text-base-content/65">
            {allTimeTotal} {allTimeTotal === 1 ? "order" : "orders"} in your history
          </p>
        )}
      </header>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <div
          className="rounded-2xl border border-error/30 bg-error/10 p-6 text-center"
          role="alert"
        >
          <h2 className="font-bold text-base-content">
            Orders could not be loaded
          </h2>
          <p className="mt-1 text-sm text-base-content/70">
            Your order history is still safe. Try again in a moment.
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
        <section className="rounded-3xl border border-base-300 bg-base-100 px-6 py-14 text-center shadow-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <FiPackage size={25} aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-3xl text-base-content">
            Your table is waiting.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-base-content/70">
            Once you place an order, you’ll find its full journey here.
          </p>
        </section>
      ) : (
        <>
          <section
            className="mb-6 overflow-x-auto rounded-2xl border border-base-300 bg-base-100 p-3 shadow-sm"
            aria-label="Order counts by status"
          >
            <div className="grid min-w-[650px] grid-cols-8 gap-2">
              {statusStats.map(({ label, key }) => {
                const count =
                  key === "all"
                    ? allTimeTotal
                    : data?.statusCounts?.[key] || 0;
                return (
                  <div
                    key={key}
                    className="rounded-xl bg-base-200/75 px-2 py-3 text-center"
                  >
                    <p className="text-xl font-bold tabular-nums text-base-content">
                      {count}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-base-content/65">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusDetails[order.status] || {
                label: order.status || "Order update",
                icon: FiPackage,
                tone: "border-base-300 bg-base-200 text-base-content",
              };
              const StatusIcon = status.icon;
              const items = order.items || [];
              const itemQuantity = items.reduce(
                (sum, item) => sum + (Number(item.quantity) || 1),
                0,
              );
              const customer = order.customer || {};
              const canPay =
                order.status === "pending" && order.payment_status !== "paid";
              const canCancel =
                order.status === "pending" && order.payment_status !== "paid";
              const canDownloadReceipt =
                order.status !== "cancelled" && order.status !== "pending";

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm transition-shadow hover:shadow-md"
                >
                  <header className="flex flex-col gap-4 border-b border-base-300 bg-base-200/45 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-base-content/55">
                          Order
                        </p>
                        <p className="mt-1 break-all font-mono text-sm font-semibold text-base-content">
                          {String(order._id || "").toUpperCase()}
                        </p>
                      </div>
                      <span className="hidden h-8 w-px bg-base-300 sm:block" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-base-content/55">
                          Placed
                        </p>
                        <p className="mt-1 text-sm text-base-content/80">
                          {formatDate(order.placedAt)}
                        </p>
                      </div>
                      <span className="hidden h-8 w-px bg-base-300 sm:block" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-base-content/55">
                          Total
                        </p>
                        <p className="mt-1 text-sm font-bold text-primary">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.tone}`}
                      >
                        <StatusIcon size={14} aria-hidden="true" />
                        {status.label}
                      </span>
                      {order.status !== "cancelled" && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            order.payment_status === "paid"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          <FiCreditCard size={13} aria-hidden="true" />
                          {order.payment_status === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      )}
                    </div>
                  </header>

                  <div className="p-4 sm:p-5">
                    <section className="min-w-0">
                      <div className="mb-3 flex items-center gap-2">
                        <FiPackage className="text-primary" aria-hidden="true" />
                        <h2 className="text-sm font-bold text-base-content">
                          Your selection
                        </h2>
                        <span className="text-xs text-base-content/60">
                          {itemQuantity} {itemQuantity === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
                        <OrderItemsList items={items} />
                      </div>
                      <div className="mt-3 space-y-1.5 border-t border-dashed border-base-300 pt-3 text-sm">
                        <div className="flex justify-between text-base-content/70">
                          <span>Subtotal</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-base-content/70">
                          <span>Delivery</span>
                          <span>
                            {Number(order.deliveryCharge) === 0
                              ? "Free"
                              : formatCurrency(order.deliveryCharge)}
                          </span>
                        </div>
                        {Number(order.discount) > 0 && (
                          <div className="flex justify-between text-success">
                            <span>Discount</span>
                            <span>−{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-base-300 pt-2 text-base font-bold text-base-content">
                          <span>Total</span>
                          <span className="text-primary">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </section>

                    <section className="mt-5 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-base-300 bg-base-200/65 p-3.5">
                        <div className="flex items-start gap-2.5">
                          <FiMapPin
                            className="mt-0.5 shrink-0 text-info"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-base-content/60">
                              Delivery address
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-base-content">
                              {[customer.firstName, customer.lastName]
                                .filter(Boolean)
                                .join(" ") || "Customer"}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-base-content/70 break-words">
                              {customer.phone || "Phone not provided"}
                              {getAddress(customer) && ` · ${getAddress(customer)}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-base-300 bg-base-200/65 p-3.5">
                        <div className="flex items-start gap-2.5">
                          {order.assigned_rider_name ? (
                            <FiTruck
                              className="mt-0.5 shrink-0 text-secondary"
                              aria-hidden="true"
                            />
                          ) : (
                            <FiClock
                              className="mt-0.5 shrink-0 text-info"
                              aria-hidden="true"
                            />
                          )}
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wide text-base-content/60">
                              {order.assigned_rider_name
                                ? "Delivery rider"
                                : "Payment info"}
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-base-content">
                              {order.assigned_rider_name ||
                                (order.payment_status === "paid"
                                  ? "Payment completed"
                                  : "Payment pending")}
                            </p>
                            {order.paidAt && (
                              <p className="mt-1 text-xs text-base-content/65">
                                Paid: {formatDate(order.paidAt)}
                              </p>
                            )}
                            {order.assignedAt && (
                              <p className="mt-1 text-xs text-base-content/65">
                                Assigned: {formatDate(order.assignedAt)}
                              </p>
                            )}
                            {order.pickedAt && (
                              <p className="mt-1 text-xs text-base-content/65">
                                Picked: {formatDate(order.pickedAt)}
                              </p>
                            )}
                            {order.deliveredAt && (
                              <p className="mt-1 text-xs text-success">
                                Delivered: {formatDate(order.deliveredAt)}
                              </p>
                            )}
                            {order.status === "confirmed" && (
                              <p className="mt-1 text-xs text-info">
                                Your order is being prepared
                              </p>
                            )}
                            {order.status === "prepared" && (
                              <p className="mt-1 text-xs text-info">
                                Your food is ready and waiting for a rider
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-base-300 pt-4">
                      {order.status !== "cancelled" && (
                        <Link
                          to={`/dashboard/order-tracking/${order._id}`}
                          className="btn btn-sm min-h-10 border border-base-300 bg-base-100 text-base-content hover:border-primary hover:text-primary"
                        >
                          Track order
                        </Link>
                      )}
                      {canPay && (
                        <Link
                          to={`/dashboard/payment/${order._id}`}
                          className="btn btn-sm min-h-10 btn-primary"
                        >
                          Pay now
                        </Link>
                      )}
                      {canCancel && (
                        <button
                          type="button"
                          className="btn btn-sm min-h-10 border border-error/35 bg-error/10 text-error hover:border-error hover:bg-error/15"
                          onClick={() => handleCancel(order._id)}
                        >
                          Cancel order
                        </button>
                      )}
                      {canDownloadReceipt && (
                        <button
                          type="button"
                          onClick={() => generateReceipt(order)}
                          className="btn btn-sm min-h-10 border border-primary/25 bg-primary/10 text-primary hover:border-primary/45 hover:bg-primary/15"
                        >
                          <FiFileText aria-hidden="true" />
                          Download receipt
                        </button>
                      )}
                      {order.status === "cancelled" && (
                        <span className="self-center text-sm font-medium text-error">
                          This order was cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {total > 10 && (
            <div className="mt-8 flex justify-center">
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

export default MyOrders;
