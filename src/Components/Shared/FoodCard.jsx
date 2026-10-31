import { Link, useNavigate } from "react-router";
import { PiShoppingCartBold } from "react-icons/pi";
import { FiArrowUpRight } from "react-icons/fi";
import useCanOrder from "../../Hooks/useCanOrder";

const FoodCard = ({ food, discountedPrice, handleAddToCart }) => {
  const navigate = useNavigate();
  const canOrder = useCanOrder();
  const openDetails = () => navigate(`/foods/${food._id}`);
  const hasDiscount = food.discount > 0;

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
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-100 transition duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-2xl hover:shadow-black/15 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-[1.3/1] overflow-hidden bg-base-200">
        <Link to={`/foods/${food._id}`} aria-label={`See details for ${food.name}`} className="block h-full">
          <img
            src={food.image}
            alt={food.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true" />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-content shadow-md">
            Save {food.discount}%
          </span>
        )}
        <span
          className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow ${
            food.available ? "bg-success text-success-content" : "bg-error text-error-content"
          }`}
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {food.available ? "Ready to order" : "Unavailable"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.7rem] leading-tight text-base-content">
          <Link to={`/foods/${food._id}`} className="hover:text-primary">{food.name}</Link>
        </h3>
        <p className="mb-5 mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-base-content/70">{food.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-base-300 pt-4">
          <div>
            <p className="text-xl font-bold leading-none text-base-content">৳{discountedPrice.toFixed(0)}</p>
            {hasDiscount ? (
              <p className="mt-1.5 text-xs text-base-content/60">
                <span className="line-through">৳{Number(food.price).toFixed(0)}</span>
                <span className="ml-2 font-semibold text-success">-{food.discount}%</span>
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-base-content/60">Made fresh to order</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/foods/${food._id}`}
              className="grid size-10 place-items-center rounded-full border border-base-300 text-base-content transition hover:border-primary hover:text-primary"
              aria-label={`Details for ${food.name}`}
            >
              <FiArrowUpRight size={17} />
            </Link>
            {canOrder && (
              <button
                type="button"
                onClick={() => handleAddToCart(food)}
                disabled={!food.available}
                className="btn btn-primary btn-sm min-h-10 px-4 disabled:border-base-300 disabled:!bg-base-300 disabled:!text-base-content/50"
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
