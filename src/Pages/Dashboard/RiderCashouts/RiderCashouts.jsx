import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import AppPagination from "../../../Components/Shared/AppPagination";
import { toast } from "react-toastify";
import EmptyState from "../../../Components/Shared/EmptyState";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import { CASHOUT_METHODS } from "../../../lib/cashoutMethods";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import {
  CashoutHistoryListSkeleton,
  RiderCashoutsSkeleton,
} from "../../../Components/Skeletons/PageSkeletons";
import AppSelect from "../../../Components/Shared/AppSelect";
import ListToolbar from "../../../Components/Shared/ListToolbar";
import PageHeading from "../../../Components/Shared/PageHeading";
import EmptyResults from "../../../Components/Shared/EmptyResults";
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
  const [historyStatus, setHistoryStatus] = useState("");
  const [historyMethod, setHistoryMethod] = useState("");
  const [historySort, setHistorySort] = useState("newest");
  const [method, setMethod] = useState("bkash");

  const resetHistory = () => {
    setHistoryStatus("");
    setHistoryMethod("");
    setHistorySort("newest");
    setPage(1);
  };
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
    queryKey: [
      "myCashouts",
      userEmail,
      page,
      historyStatus,
      historyMethod,
      historySort,
    ],
    placeholderData: keepPreviousData,
    enabled: !!userEmail,
    queryFn: async () => {
      const res = await axiosSecure.get("/cashouts/me", {
        params: {
          email: userEmail,
          page,
          limit: PAGE_SIZE,
          status: historyStatus || undefined,
          method: historyMethod || undefined,
          sort: historySort,
        },
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

  if (balanceLoading) return <RiderCashoutsSkeleton />;

  return (
    <div className="w-full space-y-6 pb-8">
      <PageHeading
        eyebrow="Rider workspace"
        title="Cashouts"
        description="Request your delivery earnings, then track the payment and see the proof once the admin has sent it."
      />

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
              ({
                name,
                label,
                placeholder,
                inputMode,
                pattern,
                title,
                options,
              }) => (
                <div key={`${method}-${name}`} className="block">
                  <label
                    htmlFor={`cashout-${name}`}
                    className="mb-1 block text-sm font-medium text-base-content"
                  >
                    {label}
                  </label>
                  {options ? (
                    <AppSelect
                      inputId={`cashout-${name}`}
                      options={options}
                      value={details[name] || ""}
                      placeholder={`Select ${label.toLowerCase()}`}
                      onChange={(option) =>
                        setDetails({ ...details, [name]: option.value })
                      }
                    />
                  ) : (
                    <input
                      id={`cashout-${name}`}
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
                </div>
              ),
            )}
          </div>

          {method === "card" && (
            <p className="text-xs text-base-content/60">
              Only enter the card number and holder name. Never share the CVV or
              expiry date.
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

        <ListToolbar
          searchId="history"
          hideSearch
          activeCount={
            (historyStatus ? 1 : 0) +
            (historyMethod ? 1 : 0) +
            (historySort !== "newest" ? 1 : 0)
          }
          onReset={resetHistory}
          summary={
            historyLoading
              ? "Loading requests"
              : `${total} ${total === 1 ? "request" : "requests"}`
          }
          filters={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "cashed_out", label: "Cashed out" },
              ],
              value: historyStatus,
              onChange: (value) => {
                setHistoryStatus(value);
                setPage(1);
              },
            },
            {
              key: "method",
              label: "Payout method",
              options: [
                { value: "", label: "All methods" },
                ...Object.entries(CASHOUT_METHODS).map(
                  ([value, { label }]) => ({ value, label }),
                ),
              ],
              value: historyMethod,
              onChange: (value) => {
                setHistoryMethod(value);
                setPage(1);
              },
            },
            {
              key: "sort",
              label: "Sort by",
              options: [
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
              ],
              value: historySort,
              onChange: (value) => {
                setHistorySort(value);
                setPage(1);
              },
            },
          ]}
        />

        {historyLoading ? (
          <CashoutHistoryListSkeleton />
        ) : historyError ? (
          <div
            className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error"
            role="alert"
          >
            Your cashout requests could not be loaded.
          </div>
        ) : requests.length === 0 && (historyStatus || historyMethod) ? (
          <EmptyResults
            title="No requests match"
            message="Try another status or payout method."
            onReset={resetHistory}
          />
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
                        {CASHOUT_METHODS[request.method]?.label ||
                          request.method}
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
      </section>
    </div>
  );
};

export default RiderCashouts;