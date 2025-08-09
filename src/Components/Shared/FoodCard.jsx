import { Link } from "react-router";
import { PiShoppingCartBold } from "react-icons/pi";

const FoodCard = ({ food, discountedPrice, handleAddToCart }) => {
  return (
    <div
      key={food._id}
      className="border group rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-500 flex flex-col relative"
    >
      {/* Discount Badge */}
      {food.discount > 0 && (
        <span className="absolute top-1.5 right-1.5 bg-secondary text-white text-xs font-semibold px-2 py-1 rounded-full shadow z-10">
          {food.discount}% off
        </span>
      )}

      <img
        src={food.image}
        alt={food.name}
        className="w-full group-hover:scale-108 overflow-hidden transition-all duration-300 h-48 object-cover"
      />

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-primary mb-1">{food.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{food.description}</p>

        {/* Price */}
        <p className="mt-2">
          <strong>Price:</strong>{" "}
          {food.discount > 0 ? (
            <>
              <span className="text-green-600 font-semibold">
                ৳{discountedPrice.toFixed(2)}
              </span>{" "}
              <span className="line-through text-xs text-gray-400 mr-2">
                ৳{food.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-green-600 font-semibold">
              ৳{food.price.toFixed(2)}
            </span>
          )}
        </p>

        <p className="text-sm mt-2">
          <strong>Status:</strong>{" "}
          {food.available ? (
            <span className="text-green-600 font-medium">Available</span>
          ) : (
            <span className="text-red-600 font-medium">Unavailable</span>
          )}
        </p>

        <div className="flex justify-between items-center mt-6">
          <Link to={`/foods/${food._id}`}>
            <button className="btn btn-sm btn-outline btn-primary hover:text-white">
              Details
            </button>
          </Link>
          <button
            onClick={() => handleAddToCart(food)}
            disabled={!food.available}
            className="btn btn-sm btn-outline btn-secondary disabled:text-black/50 hover:text-white"
          >
            <PiShoppingCartBold size={17} className="mr-1" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
