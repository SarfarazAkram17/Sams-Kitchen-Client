import { useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FiAlertCircle, FiRefreshCw, FiUsers } from "react-icons/fi";
import useAuth from "../../../Hooks/useAuth";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useRoles from "../../../Hooks/useRoles";
import AppPagination from "../../../Components/Shared/AppPagination";
import Avatar from "../../../Components/Shared/Avatar";
import EmptyResults from "../../../Components/Shared/EmptyResults";
import ListToolbar from "../../../Components/Shared/ListToolbar";
import PageHeading from "../../../Components/Shared/PageHeading";
import FilterTabs from "../../../Components/Shared/FilterTabs";
import { UsersListSkeleton } from "../../../Components/Skeletons/PageSkeletons";

const PAGE_SIZE = 10;

const PROVIDERS = [
  { value: "", label: "All sign-in methods" },
  { value: "password", label: "Email and password" },
  { value: "google.com", label: "Google" },
  { value: "facebook.com", label: "Facebook" },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name: A to Z" },
];

const defaultFilters = { search: "", role: "", provider: "", sort: "newest" };

const roleTones = {
  admin: "bg-accent/15 text-accent",
  rider: "bg-secondary/15 text-secondary",
  customer: "bg-primary/15 text-primary",
};

const providerLabel = (providerId) =>
  providerId === "google.com"
    ? "Google"
    : providerId === "facebook.com"
      ? "Facebook"
      : "Email and password";

const joinedOn = (value) => {
  const time = Number(value);
  if (!time) return "—";
  return new Date(time).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const RoleBadge = ({ role, label }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
      roleTones[role] || "bg-base-200 text-base-content/70"
    }`}
  >
    {label}
  </span>
);

const ManageUsers = () => {
  const { userEmail } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { roles } = useRoles();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);

  const update = useCallback((patch) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);
  const setSearch = useCallback((search) => update({ search }), [update]);
  const reset = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["users", page, filters],
    queryFn: async () => {
      const res = await axiosSecure.get("/users", {
        params: {
          email: userEmail,
          page,
          limit: PAGE_SIZE,
          search: filters.search || undefined,
          role: filters.role || undefined,
          provider: filters.provider || undefined,
          sort: filters.sort,
        },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const users = data?.users || [];
  const total = data?.total || 0;
  const roleCounts = data?.roleCounts || {};
  const everyone = Object.values(roleCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const roleLabels = Object.fromEntries(
    roles.map(({ key, label }) => [key, label]),
  );
  const labelFor = (role) => roleLabels[role] || "No role yet";

  const roleOptions = [
    { value: "", label: "All roles" },
    ...roles.map(({ key, label }) => ({ value: key, label })),
    { value: "none", label: "No role yet" },
  ];

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.role ? 1 : 0) +
    (filters.provider ? 1 : 0) +
    (filters.sort !== "newest" ? 1 : 0);

  const chips = [
    { value: "", label: "Everyone", count: everyone },
    ...roles.map(({ key, label }) => ({
      value: key,
      label,
      count: roleCounts[key] || 0,
    })),
    ...(roleCounts.none
      ? [{ value: "none", label: "No role yet", count: roleCounts.none }]
      : []),
  ];

  return (
    <div className="w-full space-y-6 pb-8">
      <PageHeading
        eyebrow="Admin workspace"
        title="Manage users"
        description="Everyone with an account, who they are and what they can do. Roles come from the database."
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100/70 px-4 py-2 text-sm font-semibold">
          <FiUsers aria-hidden="true" className="text-primary" />
          {everyone} {everyone === 1 ? "account" : "accounts"}
        </span>
      </PageHeading>

      <FilterTabs
        label="Filter by role"
        value={filters.role}
        onChange={(value) => update({ role: value })}
        tabs={chips.map((chip) => ({
          key: chip.value,
          label: chip.label,
          count: chip.count,
        }))}
      />

      <ListToolbar
        searchId="users-search"
        searchLabel="Search users"
        searchPlaceholder="Name or email"
        search={filters.search}
        onSearch={setSearch}
        activeCount={activeCount}
        onReset={reset}
        summary={
          isLoading
            ? "Loading users"
            : `${total} ${total === 1 ? "user" : "users"} found`
        }
        filters={[
          {
            key: "role",
            label: "Role",
            options: roleOptions,
            value: filters.role,
            onChange: (role) => update({ role }),
          },
          {
            key: "provider",
            label: "Sign-in method",
            options: PROVIDERS,
            value: filters.provider,
            onChange: (provider) => update({ provider }),
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
        <UsersListSkeleton />
      ) : isError ? (
        <div
          className="rounded-3xl border border-error/30 bg-base-100 p-8 text-center"
          role="alert"
        >
          <FiAlertCircle
            className="mx-auto text-3xl text-error"
            aria-hidden="true"
          />
          <h2 className="mt-3 font-bold">Users could not be loaded</h2>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-sm mt-4 gap-2 rounded-full"
          >
            <FiRefreshCw aria-hidden="true" /> Try again
          </button>
        </div>
      ) : users.length === 0 ? (
        <EmptyResults
          title="No users match"
          message="Try another name or email, or clear the filters."
          onReset={activeCount ? reset : undefined}
        />
      ) : (
        <div
          className={
            isFetching ? "opacity-70 transition-opacity" : "transition-opacity"
          }
        >
          <div className="hidden overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-[var(--shadow-card)] md:block">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-base-200/70 text-xs uppercase tracking-wider text-base-content/60">
                    <th className="w-14">#</th>
                    <th>User</th>
                    <th>Sign-in method</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id} className="hover:bg-base-200/40">
                      <td className="tabular-nums text-base-content/55">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.photo}
                            name={user.name}
                            className="size-11"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {user.name || "Unnamed"}
                            </p>
                            <p className="truncate text-sm text-base-content/60">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">
                        {providerLabel(user.providerId)}
                      </td>
                      <td>
                        <RoleBadge
                          role={user.role}
                          label={labelFor(user.role)}
                        />
                      </td>
                      <td className="whitespace-nowrap text-sm text-base-content/70">
                        {joinedOn(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="space-y-3 md:hidden">
            {users.map((user) => (
              <li
                key={user._id}
                className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.photo}
                    name={user.name}
                    className="size-12"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {user.name || "Unnamed"}
                    </p>
                    <p className="truncate text-sm text-base-content/60">
                      {user.email}
                    </p>
                  </div>
                  <RoleBadge role={user.role} label={labelFor(user.role)} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-base-300 pt-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-base-content/55">
                      Sign-in
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {providerLabel(user.providerId)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-base-content/55">
                      Joined
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {joinedOn(user.createdAt)}
                    </dd>
                  </div>
                </dl>
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
    </div>
  );
};

export default ManageUsers;