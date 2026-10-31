import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPackage,
  FiPhone,
} from "react-icons/fi";
import { toast } from "react-toastify";
import EmptyState from "../../../Components/Shared/EmptyState";
import Loading from "../../../Components/Loading/Loading";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import OrderItemsSection from "../OrderItemsSection";
import { formatCurrency, formatDate } from "../../../lib/formatters";

const getOrderNumber = (order) => `${String(order._id || "").toUpperCase()}`;

const getCustomerName = (customer) =>
  [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") ||
  "Customer";

const getAddressLine = (customer) => {
  const address = customer?.address || {};
  return [address.street, address.thana, address.district, address.region]
    .filter(Boolean)
    .join(", ");
};

const CustomerDetails = ({ customer }) => (
  <section className="rounded-xl bg-base-200 p-3.5">
    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/60">
      <FiPhone className="text-info" aria-hidden="true" />
      Customer
    </h3>
    <p className="mt-2 font-semibold text-base-content">
      {getCustomerName(customer)}
    </p>
    <p className="mt-1 break-all text-sm text-base-content/75">
      {customer?.phone || "Phone not provided"}
    </p>
  </section>
);

const AddressDetails = ({ customer }) => (
  <section className="rounded-xl bg-base-200 p-3.5">
    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-base-content/60">
      <FiMapPin className="text-info" aria-hidden="true" />
      Delivery address
    </h3>
    <p className="mt-2 text-sm leading-5 text-base-content">
      {getAddressLine(customer) || "Address not provided"}
    </p>
  </section>
);

const PendingDeliveries = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { userEmail } = useAuth();
  const [busyOrderId, setBusyOrderId] = useState("");
  const [otpPrompt, setOtpPrompt] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (!otpPrompt || resendSeconds <= 0) return undefined;

    const timer = setTimeout(
      () => setResendSeconds((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [otpPrompt, resendSeconds]);

  const {
    data: offersData,
    isLoading: offersLoading,
    isError: offersError,
  } = useQuery({
    queryKey: ["riderOffers", userEmail],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/offers", {
        params: { email: userEmail, page: 1, limit: 20 },
      });
      return res.data;
    },
    enabled: !!userEmail,
    refetchInterval: 30000,
  });

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery({
    queryKey: ["riderOrders", userEmail],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/orders", {
        params: { email: userEmail, page: 1, limit: 20 },
      });
      return res.data;
    },
    enabled: !!userEmail,
    refetchInterval: 30000,
  });

  const refreshDeliveryData = () => {
    queryClient.invalidateQueries({ queryKey: ["riderOffers", userEmail] });
    queryClient.invalidateQueries({ queryKey: ["riderOrders", userEmail] });
    queryClient.invalidateQueries({ queryKey: ["riderProfile", userEmail] });
    queryClient.invalidateQueries({ queryKey: ["riderStats", userEmail] });
  };

  const acceptOffer = useMutation({
    mutationFn: async (orderId) => {
      setBusyOrderId(orderId);
      const res = await axiosSecure.post(`/orders/${orderId}/accept`, null, {
        params: { email: userEmail },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Delivery accepted. It is now in your active deliveries.");
      refreshDeliveryData();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "This delivery could not be accepted.",
      );
      refreshDeliveryData();
    },
    onSettled: () => setBusyOrderId(""),
  });

  const requestStatusOtp = useMutation({
    mutationFn: async ({ orderId, status }) => {
      setBusyOrderId(orderId);
      const res = await axiosSecure.post(
        `/orders/${orderId}/status-otp`,
        { status },
        { params: { email: userEmail } },
      );
      return { ...res.data, orderId, status };
    },
    onSuccess: ({ orderId, status, retryAfterSeconds }) => {
      setOtpPrompt({ orderId, status });
      setOtpValue("");
      setResendSeconds(retryAfterSeconds || 60);
      toast.success(
        status === "picked"
          ? "A pickup code was sent to the admin."
          : "A delivery code was sent to the customer.",
      );
    },
    onError: (error, { orderId, status }) => {
      const retryAfterSeconds = error.response?.data?.retryAfterSeconds;
      if (retryAfterSeconds) {
        setOtpPrompt({ orderId, status });
        setOtpValue("");
        setResendSeconds(retryAfterSeconds);
      }
      toast.error(
        error.response?.data?.message ||
          "The verification code could not be sent.",
      );
    },
    onSettled: () => setBusyOrderId(""),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status, otp }) => {
      setBusyOrderId(orderId);
      const res = await axiosSecure.patch(
        `/orders/${orderId}/status`,
        { status, otp },
        { params: { email: userEmail } },
      );
      return res.data;
    },
    onSuccess: () => {
      setOtpPrompt(null);
      setOtpValue("");
      toast.success("Delivery status updated.");
      refreshDeliveryData();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "The delivery status could not be updated.",
      );
    },
    onSettled: () => setBusyOrderId(""),
  });

  if (offersLoading || ordersLoading) return <Loading />;

  const offers = offersData?.offers || [];
  const orders = ordersData?.orders || [];

  // Rider earns the base delivery rate, even when the customer got free delivery
  const getRiderEarning = (order) => {
    if (order.deliveryCharge > 0) return Number(order.deliveryCharge);
    const itemCount = order.items?.length || 0;
    return itemCount > 1 ? 50 : itemCount === 1 ? 30 : 0;
  };

  return (
    <div className="w-full space-y-8 pb-8">
      <header className="flex flex-col gap-2 border-b border-base-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Rider workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-base-content sm:text-4xl">
            Pending deliveries
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-base-content/70 sm:text-right">
          Accept a nearby offer, then update its status as you complete the
          delivery.
        </p>
      </header>

      {offersError && (
        <div
          className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error"
          role="alert"
        >
          Delivery offers could not be loaded. Refresh the page to try again.
        </div>
      )}
      {ordersError && (
        <div
          className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error"
          role="alert"
        >
          Your active deliveries could not be loaded.
        </div>
      )}

      <section className="space-y-4" aria-labelledby="offers-heading">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              id="offers-heading"
              className="text-xl font-bold text-base-content sm:text-2xl"
            >
              Available offers
            </h2>
            <p className="mt-1 text-sm text-base-content/60">
              The first eligible rider to accept claims the delivery.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {offers.length} open
          </span>
        </div>
        {offers.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {offers.map((order) => {
              const customer = order.customer || {};
              const earning = getRiderEarning(order);

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
                      <h3 className="mt-1 truncate font-mono text-sm font-semibold text-base-content">
                        {getOrderNumber(order)}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/70">
                        <FiCalendar aria-hidden="true" />
                        Placed {formatDate(order.placedAt)}
                      </p>
                    </div>
                    <span className="badge badge-info gap-1 rounded-full px-3 py-3 font-semibold">
                      <FiClock aria-hidden="true" />
                      Open offer
                    </span>
                  </header>

                  <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                    <CustomerDetails customer={customer} />
                    <AddressDetails customer={customer} />
                    <OrderItemsSection
                      items={order.items}
                      className="sm:col-span-2"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/70">
                      <span>
                        Order total{" "}
                        <strong className="text-base-content">
                          {formatCurrency(order.total)}
                        </strong>
                      </span>
                      <span className="text-xs text-base-content/65">
                        Earn {formatCurrency(earning)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm min-h-10 rounded-full bg-primary px-4 text-primary-content"
                      onClick={() => acceptOffer.mutate(order._id)}
                      disabled={busyOrderId === order._id}
                      aria-label={`Accept delivery order ${order._id}`}
                    >
                      {busyOrderId === order._id ? (
                        <span
                          className="loading loading-spinner loading-xs"
                          aria-label="Accepting delivery"
                        />
                      ) : (
                        "Accept delivery"
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={
              offersError ? "Offers are unavailable" : "No open offers nearby"
            }
            description={
              offersError
                ? "Try loading delivery offers again shortly."
                : "Orders for your thana appear here once the kitchen has prepared them."
            }
          />
        )}
      </section>

      <section className="space-y-4" aria-labelledby="active-heading">
        <div>
          <h2
            id="active-heading"
            className="text-xl font-bold text-base-content sm:text-2xl"
          >
            Your active deliveries
          </h2>
          <p className="mt-1 text-sm text-base-content/60">
            Update each order as you collect and deliver it.
          </p>
        </div>
        {orders.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {orders.map((order) => {
              const customer = order.customer || {};
              const earning = getRiderEarning(order);
              const isPickedUp = order.status === "picked";

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
                      <h3 className="mt-1 truncate font-mono text-sm font-semibold text-base-content">
                        {getOrderNumber(order)}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/70">
                        <FiCalendar aria-hidden="true" />
                        Placed {formatDate(order.placedAt)}
                      </p>
                    </div>
                    <span
                      className={`badge gap-1 rounded-full px-3 py-3 font-semibold ${
                        isPickedUp ? "badge-success" : "badge-primary"
                      }`}
                    >
                      {isPickedUp ? (
                        <FiCheckCircle aria-hidden="true" />
                      ) : (
                        <FiPackage aria-hidden="true" />
                      )}
                      {isPickedUp ? "Picked up" : "Assigned"}
                    </span>
                  </header>

                  <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
                    <CustomerDetails customer={customer} />
                    <AddressDetails customer={customer} />
                    <OrderItemsSection
                      items={order.items}
                      className="sm:col-span-2"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/70">
                      <span>
                        Order total{" "}
                        <strong className="text-base-content">
                          {formatCurrency(order.total)}
                        </strong>
                      </span>
                      <span className="text-xs text-base-content/65">
                        Earn {formatCurrency(earning)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm min-h-10 rounded-full bg-primary px-4 text-primary-content"
                      onClick={() =>
                        requestStatusOtp.mutate({
                          orderId: order._id,
                          status: isPickedUp ? "delivered" : "picked",
                        })
                      }
                      disabled={busyOrderId === order._id}
                    >
                      {busyOrderId === order._id ? (
                        <span
                          className="loading loading-spinner loading-xs"
                          aria-label="Updating delivery"
                        />
                      ) : isPickedUp ? (
                        "Mark delivered"
                      ) : (
                        "Mark picked up"
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No active deliveries"
            description="When you accept an offer, it will move into this list."
          />
        )}
      </section>

      {otpPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
        >
          <section
            aria-labelledby="delivery-otp-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-xl"
            role="dialog"
          >
            <h2
              className="text-lg font-bold text-base-content"
              id="delivery-otp-title"
            >
              Verify {otpPrompt.status === "picked" ? "pickup" : "delivery"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-base-content/70">
              Enter the six-digit code sent to the{" "}
              {otpPrompt.status === "picked" ? "admin" : "customer"} email. The
              code expires in five minutes.
            </p>
            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                updateStatus.mutate({
                  ...otpPrompt,
                  otp: otpValue,
                });
              }}
            >
              <label
                className="block text-sm font-medium text-base-content"
                htmlFor="delivery-otp"
              >
                Verification code
              </label>
              <input
                autoComplete="one-time-code"
                autoFocus
                className="input input-bordered w-full text-center font-mono text-2xl tracking-[0.4em]"
                id="delivery-otp"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) =>
                  setOtpValue(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                pattern="[0-9]{6}"
                required
                value={otpValue}
              />
              <div className="flex flex-wrap justify-between gap-3">
                <button
                  className="btn btn-ghost"
                  disabled={busyOrderId === otpPrompt.orderId}
                  onClick={() => {
                    setOtpPrompt(null);
                    setOtpValue("");
                  }}
                  type="button"
                >
                  Cancel
                </button>
                <div className="flex gap-2">
                  <button
                    className="btn btn-outline"
                    disabled={
                      resendSeconds > 0 || busyOrderId === otpPrompt.orderId
                    }
                    onClick={() => requestStatusOtp.mutate(otpPrompt)}
                    type="button"
                  >
                    {resendSeconds > 0
                      ? `Resend in ${resendSeconds}s`
                      : "Resend code"}
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={
                      otpValue.length !== 6 || busyOrderId === otpPrompt.orderId
                    }
                    type="submit"
                  >
                    {busyOrderId === otpPrompt.orderId ? (
                      <span
                        aria-label="Verifying code"
                        className="loading loading-spinner loading-xs"
                      />
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default PendingDeliveries;