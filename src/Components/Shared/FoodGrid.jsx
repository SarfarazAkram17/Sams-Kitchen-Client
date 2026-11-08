import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { addToCart } from "../../CartUtils/cartUtils";
import useAuth from "../../Hooks/useAuth";
import FoodCard from "./FoodCard";
import Reveal from "./Reveal";
import { foodPrice } from "../../lib/money";
import { HomeFoodGridSkeleton } from "../Skeletons/PageSkeletons";

/** Loading / error / empty / populated states for a row of FoodCards. */
const FoodGrid = ({ query, label, emptyTitle, emptyText, emptyAction }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: foods = [], isLoading, isError, refetch } = query;

  const handleAddToCart = (food) => {
    if (!user) {
      navigate("/login", { state: location.pathname });
      toast.info("Login first");
      return;
    }
    addToCart(food._id);
  };

  if (isLoading) {
    return (
      <HomeFoodGridSkeleton />
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-error/30 bg-base-100 p-5 sm:p-8 text-center" role="alert">
        <FiAlertCircle className="mx-auto text-3xl text-error" aria-hidden="true" />
        <h3 className="mt-3 font-bold text-base-content">We couldn’t load the {label}</h3>
        <p className="mt-1 text-sm text-base-content/70">Please try again in a moment.</p>
        <button type="button" onClick={() => refetch()} className="btn btn-sm mt-5 rounded-full border-base-300 bg-base-200 text-base-content">
          <FiRefreshCw aria-hidden="true" /> Try again
        </button>
      </div>
    );
  }

  if (foods.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 px-5 py-12 text-center">
        <h3 className="font-display text-3xl text-base-content">{emptyTitle}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-base-content/70">{emptyText}</p>
        <Link to={emptyAction.to} className="btn btn-primary btn-sm mt-5 rounded-full">
          {emptyAction.label}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {foods.map((food, index) => (
        <Reveal key={food._id} delay={index * 0.08} className="h-full">
          <FoodCard food={food} discountedPrice={foodPrice(food)} handleAddToCart={handleAddToCart} />
        </Reveal>
      ))}
    </div>
  );
};

export default FoodGrid;
