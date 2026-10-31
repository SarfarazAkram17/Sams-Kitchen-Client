import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "antd";
import { toast } from "react-toastify";
import Loading from "../../../Components/Loading/Loading";
import EmptyState from "../../../Components/Shared/EmptyState";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import { CASHOUT_METHODS } from "../../../lib/cashoutMethods";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import {
  CashoutStatusBadge,
  PayoutDetails,
  ProofPreview,
} from "../CashoutParts";

const PAGE_SIZE = 5;

const BalanceCard = ({ label, value, tone }) => (
  <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-[.14em] text-base-content/60">
      {label}
    </p>
    <p className={`mt-2 text-2xl font-bold tabular-nums ${tone}`}>
      {formatCurrency(value)}
    </p>
  </div>
);

const RiderCashouts = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { userEmail } = useAuth();
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState("bkash");
  const [details, setDetails] = useState({});

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["cashoutBalance", userEmail],
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await axiosSecure.get("/cashouts/balance", {
        params: { email: userEmail },
      });
      return res.data;
    },
  });

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
  } = useQuery({
    queryKey: ["myCashouts", userEmail, page],
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await axiosSecure.get("/cashouts/me", {
        params: { email: userEmail, page, limit: PAGE_SIZE },
      });
      return res.data;
    },
  });

  const requestCashout = useMutation({
    mutationFn: async () => {
      const res = await axiosSecure.post(
        "/cashouts",
        { method, details },
        { params: { email: userEmail } },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Cashout requested. The admin will send your payment.");
      setDetails({});
      setPage(1);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "The request could not be submitted.",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cashoutBalance"] });
      queryClient.invalidateQueries({ queryKey: ["myCashouts"] });
      queryClient.invalidateQueries({ queryKey: ["completedDeliveries"] });
      queryClient.invalidateQueries({ queryKey: ["riderStats"] });
    },
  });

  const available = balance?.available || 0;
  const requests = history?.requests || [];
  const total = history?.total || 0;
  const { fields } = CASHOUT_METHODS[method];

  const chooseMethod = (key) => {
    setMethod(key);
    setDetails({});
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    requestCashout.mutate();
  };

  if (balanceLoading) return <Loading />;

  return (
    <div className="w-full space-y-8 pb-8">
      <header className="flex flex-col gap-2 border-b border-base-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-secondary">
            Rider workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-base-content sm:text-4xl">
            Cashouts
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-base-content/70 sm:text-right">
          Request your delivery earnings, then track the payment and see the
          proof once the admin has sent it.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Earnings">
        <BalanceCard
          label="Available to cash out"
          value={available}
          tone="text-success"
        />
        <BalanceCard
          label="Waiting for payment"
          value={balance?.requested}
          tone="text-warning"
        />
        <BalanceCard
          label="Paid out"
          value={balance?.cashedOut}
          tone="text-base-content"
        />
      </section>

      <section
        className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6"
        aria-labelledby="request-heading"
      >
        <h2
          id="request-heading"
          className="text-xl font-bold text-base-content sm:text-2xl"
        >
          Request a cashout
        </h2>
        <p className="mt-1 text-sm text-base-content/60">
          {available > 0
            ? `You are requesting ${formatCurrency(available)} from ${balance.availableOrders} delivered ${balance.availableOrders === 1 ? "order" : "orders"}.`
            : "Complete a delivery to earn money you can cash out."}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-base-content">
              Payment method
            </legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CASHOUT_METHODS).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={method === key}
                  onClick={() => chooseMethod(key)}
                  className={`btn btn-sm min-h-10 rounded-full ${
                    method === key
                      ? "btn-primary"
                      : "border border-base-300 bg-base-100 text-base-content"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(
              ({ name, label, placeholder, inputMode, pattern, title, options }) => (
                <label key={`${method}-${name}`} className="block">
                  <span className="mb-1 block text-sm font-medium text-base-content">
                    {label}
                  </span>
                  {options ? (
                    <select
                      className="select select-bordered w-full"
                      required
                      value={details[name] || ""}
                      onChange={(event) =>
                        setDetails({ ...details, [name]: event.target.value })
                      }
                    >
                      <option value="" disabled>
                        Select {label.toLowerCase()}
                      </option>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="input input-bordered w-full"
                      required
                      placeholder={placeholder}
                      inputMode={inputMode}
                      pattern={pattern}
                      title={title}
                      value={details[name] || ""}
                      onChange={(event) =>
                        setDetails({ ...details, [name]: event.target.value })
                      }
                    />
                  )}
                </label>
              ),
            )}
          </div>

          {method === "card" && (
            <p className="text-xs text-base-content/60">
              Only enter the card number and holder name. Never share the CVV
              or expiry date.
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary min-h-11 rounded-full px-6"
            disabled={available <= 0 || requestCashout.isPending}
          >
            {requestCashout.isPending ? (
              <span
                className="loading loading-spinner loading-xs"
                aria-label="Submitting request"
              />
            ) : (
              "Request cashout"
            )}
          </button>
        </form>
      </section>

      <section className="space-y-4" aria-labelledby="history-heading">
        <h2
          id="history-heading"
          className="text-xl font-bold text-base-content sm:text-2xl"
        >
          Your cashout requests
        </h2>

        {historyLoading ? (
          <Loading />
        ) : historyError ? (
          <div
            className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error"
            role="alert"
          >
            Your cashout requests could not be loaded.
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No cashout requests yet"
            description="Requests you submit will appear here with their payment status and proof."
          />
        ) : (
          <>
            <div className="space-y-4">
              {requests.map((request) => (
                <article
                  key={request._id}
                  className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
                >
                  <header className="flex flex-wrap items-start justify-between gap-3 border-b border-base-300 bg-base-200/60 px-4 py-4 sm:px-5">
                    <div>
                      <p className="text-2xl font-bold tabular-nums text-base-content">
                        {formatCurrency(request.amount)}
                      </p>
                      <p className="mt-1 text-xs text-base-content/70">
                        {CASHOUT_METHODS[request.method]?.label || request.method}
                        {" · "}
                        {request.orderIds?.length || 0} order
                        {request.orderIds?.length === 1 ? "" : "s"}
                        {" · "}
                        Requested {formatDate(request.requestedAt)}
                      </p>
                    </div>
                    <CashoutStatusBadge status={request.status} />
                  </header>

                  <div className="space-y-4 p-4 sm:p-5">
                    <PayoutDetails
                      method={request.method}
                      details={request.details}
                      maskCard
                    />

                    {request.status === "cashed_out" && (
                      <div className="space-y-3 border-t border-base-300 pt-4">
                        <p className="text-sm font-medium text-success">
                          Paid {formatDate(request.cashedOutAt)}
                        </p>
                        {request.transactionId && (
                          <p className="text-sm text-base-content/75">
                            Transaction ID:{" "}
                            <span className="font-mono font-semibold text-base-content">
                              {request.transactionId}
                            </span>
                          </p>
                        )}
                        {request.note && (
                          <p className="text-sm text-base-content/75">
                            Note: {request.note}
                          </p>
                        )}
                        <ProofPreview url={request.proofUrl} />
                      </div>
                    )}
                  </div>
                </article>
              ))}
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
      </section>
    </div>
  );
};

export default RiderCashouts;
