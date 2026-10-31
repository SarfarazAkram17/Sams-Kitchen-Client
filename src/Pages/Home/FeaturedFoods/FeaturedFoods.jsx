import { toast } from "react-toastify";
import { addToCart } from "../../../CartUtils/cartUtils";
import useAuth from "../../../Hooks/useAuth";
import { useLocation, useNavigate } from "react-router";
import useAxios from "../../../Hooks/useAxios";
import { useQuery } from "@tanstack/react-query";
import FoodCard from "../../../Components/Shared/FoodCard";
import { FiAlertCircle, FiArrowUpRight, FiRefreshCw } from "react-icons/fi";
import { Link } from "react-router";

const FeaturedFoods = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosInstance = useAxios();

  // Fetch foods with pagination
  const { data: foods = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["randomFoods"],
    queryFn: async () => {
      const res = await axiosInstance.get("/foods/random");
      return res.data;
    },
  });

  const handleAddToCart = (food) => {
    if (!user) {
      navigate("/login", { state: location.pathname });
      toast.info("Login first");
      return;
    }

    addToCart(food._id);
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4" aria-labelledby="featured-foods-title">
      <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">From our kitchen</p>
          <h2 id="featured-foods-title" className="font-display mt-2 text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            House favorites
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-base-content/65 sm:text-base">
            The dishes our guests come back for, prepared fresh when you order.
          </p>
        </div>
        <Link to="/allFoods" className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full px-1 text-sm font-bold text-primary hover:underline">
          See the full menu <FiArrowUpRight aria-hidden="true" />
        </Link>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured dishes">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
              <div className="aspect-[1.35/1] animate-pulse bg-base-200" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-base-200" />
                <div className="h-4 w-full animate-pulse rounded bg-base-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-base-200" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-7 text-center" role="alert">
          <FiAlertCircle className="mx-auto text-2xl text-error" aria-hidden="true" />
          <h3 className="mt-3 font-bold text-base-content">Featured dishes could not be loaded</h3>
          <p className="mt-1 text-sm text-base-content/65">Please try again in a moment.</p>
          <button type="button" onClick={() => refetch()} className="btn btn-sm mt-4 rounded-full border-base-300 bg-base-200 text-base-content">
            <FiRefreshCw aria-hidden="true" /> Try again
          </button>
        </div>
      ) : foods.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/60 px-5 py-10 text-center">
          <h3 className="font-display text-2xl font-bold text-base-content">The menu is being refreshed</h3>
          <p className="mt-2 text-sm text-base-content/65">Browse all dishes to see what’s available today.</p>
          <Link to="/allFoods" className="btn btn-sm mt-4 rounded-full bg-primary text-primary-content">Browse menu</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => {
            const price = Number(food.price || 0);
            const discountedPrice = food.discount > 0
              ? price - (price * Number(food.discount)) / 100
              : price;
            return (
              <FoodCard
                key={food._id}
                food={food}
                discountedPrice={discountedPrice}
                handleAddToCart={handleAddToCart}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default FeaturedFoods;