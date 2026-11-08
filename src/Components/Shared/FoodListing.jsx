import { useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import useAxios from "../../Hooks/useAxios";
import useAuth from "../../Hooks/useAuth";
import { addToCart } from "../../CartUtils/cartUtils";
import { foodPrice } from "../../lib/money";
import AppPagination from "./AppPagination";
import EmptyState from "./EmptyState";
import FoodCard from "./FoodCard";
import FoodFilters from "./FoodFilters";
import LazyMount from "./LazyMount";
import { FoodCardSkeleton } from "../Skeletons/CardSkeletons";
import { FoodGridSkeleton } from "../Skeletons/PageSkeletons";

const PAGE_SIZE = 12;

const defaultFilters = {
  search: "",
  sort: "newest",
  minPrice: "",
  maxPrice: "",
  available: false,
  onOffer: false,
  minDiscount: "",
};

const countActive = (filters) =>
  Object.keys(defaultFilters).filter((key) => key !== "sort" && filters[key] !== defaultFilters[key]).length +
  (filters.sort !== defaultFilters.sort ? 1 : 0);

// The menu with search, sorting and filters. All Foods and Offers differ only
// in the endpoint, the heading and the offers-only discount picker.
const FoodListing = ({ endpoint, mode, eyebrow, title, subtitle, emptyTitle, emptyText }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosInstance = useAxios();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(defaultFilters);

  const updateFilters = useCallback((patch) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const resetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const params = {
    page,
    limit: PAGE_SIZE,
    sort: filters.sort,
    search: filters.search || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    available: filters.available || undefined,
    onOffer: mode === "all" && filters.onOffer ? true : undefined,
    minDiscount: mode === "offers" && filters.minDiscount ? filters.minDiscount : undefined,
  };

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: [endpoint, params],
    queryFn: async () => (await axiosInstance.get(endpoint, { params })).data,
    placeholderData: keepPreviousData,
  });

  const foods = data?.foods || [];
  const total = data?.total || 0;
  const activeCount = countActive(filters);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const handleAddToCart = (food) => {
    if (!user) {
      navigate("/login", { state: location.pathname });
      toast.info("Login first");
      return;
    }

    addToCart(food._id);
  };

  let results;
  if (isLoading) {
    results = <FoodGridSkeleton />;
  } else if (isError) {
    results = (
      <div className="rounded-3xl border border-error/30 bg-base-100 p-5 sm:p-8 text-center" role="alert">
        <FiAlertCircle className="mx-auto text-3xl text-error" aria-hidden="true" />
        <h3 className="mt-3 font-bold">We couldn’t load the dishes</h3>
        <p className="mt-1 text-sm text-base-content/70">Check your connection and try again.</p>
        <button type="button" onClick={() => refetch()} className="btn btn-sm mt-5 gap-2 rounded-full">
          <FiRefreshCw aria-hidden="true" /> Try again
        </button>
      </div>
    );
  } else if (foods.length === 0) {
    results =
      activeCount > 0 ? (
        <div className="flex flex-col items-center gap-4">
          <EmptyState
            title="No dishes match these filters"
            description="Try a different search, widen the price range, or reset the filters."
          />
          <button type="button" onClick={resetFilters} className="btn btn-primary">
            Reset filters
          </button>
        </div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyText} />
      );
  } else {
    results = (
      <>
        <div
          className={`grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          {foods.map((food) => (
            <LazyMount key={food._id} className="h-full" placeholder={<FoodCardSkeleton />}>
              <FoodCard food={food} discountedPrice={foodPrice(food)} handleAddToCart={handleAddToCart} />
            </LazyMount>
          ))}
        </div>

        <p className="mt-8 text-sm text-base-content/60">
          Showing {from}–{to} of {total}
        </p>
        {total > PAGE_SIZE && (
          <AppPagination
            className="mt-3"
            current={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="mx-auto mb-16 max-w-[1500px] px-4">
      <header className="mb-8 border-b border-base-300 pb-7 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-primary">{eyebrow}</p>
        <h1 className="font-display text-4xl sm:text-5xl text-base-content sm:text-6xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-base-content/65">{subtitle}</p>
      </header>

      <FoodFilters
        filters={filters}
        mode={mode}
        activeCount={activeCount}
        resultCount={total}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      {results}
    </div>
  );
};

export default FoodListing;
