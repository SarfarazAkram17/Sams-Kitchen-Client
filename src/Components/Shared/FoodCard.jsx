import { Link } from "react-router";
import { useNavigate } from "react-router";
import { PiShoppingCartBold } from "react-icons/pi";
import { FiArrowUpRight } from "react-icons/fi";
import useCanOrder from "../../Hooks/useCanOrder";

const FoodCard = ({ food, discountedPrice, handleAddToCart }) => {
  const navigate = useNavigate();
  const canOrder = useCanOrder();
  const openDetails = () => navigate(`/foods/${food._id}`);

  return (
  <article
    role="link"
    tabIndex={0}
    aria-label={`View details for ${food.name}`}
    onClick={(event) => {
      if (!event.target.closest("a, button")) openDetails();
    }}
    onKeyDown={(event) => {
      if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openDetails();
      }
    }}
    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-primary"
  >
    <div className="relative aspect-[1.35/1] overflow-hidden bg-base-200">
      <Link
        to={`/foods/${food._id}`}
        aria-label={`See details for ${food.name}`}
        className="block h-full"
      >
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      {food.discount > 0 && (
        <span className="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-content shadow">
          Save {food.discount}%
        </span>
      )}
      <span className={`absolute bottom-3 right-3 rounded-full border border-base-100/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md ${food.available ? "bg-success text-success-content" : "bg-error text-error-content"}`}>
        {food.available ? "Ready to order" : "Currently unavailable"}
      </span>
    </div>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl leading-tight text-base-content">
          <Link to={`/foods/${food._id}`} className="hover:text-primary">{food.name}</Link>
        </h3>
        <span className="shrink-0 text-base font-bold text-primary">৳{discountedPrice.toFixed(0)}</span>
      </div>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-base-content/60">
        {food.description}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-5">
        {food.discount > 0 ? (
          <p className="text-xs text-base-content/50"><span className="line-through">৳{Number(food.price).toFixed(0)}</span><span className="ml-2 text-success">-{food.discount}%</span></p>
        ) : <span className="text-xs text-base-content/45">Made fresh to order</span>}
        <div className="flex items-center gap-2">
          <Link to={`/foods/${food._id}`} className="grid size-9 place-items-center rounded-full border border-base-300 text-base-content/70 transition hover:border-primary hover:text-primary" aria-label={`Details for ${food.name}`}>
            <FiArrowUpRight size={16} />
          </Link>
          {canOrder && (
            <button
              type="button"
              onClick={() => handleAddToCart(food)}
              disabled={!food.available}
              className="btn btn-sm min-h-9 rounded-full border-0 bg-primary px-3 text-primary-content hover:bg-primary/85 disabled:bg-base-300 disabled:text-base-content/40"
              aria-label={`Add ${food.name} to cart`}
            >
              <PiShoppingCartBold size={16} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  </article>
  );
};

export default FoodCard;
