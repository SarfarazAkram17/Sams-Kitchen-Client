import { useCallback, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "react-router";
import { toast } from "react-toastify";
import {
  FiAlertCircle,
  FiEdit3,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import useAxios from "../../../Hooks/useAxios";
import useAxiosSecure from "../../../Hooks/useAxiosSecure";
import useAuth from "../../../Hooks/useAuth";
import useConfirm from "../../../Hooks/useConfirm";
import { foodPrice, formatAmount } from "../../../lib/money";
import AppPagination from "../../../Components/Shared/AppPagination";
import EmptyResults from "../../../Components/Shared/EmptyResults";
import LazyImage from "../../../Components/Shared/LazyImage";
import ListToolbar from "../../../Components/Shared/ListToolbar";
import PageHeading from "../../../Components/Shared/PageHeading";
import { ManageFoodsGridSkeleton } from "../../../Components/Skeletons/PageSkeletons";

const PAGE_SIZE = 12;

const AVAILABILITY = [
  { value: "", label: "All dishes" },
  { value: "true", label: "Available" },
  { value: "false", label: "Unavailable" },
];

const OFFERS = [
  { value: "", label: "All prices" },
  { value: "true", label: "On offer" },
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
  { value: "name", label: "Name: A to Z" },
];

const defaultFilters = {
  search: "",
  available: "",
  onOffer: "",
  sort: "newest",
};

const ManageFoods = () => {
  const { userEmail } = useAuth();
  const axiosInstance = useAxios();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);
  const [deletingId, setDeletingId] = useState(null);

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
    queryKey: ["manage-foods", page, filters],
    queryFn: async () => {
      const res = await axiosInstance.get("/foods", {
        params: {
          page,
          limit: PAGE_SIZE,
          search: filters.search || undefined,
          available: filters.available || undefined,
          onOffer: filters.onOffer || undefined,
          sort: filters.sort,
        },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const foods = data?.foods || [];
  const total = data?.total || 0;
  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.available ? 1 : 0) +
    (filters.onOffer ? 1 : 0) +
    (filters.sort !== "newest" ? 1 : 0);

  const deleteFood = useMutation({
    mutationFn: (id) => axiosSecure.delete(`/foods/${id}?email=${userEmail}`),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      toast.success("Dish deleted.");
      if (foods.length === 1 && page > 1) setPage(page - 1);
      queryClient.invalidateQueries({ queryKey: ["manage-foods"] });
      queryClient.invalidateQueries({ queryKey: ["/foods"] });
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "The dish could not be deleted.",
      ),
    onSettled: () => setDeletingId(null),
  });

  const handleDelete = async (food) => {
    const confirmed = await confirm({
      title: `Delete ${food.name}?`,
      message: "This dish will be removed from the menu for good.",
      confirmLabel: "Delete dish",
      tone: "danger",
    });
    if (confirmed) deleteFood.mutate(food._id);
  };

  return (
    <div className="w-full space-y-6 pb-8">
      <PageHeading
        eyebrow="Admin workspace"
        title="Manage foods"
        description="Search the menu, change prices and discounts, or take a dish off while it is unavailable."
      >
        <Link
          to="/dashboard/addFood"
          className="btn btn-primary h-11 gap-2 rounded-full px-6"
        >
          <FiPlus aria-hidden="true" /> Add dish
        </Link>
      </PageHeading>

      <ListToolbar
        searchId="foods-search"
        searchLabel="Search dishes"
        searchPlaceholder="Name or description"
        search={filters.search}
        onSearch={setSearch}
        activeCount={activeCount}
        onReset={reset}
        summary={
          isLoading
            ? "Loading dishes"
            : `${total} ${total === 1 ? "dish" : "dishes"} found`
        }
        filters={[
          {
            key: "available",
            label: "Availability",
            options: AVAILABILITY,
            value: filters.available,
            onChange: (available) => update({ available }),
          },
          {
            key: "offer",
            label: "Offers",
            options: OFFERS,
            value: filters.onOffer,
            onChange: (onOffer) => update({ onOffer }),
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
        <ManageFoodsGridSkeleton />
      ) : isError ? (
        <div
          className="rounded-3xl border border-error/30 bg-base-100 p-8 text-center"
          role="alert"
        >
          <FiAlertCircle
            className="mx-auto text-3xl text-error"
            aria-hidden="true"
          />
          <h2 className="mt-3 font-bold">The menu could not be loaded</h2>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-sm mt-4 gap-2 rounded-full"
          >
            <FiRefreshCw aria-hidden="true" /> Try again
          </button>
        </div>
      ) : foods.length === 0 ? (
        <EmptyResults
          title="No dishes match"
          message="Try another search, or reset the filters to see the whole menu."
          onReset={activeCount ? reset : undefined}
        />
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${
            isFetching ? "opacity-70 transition-opacity" : "transition-opacity"
          }`}
        >
          {foods.map((food) => {
            const final = foodPrice(food);
            const discounted = Number(food.discount) > 0;
            const unavailable = food.available === false;
            return (
              <article
                key={food._id}
                className="surface-panel group flex h-full flex-col overflow-hidden rounded-3xl shadow"
              >
                <div className="relative aspect-[1.4/1] overflow-hidden bg-base-200">
                  <LazyImage
                    src={food.image}
                    alt={food.name}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold backdrop-blur ${
                      unavailable
                        ? "bg-accent/90 text-accent-content"
                        : "bg-black/55 text-white"
                    }`}
                  >
                    {unavailable ? "Unavailable" : "Available"}
                  </span>
                  {discounted && (
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-content shadow">
                      {Math.round(food.discount)}% off
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-xl leading-tight">
                    {food.name}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-base-content/65">
                    {food.description}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-base-300 pt-4">
                    <div>
                      <p className="text-xl font-bold leading-none text-primary">
                        ৳{formatAmount(final)}
                      </p>
                      {discounted && (
                        <p className="mt-1.5 text-xs text-base-content/55 line-through">
                          ৳{formatAmount(food.price)}
                        </p>
                      )}
                    </div>
                    {food.addedAt && (
                      <p className="text-xs text-base-content/50">
                        Added{" "}
                        {new Date(food.addedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      to={`/dashboard/editFood/${food._id}`}
                      className="btn h-10 gap-2 rounded-full border-primary/40 text-primary hover:border-primary hover:bg-primary hover:text-primary-content"
                    >
                      <FiEdit3 aria-hidden="true" /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(food)}
                      disabled={deletingId === food._id}
                      aria-busy={deletingId === food._id}
                      className="btn h-10 gap-2 rounded-full border-accent/40 text-accent hover:border-accent hover:bg-accent hover:text-accent-content"
                    >
                      {deletingId === food._id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <FiTrash2 aria-hidden="true" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
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

export default ManageFoods;