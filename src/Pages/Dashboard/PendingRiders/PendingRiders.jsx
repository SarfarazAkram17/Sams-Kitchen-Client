import { useCallback, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FiAlertCircle,
  FiCheck,
  FiEye,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import useAuth from "../../../Hooks/useAuth";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useConfirm from "../../../Hooks/useConfirm";
import AppPagination from "../../../Components/Shared/AppPagination";
import Avatar from "../../../Components/Shared/Avatar";
import EmptyResults from "../../../Components/Shared/EmptyResults";
import ListToolbar from "../../../Components/Shared/ListToolbar";
import PageHeading from "../../../Components/Shared/PageHeading";
import FilterTabs from "../../../Components/Shared/FilterTabs";
import { RidersListSkeleton } from "../../../Components/Skeletons/PageSkeletons";

const PAGE_SIZE = 10;

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name: A to Z" },
];

const defaultFilters = { search: "", region: "", sort: "newest" };

const appliedOn = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// Approve uses the primary colour, reject the accent colour; both follow the theme.
const ApproveButton = ({ onClick, busy, disabled, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-busy={busy}
    className={`btn btn-primary h-10 gap-2 rounded-full px-4 ${className}`}
  >
    {busy ? (
      <span className="loading loading-spinner loading-xs" />
    ) : (
      <FiCheck aria-hidden="true" />
    )}
    Approve
  </button>
);

const RejectButton = ({ onClick, busy, disabled, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-busy={busy}
    className={`btn h-10 gap-2 rounded-full border-accent/45 px-4 text-accent hover:border-accent hover:bg-accent hover:text-accent-content ${className}`}
  >
    {busy ? (
      <span className="loading loading-spinner loading-xs" />
    ) : (
      <FiX aria-hidden="true" />
    )}
    Reject
  </button>
);

const PendingRiders = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("pending");
  const [filters, setFilters] = useState(defaultFilters);
  const [selected, setSelected] = useState(null);
  const [working, setWorking] = useState({ id: null, action: "" });

  const update = useCallback((patch) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);
  const setSearch = useCallback((search) => update({ search }), [update]);
  const changeTab = (next) => {
    setTab(next);
    setPage(1);
  };
  const reset = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => (await fetch("/regions.json")).json(),
    staleTime: Infinity,
  });

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["pending-riders", tab, page, filters],
    queryFn: async () => {
      const res = await axiosSecure.get("/riders/pending", {
        params: {
          email: userEmail,
          status: tab,
          page,
          limit: PAGE_SIZE,
          search: filters.search || undefined,
          region: filters.region || undefined,
          sort: filters.sort,
        },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const riders = data?.pendingRiders || [];
  const total = data?.total || 0;
  const allPending = data?.allPending ?? 0;
  const allRejected = data?.allRejected ?? 0;
  const rejectedTab = tab === "rejected";
  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.region ? 1 : 0) +
    (filters.sort !== "newest" ? 1 : 0);

  const finish = (message) => {
    toast.success(message);
    setSelected(null);
    if (riders.length === 1 && page > 1) setPage(page - 1);
    queryClient.invalidateQueries({ queryKey: ["pending-riders"] });
  };

  const approve = useMutation({
    mutationFn: ({ id, email }) =>
      axiosSecure.patch(`/riders/${id}/status?email=${userEmail}`, {
        status: "active",
        email,
      }),
    onSuccess: () => finish("Rider approved."),
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "The rider could not be approved.",
      ),
    onSettled: () => setWorking({ id: null, action: "" }),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) =>
      axiosSecure.patch(`/riders/${id}/reject?email=${userEmail}`, { reason }),
    onSuccess: () => finish("Application rejected. The rider can apply again."),
    onError: (error) =>
      toast.error(
        error.response?.data?.message ||
          "The application could not be rejected.",
      ),
    onSettled: () => setWorking({ id: null, action: "" }),
  });

  const handleApprove = async (rider) => {
    const confirmed = await confirm({
      title: rejectedTab
        ? `Approve ${rider.name} after all?`
        : `Approve ${rider.name}?`,
      message:
        "They will be able to accept delivery offers in their area straight away.",
      confirmLabel: "Approve rider",
    });
    if (!confirmed) return;
    setWorking({ id: rider._id, action: "approve" });
    approve.mutate({ id: rider._id, email: rider.email });
  };

  const handleReject = async (rider) => {
    const reason = await confirm({
      title: `Reject ${rider.name}?`,
      message:
        "They keep their account, see your reason, and can update their details and apply again.",
      confirmLabel: "Reject application",
      tone: "danger",
      input: {
        label: "Reason (the rider will see this)",
        placeholder: "e.g. The phone number doesn’t look right",
        maxLength: 300,
      },
    });
    if (reason === null) return;
    setWorking({ id: rider._id, action: "reject" });
    reject.mutate({ id: rider._id, reason });
  };

  const busy = Boolean(working.id);
  const area = (rider) =>
    [rider.thana, rider.district].filter(Boolean).join(", ");

  return (
    <div className="w-full space-y-6 pb-8">
      <PageHeading
        eyebrow="Admin workspace"
        title="Rider applications"
        description="Review each application before a rider can take deliveries. Rejected riders see your reason and can apply again."
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/70 px-4 py-2 text-sm font-semibold">
          <FiUserCheck aria-hidden="true" className="text-primary" />
          {allPending} waiting
        </span>
      </PageHeading>

      <FilterTabs
        label="Application status"
        value={tab}
        onChange={changeTab}
        tabs={[
          { key: "pending", label: "Pending", count: allPending },
          { key: "rejected", label: "Rejected", count: allRejected },
        ]}
      />

      <ListToolbar
        searchId="riders-search"
        searchLabel="Search applicants"
        searchPlaceholder="Name, email, phone or thana"
        search={filters.search}
        onSearch={setSearch}
        activeCount={activeCount}
        onReset={reset}
        summary={
          isLoading
            ? "Loading applications"
            : `${total} ${total === 1 ? "application" : "applications"} found`
        }
        filters={[
          {
            key: "region",
            label: "Region",
            options: [
              { value: "", label: "All regions" },
              ...regions.map((name) => ({ value: name, label: name })),
            ],
            value: filters.region,
            onChange: (region) => update({ region }),
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
        <RidersListSkeleton />
      ) : isError ? (
        <div
          className="rounded-3xl border border-error/30 bg-base-100 p-8 text-center"
          role="alert"
        >
          <FiAlertCircle
            className="mx-auto text-3xl text-error"
            aria-hidden="true"
          />
          <h2 className="mt-3 font-bold">Applications could not be loaded</h2>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-sm mt-4 gap-2 rounded-full"
          >
            <FiRefreshCw aria-hidden="true" /> Try again
          </button>
        </div>
      ) : riders.length === 0 ? (
        (rejectedTab ? allRejected : allPending) === 0 ? (
          <section className="rounded-3xl border border-base-300 bg-base-100 px-6 py-14 text-center shadow-sm">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <FiUserCheck size={25} aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-3xl">
              {rejectedTab ? "Nothing rejected" : "All caught up"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-base-content/70">
              {rejectedTab
                ? "No applications have been rejected."
                : "There are no rider applications waiting for review."}
            </p>
          </section>
        ) : (
          <EmptyResults
            title="No applications match"
            message="Try another name or area, or reset the filters."
            onReset={activeCount ? reset : undefined}
          />
        )
      ) : (
        <div
          className={
            isFetching ? "opacity-70 transition-opacity" : "transition-opacity"
          }
        >
          <div className="hidden overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-[var(--shadow-card)] lg:block">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200/70 text-xs uppercase tracking-wider text-base-content/60">
                    <th>Applicant</th>
                    <th>Contact</th>
                    <th>Delivery area</th>
                    <th>Experience</th>
                    <th>{rejectedTab ? "Rejected" : "Applied"}</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map((rider) => (
                    <tr key={rider._id} className="hover:bg-base-200/40">
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={rider.name} className="size-11" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {rider.name}
                            </p>
                            <p className="truncate text-sm text-base-content/60">
                              {rider.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-sm">
                        {rider.phone}
                      </td>
                      <td className="text-sm">
                        <p className="font-medium">{area(rider)}</p>
                        <p className="text-base-content/60">{rider.region}</p>
                      </td>
                      <td className="whitespace-nowrap text-sm">
                        {rider.experience}{" "}
                        {Number(rider.experience) === 1 ? "year" : "years"}
                        <span className="text-base-content/55">
                          {" "}
                          · {rider.age} yrs old
                        </span>
                      </td>
                      <td className="text-sm text-base-content/70">
                        <p className="whitespace-nowrap">
                          {appliedOn(
                            rejectedTab ? rider.rejectedAt : rider.appliedAt,
                          )}
                        </p>
                        {rejectedTab && rider.rejectionReason && (
                          <p
                            className="mt-0.5 line-clamp-2 max-w-48 text-xs"
                            title={rider.rejectionReason}
                          >
                            {rider.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelected(rider)}
                            aria-label={`View ${rider.name}'s application`}
                            className="btn btn-square size-10 rounded-full border-base-300"
                          >
                            <FiEye aria-hidden="true" />
                          </button>
                          {!rejectedTab && (
                            <RejectButton
                              onClick={() => handleReject(rider)}
                              disabled={busy}
                              busy={
                                working.id === rider._id &&
                                working.action === "reject"
                              }
                            />
                          )}
                          <ApproveButton
                            onClick={() => handleApprove(rider)}
                            disabled={busy}
                            busy={
                              working.id === rider._id &&
                              working.action === "approve"
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="space-y-3 lg:hidden">
            {riders.map((rider) => (
              <li
                key={rider._id}
                className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={rider.name} className="size-12" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{rider.name}</p>
                    <p className="truncate text-sm text-base-content/60">
                      {rider.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(rider)}
                    aria-label={`View ${rider.name}'s application`}
                    className="btn btn-square size-10 shrink-0 rounded-full border-base-300"
                  >
                    <FiEye aria-hidden="true" />
                  </button>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-base-300 pt-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-base-content/55">
                      Phone
                    </dt>
                    <dd className="mt-0.5 font-medium">{rider.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-base-content/55">
                      {rejectedTab ? "Rejected" : "Applied"}
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {appliedOn(
                        rejectedTab ? rider.rejectedAt : rider.appliedAt,
                      )}
                    </dd>
                  </div>
                  {rejectedTab && rider.rejectionReason && (
                    <div className="col-span-2">
                      <dt className="text-xs uppercase tracking-wider text-base-content/55">
                        Reason
                      </dt>
                      <dd className="mt-0.5 break-words font-medium">
                        {rider.rejectionReason}
                      </dd>
                    </div>
                  )}
                  <div className="col-span-2">
                    <dt className="text-xs uppercase tracking-wider text-base-content/55">
                      Delivery area
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {area(rider)}, {rider.region}
                    </dd>
                  </div>
                </dl>
                <div
                  className={`mt-4 grid gap-2 ${rejectedTab ? "grid-cols-1" : "grid-cols-2"}`}
                >
                  {!rejectedTab && (
                    <RejectButton
                      onClick={() => handleReject(rider)}
                      disabled={busy}
                      busy={
                        working.id === rider._id && working.action === "reject"
                      }
                    />
                  )}
                  <ApproveButton
                    onClick={() => handleApprove(rider)}
                    disabled={busy}
                    busy={
                      working.id === rider._id && working.action === "approve"
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {total > PAGE_SIZE && (
        <AppPagination
          className="mt-2"
          current={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      )}

      {selected && (
        <div className="fixed inset-0 z-[1100] grid place-items-center p-4">
          <button
            type="button"
            aria-label="Close application"
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rider-title"
            className="surface-panel relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-5 shadow-[var(--shadow-float)] sm:p-7"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close application"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-base-content/60 hover:bg-base-200 hover:text-accent"
            >
              <FiX size={20} />
            </button>
            <div className="flex items-center gap-4 pr-8">
              <Avatar
                name={selected.name}
                className="size-14"
                textClassName="text-lg"
              />
              <div className="min-w-0">
                <h2 id="rider-title" className="truncate font-display text-2xl">
                  {selected.name}
                </h2>
                <p className="truncate text-sm text-base-content/60">
                  {selected.email}
                </p>
              </div>
            </div>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: FiPhone, label: "Phone", value: selected.phone },
                {
                  icon: FiUserCheck,
                  label: "Age",
                  value: `${selected.age} years`,
                },
                {
                  icon: FiUserCheck,
                  label: "Experience",
                  value: `${selected.experience} years`,
                },
                { icon: FiMapPin, label: "Region", value: selected.region },
                { icon: FiMapPin, label: "District", value: selected.district },
                { icon: FiMapPin, label: "Thana", value: selected.thana },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl bg-base-200/60 px-4 py-3"
                >
                  <Icon
                    className="mt-0.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <dt className="text-xs uppercase tracking-wider text-base-content/55">
                      {label}
                    </dt>
                    <dd className="break-words font-semibold">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-base-content/60">
              {rejectedTab ? "Rejected" : "Applied"} on{" "}
              {appliedOn(
                rejectedTab ? selected.rejectedAt : selected.appliedAt,
              )}
            </p>
            {rejectedTab && selected.rejectionReason && (
              <p className="mt-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-6">
                <span className="font-semibold">Reason: </span>
                {selected.rejectionReason}
              </p>
            )}
            <div
              className={`mt-6 grid gap-3 ${rejectedTab ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {!rejectedTab && (
                <RejectButton
                  onClick={() => handleReject(selected)}
                  disabled={busy}
                  busy={
                    working.id === selected._id && working.action === "reject"
                  }
                  className="h-11"
                />
              )}
              <ApproveButton
                onClick={() => handleApprove(selected)}
                disabled={busy}
                busy={
                  working.id === selected._id && working.action === "approve"
                }
                className="h-11"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRiders;