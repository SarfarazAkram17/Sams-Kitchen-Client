import { createElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiPackage,
  FiTruck,
} from "react-icons/fi";
import { LuChefHat } from "react-icons/lu";
import Loading from "../../../Components/Loading/Loading";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import OrderItemsList from "../OrderItemsList";
import { formatCurrency } from "../../../lib/formatters";

const milestones = [
  {
    key: "placedAt",
    title: "Order placed",
    detail: "Your order has reached Sam’s Kitchen.",
    icon: FiPackage,
    isComplete: () => true,
  },
  {
    key: "paidAt",
    title: "Order confirmed",
    detail: "Payment is confirmed and the kitchen can begin preparing.",
    icon: FiCheck,
    isComplete: (order) => order.payment_status === "paid",
  },
  {
    key: "preparedAt",
    title: "Food prepared",
    detail: "The kitchen has finished your order and it is waiting for a rider.",
    icon: LuChefHat,
    isComplete: (order) =>
      Boolean(order.preparedAt) ||
      ["prepared", "assigned", "picked", "delivered"].includes(order.status),
  },
  {
    key: "assignedAt",
    title: "Rider assigned",
    detail: "A local rider is getting ready to collect your order.",
    icon: FiTruck,
    isComplete: (order) =>
      Boolean(order.assignedAt) ||
      ["assigned", "picked", "delivered"].includes(order.status),
  },
  {
    key: "pickedAt",
    title: "On the way",
    detail: "Your freshly prepared food is on its way to you.",
    icon: FiMapPin,
    isComplete: (order) =>
      Boolean(order.pickedAt) || ["picked", "delivered"].includes(order.status),
  },
  {
    key: "deliveredAt",
    title: "Delivered",
    detail: "Enjoy your meal. Thank you for ordering with us.",
    icon: FiCheck,
    isComplete: (order) =>
      Boolean(order.deliveredAt) || order.status === "delivered",
  },
];

