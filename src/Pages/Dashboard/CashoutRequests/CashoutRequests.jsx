import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import AppPagination from "../../../Components/Shared/AppPagination";
import { toast } from "react-toastify";
import { FiCalendar, FiUser } from "react-icons/fi";
import EmptyState from "../../../Components/Shared/EmptyState";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import { CASHOUT_METHODS } from "../../../lib/cashoutMethods";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import { CashoutRequestsListSkeleton } from "../../../Components/Skeletons/PageSkeletons";
import ListToolbar from "../../../Components/Shared/ListToolbar";
import PageHeading from "../../../Components/Shared/PageHeading";
import FilterTabs from "../../../Components/Shared/FilterTabs";
import EmptyResults from "../../../Components/Shared/EmptyResults";
import {
  CashoutStatusBadge,
  PayoutDetails,
  ProofPreview,
} from "../CashoutParts";

const PAGE_SIZE = 10;
const MAX_PROOF_BYTES = 5 * 1024 * 1024;

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "cashed_out", label: "Cashed out" },
];

const uploadProof = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_cloudinary_preset_name);
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_cloudinary_cloud_name}/image/upload`,
    formData,
  );
  return res.data.secure_url;
};

const ProofModal = ({ request, onClose, onSubmit, isSubmitting }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      event.target.value = "";
      return;
    }
    if (selected.size > MAX_PROOF_BYTES) {
      toast.error("The image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setFile(selected);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ file, transactionId, note });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <section
        aria-labelledby="proof-title"
        aria-modal="true"
        role="dialog"
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-base-100 p-6 shadow-xl"
      >
        <h2 id="proof-title" className="text-lg font-bold text-base-content">
          Mark as cashed out
        </h2>
        <p className="mt-2 text-sm leading-6 text-base-content/70">
          Confirm you sent {formatCurrency(request.amount)} to{" "}
          {request.riderName} via{" "}
          {CASHOUT_METHODS[request.method]?.label || request.method}, then
          attach a screenshot of the payment. The rider will be able to see it.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-base-content">
              Proof of payment (image)
            </span>
            <input
              type="file"
              accept="image/*"
              required
              className="file-input file-input-bordered w-full"
              onChange={handleFile}
            />
          </label>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Selected payment proof"
              className="max-h-48 w-full rounded-xl border border-base-300 object-contain"
            />
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-base-content">
              Transaction ID (optional)
            </span>
            <input
              className="input input-bordered w-full"
              maxLength={60}
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-base-content">
              Note for the rider (optional)
            </span>
            <textarea
              className="textarea textarea-bordered w-full"
              maxLength={300}
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || isSubmitting}
            >
              {isSubmitting ? (
                <span
                  className="loading loading-spinner loading-xs"
                  aria-label="Saving"
                />
              ) : (
                "Confirm cashed out"
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const CashoutRequests = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { userEmail } = useAuth();
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("");
  const [sort, setSort] = useState("");

  const updateSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);
  const resetFilters = () => {
    setSearch("");
    setMethod("");
    setSort("");
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["cashoutRequests", status, page, search, method, sort],
    placeholderData: keepPreviousData,
    enabled: !!userEmail,
    refetchInterval: 30000,
    queryFn: async () => {
      const res = await axiosSecure.get("/cashouts", {
        params: {
          email: userEmail,
          status,
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          method: method || undefined,
          sort: sort || undefined,
        },
      });
      return res.data;
    },
  });

  const requests = data?.requests || [];
  const total = data?.total || 0;
  const counts = data?.counts || {};

  const markCashedOut = useMutation({
    mutationFn: async ({ request, file, transactionId, note }) => {
      const proofUrl = await uploadProof(file);
      const res = await axiosSecure.patch(
        `/cashouts/${request._id}/cashed-out`,
        { proofUrl, transactionId, note },
        { params: { email: userEmail } },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Marked as cashed out. The rider can now see the proof.");
      setSelected(null);
      if (requests.length === 1 && page > 1) setPage(page - 1);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "The proof could not be uploaded. Please try again.",
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["cashoutRequests"] }),
  });

  const changeTab = (key) => {
    setStatus(key);
    setPage(1);
  };

  return (
    <div className="w-full space-y-6 pb-8">
      <PageHeading
        eyebrow="Admin workspace"
        title="Cashout requests"
        description="Send each rider their payment using the details below, then mark the request as cashed out with a proof attachment."
      />

      <FilterTabs
        label="Request status"
        value={status}
        onChange={changeTab}
        tabs={TABS.map(({ key, label }) => ({
          key,
          label,
          count: counts[key] ?? 0,
        }))}
      />

      <ListToolbar
        searchId="cashout-search"
        searchLabel="Search requests"
        searchPlaceholder="Rider name, email or transaction ID"
        search={search}
        onSearch={updateSearch}
        activeCount={(search ? 1 : 0) + (method ? 1 : 0) + (sort ? 1 : 0)}
        onReset={resetFilters}
        summary={
          isLoading
            ? "Loading requests"
            : `${total} ${total === 1 ? "request" : "requests"} found`
        }
        filters={[
          {
            key: "method",
            label: "Payout method",
            options: [
              { value: "", label: "All methods" },
              ...Object.entries(CASHOUT_METHODS).map(([value, { label }]) => ({
                value,
                label,
              })),
            ],
            value: method,
            onChange: (value) => {
              setMethod(value);
              setPage(1);
            },
          },
          {
            key: "sort",
            label: "Sort by",
            options: [
              { value: "", label: "Default order" },
              { value: "highest", label: "Highest amount" },
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
        <CashoutRequestsListSkeleton />
      ) : isError ? (
        <div
          className="rounded-2xl border border-error/30 bg-error/10 p-6 text-center"
          role="alert"
        >
          <p className="font-semibold text-base-content">
            Cashout requests could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-sm btn-primary mt-4"
          >
            Try again
          </button>
        </div>
      ) : requests.length === 0 && (search || method) ? (
        <EmptyResults
          title="No requests match"
          message="Try another rider, transaction ID or payout method."
          onReset={resetFilters}
        />
      ) : requests.length === 0 ? (
        <EmptyState
          title={
            status === "pending"
              ? "No pending cashout requests"
              : "No cashed out requests yet"
          }
          description={
            status === "pending"
              ? "Rider payout requests will appear here."
              : "Requests you mark as cashed out will be listed here with their proof."
          }
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
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-base-content">
                      <FiUser className="text-info" aria-hidden="true" />
                      {request.riderName}
                    </p>
                    <p className="mt-1 break-all text-xs text-base-content/70">
                      {request.riderEmail}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/70">
                      <FiCalendar aria-hidden="true" />
                      Requested {formatDate(request.requestedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums text-base-content">
                      {formatCurrency(request.amount)}
                    </p>
                    <p className="text-xs text-base-content/65">
                      {request.orderIds?.length || 0} order
                      {request.orderIds?.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </header>

                <div className="space-y-4 p-4 sm:p-5">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-base-content">
                      Send via{" "}
                      {CASHOUT_METHODS[request.method]?.label || request.method}
                    </p>
                    <PayoutDetails
                      method={request.method}
                      details={request.details}
                    />
                  </div>

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

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-4 py-4 sm:px-5">
                  <CashoutStatusBadge status={request.status} />
                  {request.status === "pending" && (
                    <button
                      type="button"
                      className="btn btn-sm min-h-10 rounded-full bg-primary px-4 text-primary-content"
                      onClick={() => setSelected(request)}
                    >
                      Mark as cashed out
                    </button>
                  )}
                </footer>
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

      {selected && (
        <ProofModal
          request={selected}
          isSubmitting={markCashedOut.isPending}
          onClose={() => setSelected(null)}
          onSubmit={(form) =>
            markCashedOut.mutate({ request: selected, ...form })
          }
        />
      )}
    </div>
  );
};

export default CashoutRequests;