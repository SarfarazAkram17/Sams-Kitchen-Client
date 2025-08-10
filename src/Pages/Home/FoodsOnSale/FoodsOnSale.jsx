import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import useAxios from "../../../Hooks/useAxios";
import Loading from "../../../Components/Loading/Loading";
import useAuth from "../../../Hooks/useAuth";
import { toast } from "react-toastify";
import { addToCart } from "../../../CartUtils/cartUtils";
import FoodCard from "../../../Components/Shared/FoodCard";

const FoodsOnSale = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const axiosInstance = useAxios();

  // Fetch foods with pagination
  const { data: foods = [], isLoading } = useQuery({
    queryKey: ["randomOfferFoods"],
    queryFn: async () => {
      const res = await axiosInstance.get("/foods/offer/random");
      return res.data;
    },
    keepPreviousData: true,
  });

  if (isLoading) return <Loading />;

  const handleAddToCart = (food) => {
    if (!user) {
      navigate("/login", { state: location.pathname });
      toast.info("Login first");
      return;
    }

    addToCart(food._id);
  };

  return (
    <div className="px-4 py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-10">
          Foods on sale
        </h2>

        {foods.length === 0 ? (
          <p className="text-center text-lg text-gray-600">
            No foods on sale yet.
          </p>
        ) : (
          <>
            {/* Foods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {foods.map((food) => {
                const discountedPrice =
                  food.discount > 0
                    ? food.price - (food.price * food.discount) / 100
                    : food.price;

                return (
                  <FoodCard
                    key={food._id}
                    food={food}
                    discountedPrice={discountedPrice}
                    handleAddToCart={handleAddToCart}
                  ></FoodCard>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FoodsOnSale;