const statusNames = {
  pending: "Awaiting payment",
  confirmed: "Being prepared",
  prepared: "Prepared, waiting for a rider",
  assigned: "Rider assigned",
  picked: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const activeMilestoneByStatus = {
  pending: 1,
  confirmed: 1,
  prepared: 2,
  assigned: 3,
  picked: 4,
  delivered: 5,
};

const stepBadges = {
  confirmed: "Being prepared",
  prepared: "Waiting for rider",
  delivered: "Complete",
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orderTracking", orderId, userEmail],
    queryFn: async () => {
      const response = await axiosSecure.get(`/orders/${orderId}`, {
        params: { email: userEmail },
      });
      return response.data?.order || response.data;
    },
    enabled: Boolean(orderId && userEmail),
    refetchInterval: (query) => {
      const order = query.state.data;
      return order?.status === "delivered" || order?.status === "cancelled"
        ? false
        : 15000;
    },
  });

  if (isLoading) return <Loading />;

  if (isError || !data?._id) {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <div
          className="rounded-3xl border border-error/30 bg-error/10 p-6 text-center sm:p-10"
          role="alert"
        >
          <h1 className="font-display text-3xl text-base-content sm:text-4xl">
            We couldn’t find this order
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-base-content/70">
            The order details may be temporarily unavailable. Please retry, or
            return to your orders.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Try again
            </button>
            <Link
              to="/dashboard/myOrders"
              className="btn border border-base-300 bg-base-200 text-base-content"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cancelled = data.status === "cancelled";
  const unpaid = data.payment_status !== "paid";
  const completedMilestones = milestones.map((milestone) =>
    milestone.isComplete(data),
  );
  const currentMilestone = cancelled
    ? -1
    : (activeMilestoneByStatus[data.status] ??
      completedMilestones.findIndex((completed) => !completed));
  const orderAddress = data.customer?.address || {};
  const addressLine = [
    orderAddress.street,
    orderAddress.thana,
    orderAddress.district,
    orderAddress.region,
  ]
    .filter(Boolean)
    .join(", ");
  const currentStatus = statusNames[data.status] || "Order update";

  return (
    <div className="w-full space-y-5 pb-4">
      <Link
        to="/dashboard/myOrders"
        className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-base-content/75 transition hover:bg-base-200 hover:text-primary"
      >
        <FiArrowLeft aria-hidden="true" /> Back to My Orders
      </Link>

      <header className="tracking-hero relative overflow-hidden rounded-[1.75rem] border border-base-300 p-5 sm:p-8">
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
              Sam’s Kitchen · Order update
            </p>
            <h1 className="font-display mt-2 text-4xl leading-none text-base-content sm:text-5xl">
              A little closer.
            </h1>
            <p className="mt-3 text-sm text-base-content/70">
              Order{" "}
              <span className="font-mono font-semibold">
                #{String(data._id).slice(-8).toUpperCase()}
              </span>
            </p>
          </div>
          <span
            className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${
              cancelled
                ? "border-error/40 bg-error/10 text-error"
                : unpaid
                  ? "border-warning/40 bg-warning/10 text-warning"
                  : "border-primary/30 bg-primary/10 text-primary"
            }`}
          >
            {currentStatus}
          </span>
        </div>
      </header>

      {cancelled && (
        <div
          className="rounded-2xl border border-error/30 bg-error/10 p-5 text-sm leading-6 text-base-content/80"
          role="status"
        >
          This order was cancelled. If you think this is a mistake, contact the
          kitchen before placing a new order.
        </div>
      )}
      {!cancelled && unpaid && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-warning/35 bg-warning/10 p-4 text-sm leading-6 text-base-content/80"
          role="status"
        >
          <FiCreditCard className="mt-1 shrink-0 text-warning" aria-hidden="true" />
          <p>
            Payment is still pending. Your order will be confirmed once payment
            is marked as paid.
          </p>
        </div>
      )}

      <section
        className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8"
        aria-label="Order progress"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
              {cancelled ? "Order history" : "Live progress"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-base-content sm:text-2xl">
              {cancelled ? "This order has ended" : currentStatus}
            </h2>
          </div>
          {data.placedAt && (
            <p className="text-right text-xs leading-5 text-base-content/65">
              Placed
              <br />
              <time>{formatDate(data.placedAt)}</time>
            </p>
          )}
        </div>
        <ol className="tracking-steps">
          {milestones.map(({ key, title, detail, icon }, index) => {
            const completed = completedMilestones[index];
            const current = index === currentMilestone;
            const dateValue = data[key];
            const date = dateValue ? formatDate(dateValue) : "";
            const pendingPaymentStep = index === 1 && unpaid && !cancelled;
            return (
              <li
                key={key}
                className={`tracking-step ${completed ? "is-complete" : ""} ${
                  current ? "is-current" : ""
                }`}
              >
                <span className="tracking-step-mark">
                  {createElement(icon, { "aria-hidden": true, size: 17 })}
                </span>
                <div className="min-w-0 pb-7">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="font-semibold text-base-content">{title}</h3>
                    {current && (
                      <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        {pendingPaymentStep
                          ? "Payment needed"
                          : stepBadges[data.status] || "In progress"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-base-content/65">
                    {detail}
                  </p>
                  {date && (
                    <time className="mt-1 block text-xs text-base-content/55">
                      {formatDate(dateValue)}
                    </time>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {data.assigned_rider_name && (
          <div className="mt-1 flex items-center gap-3 rounded-2xl border border-base-300 bg-base-200 p-4">
            <span className="grid size-10 place-items-center rounded-full bg-primary/12 text-primary">
              <FiTruck aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-base-content/60">Your delivery rider</p>
              <p className="font-semibold text-base-content">
                {data.assigned_rider_name}
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100">
          <div className="flex items-center gap-2 border-b border-base-300 bg-base-200/70 px-5 py-4 sm:px-6">
            <LuChefHat className="text-primary" aria-hidden="true" />
            <h2 className="font-bold text-base-content">In this order</h2>
          </div>
          <OrderItemsList items={data.items || []} />
          <div className="mx-5 mb-5 space-y-2 border-t border-base-300 pt-4 text-sm sm:mx-6">
            <div className="flex justify-between text-base-content/70">
              <span>Subtotal</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            <div className="flex justify-between text-base-content/70">
              <span>Delivery</span>
              <span>
                {Number(data.deliveryCharge)
                  ? formatCurrency(data.deliveryCharge)
                  : "Free"}
              </span>
            </div>
            {Number(data.discount) > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>−{formatCurrency(data.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-base-300 pt-3 text-base font-bold text-base-content">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(data.total)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <FiMapPin className="text-primary" aria-hidden="true" />
            <h2 className="font-bold text-base-content">Delivering to</h2>
          </div>
          <p className="font-semibold text-base-content">
            {[data.customer?.firstName, data.customer?.lastName]
              .filter(Boolean)
              .join(" ") || "Customer"}
          </p>
          <p className="mt-1 text-sm leading-6 text-base-content/70">
            {addressLine || "Address unavailable"}
          </p>
          {data.customer?.phone && (
            <p className="mt-2 text-sm text-base-content/70">
              {data.customer.phone}
            </p>
          )}
          {data.payment_status && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-base-200 px-3 py-1.5 text-xs font-semibold capitalize text-base-content">
              <FiClock aria-hidden="true" />
              Payment: {data.payment_status.replaceAll("_", " ")}
              {data.paidAt && ` · ${formatDate(data.paidAt)}`}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default OrderTracking;
