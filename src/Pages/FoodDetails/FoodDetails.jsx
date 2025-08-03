import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FiShoppingCart } from "react-icons/fi";
import { useState } from "react";
import useAxios from "../../Hooks/useAxios";
import Loading from "../../Components/Loading/Loading";
import { addToCart } from "../../CartUtils/cartUtils";

const FoodDetails = () => {
  const { foodId } = useParams();
  const axiosInstance = useAxios();
  const [quantity, setQuantity] = useState(1);

  // Fetch single food
  const { data: food, isLoading } = useQuery({
    queryKey: ["food", foodId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/foods/${foodId}`);
      return res.data;
    },
    enabled: !!foodId,
  });

  if (isLoading) return <Loading />;

  // Calculate discounted price
  const discountedPrice =
    food.discount > 0
      ? food.price - (food.price * food.discount) / 100
      : food.price;

  const handleAddToCart = () => {
    addToCart(food._id, quantity);
    setQuantity(1);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Section - Images */}
        <div>
          <div className="w-full h-80 border relative rounded-lg overflow-hidden">
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover"
            />
            {food.discount > 0 && (
              <span className="absolute top-2 right-2 bg-secondary text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                {food.discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right Section - Details */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-primary">{food.name}</h2>

          <p className="text-gray-700 text-sm leading-relaxed">{food.description}</p>

          {/* Price + Discount */}
          <div className="text-xl">
            {food.discount > 0 ? (
              <div className="space-x-2">
                <span className="text-green-600 font-semibold">
                  ৳ {discountedPrice.toFixed(2)}
                </span>
                <span className="line-through text-lg text-gray-400">
                  ৳ {food.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-green-600 font-semibold">
                ৳ {food.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Availability */}
          <p className="text-md">
            <strong>Status:</strong>{" "}
            {food.available ? (
              <span className="text-green-600 font-semibold">Available</span>
            ) : (
              <span className="text-red-600 font-semibold">Unavailable</span>
            )}
          </p>

          {/* Rating */}
          {/* <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`${
                  i < Math.round(food.rating || 0)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-gray-600 text-sm">
              {food.rating ? food.rating.toFixed(1) : "No ratings yet"}
            </span>
          </div> */}

          {/* Quantity Selector + Add to Cart */}
          {food.available && (
            <div className="mt-6 flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-400 rounded-lg">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity === 1}
                  className="px-3 cursor-pointer disabled:cursor-no-drop py-2 text-xl font-bold disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3 cursor-pointer py-2 text-xl font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="btn btn-primary text-white flex items-center"
              >
                <FiShoppingCart size={18} className="mr-2" /> Add to Cart
              </button>
            </div>
          )}

          {!food.available && (
            <button className="btn btn-disabled mt-6">
              Currently Unavailable
            </button>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h3 className="text-3xl sm:text-4xl font-semibold mb-4 text-center">
          Reviews
        </h3>
        {/* {food.reviews?.length > 0 ? (
          <div className="space-y-4">
            {food.reviews.map((review, i) => (
              <div key={i} className="border p-3 rounded-lg shadow-sm">
                <p className="font-semibold">{review.userName}</p>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, j) => (
                    <FiStar
                      key={j}
                      className={`${
                        j < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet.</p>
        )} */}
      </div>
    </div>
  );
};

export default FoodDetails;
